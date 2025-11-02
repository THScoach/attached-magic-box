import { FrameJointData } from './poseAnalysis';

export interface FrontLegStabilityScore {
  overall_score: number;
  overall_status: 'elite' | 'good' | 'developing' | 'beginner' | 'critical';
  knee_angle: number | null;
  knee_score: number;
  knee_status: string;
  ankle_angle: number | null;
  ankle_score: number;
  ankle_status: string;
  deceleration_rate: number | null;
  deceleration_score: number;
  deceleration_status: string;
  insight: string;
  recommended_drill: string;
}

function scoreKneeAngle(angle: number): { score: number; status: string } {
  if (angle >= 145 && angle <= 160) {
    return { score: 100, status: 'Elite - Firm but not locked, optimal stability' };
  } else if ((angle >= 140 && angle < 145) || (angle > 160 && angle <= 165)) {
    return { score: 85, status: 'Good - Slightly soft or slightly stiff' };
  } else if ((angle >= 135 && angle < 140) || (angle > 165 && angle <= 170)) {
    return { score: 70, status: 'Developing - Too soft or too stiff, losing power' };
  } else if ((angle >= 130 && angle < 135) || (angle > 170 && angle <= 175)) {
    return { score: 50, status: 'Beginner - Significant stability issue' };
  } else {
    return { score: 25, status: 'Critical - Severe stability problem' };
  }
}

function scoreAnkleAngle(angle: number): { score: number; status: string } {
  if (angle >= 10 && angle <= 15) {
    return { score: 100, status: 'Elite - Optimal forward shin angle' };
  } else if ((angle >= 8 && angle < 10) || (angle > 15 && angle <= 18)) {
    return { score: 85, status: 'Good - Acceptable range' };
  } else if ((angle >= 5 && angle < 8) || (angle > 18 && angle <= 22)) {
    return { score: 70, status: 'Developing - Too upright or too forward' };
  } else if ((angle >= 3 && angle < 5) || (angle > 22 && angle <= 25)) {
    return { score: 50, status: 'Beginner - Poor base' };
  } else {
    return { score: 25, status: 'Critical - Falling backward or forward' };
  }
}

function scoreDecelerationRate(rate: number): { score: number; status: string } {
  if (rate > 10) {
    return { score: 100, status: 'Elite - Rapid plant, firm post' };
  } else if (rate >= 8 && rate <= 10) {
    return { score: 85, status: 'Good - Quick plant' };
  } else if (rate >= 6 && rate < 8) {
    return { score: 70, status: 'Developing - Slow plant' };
  } else if (rate >= 4 && rate < 6) {
    return { score: 50, status: 'Beginner - Very slow plant' };
  } else {
    return { score: 25, status: 'Critical - No plant, leg keeps drifting' };
  }
}

function calculateDecelerationRate(frameData: FrameJointData[]): number | null {
  const strideFrames = frameData.filter(f => f.phase === 'stride' || f.phase === 'fire');
  
  if (strideFrames.length < 3) return null;
  
  // Find lead ankle velocities
  let peakVelocity = 0;
  let peakFrameIndex = 0;
  
  for (let i = 0; i < strideFrames.length; i++) {
    const leadAnkleVel = strideFrames[i].velocities.find(v => 
      v.name.includes('ankle_velocity') && v.name.includes('lead')
    );
    
    if (leadAnkleVel && leadAnkleVel.velocity > peakVelocity) {
      peakVelocity = leadAnkleVel.velocity;
      peakFrameIndex = i;
    }
  }
  
  if (peakVelocity === 0) return null;
  
  // Find when velocity drops to near zero (planted)
  let plantFrameIndex = peakFrameIndex;
  for (let i = peakFrameIndex + 1; i < strideFrames.length; i++) {
    const leadAnkleVel = strideFrames[i].velocities.find(v => 
      v.name.includes('ankle_velocity') && v.name.includes('lead')
    );
    
    if (leadAnkleVel && leadAnkleVel.velocity < 0.2) {
      plantFrameIndex = i;
      break;
    }
  }
  
  const timeToStop = (strideFrames[plantFrameIndex].timestamp - strideFrames[peakFrameIndex].timestamp) / 1000;
  
  if (timeToStop <= 0) return null;
  
  return peakVelocity / timeToStop;
}

export function calculateFrontLegStability(frameData: FrameJointData[]): FrontLegStabilityScore | null {
  if (frameData.length === 0) return null;
  
  // Find contact frame
  const contactFrame = frameData.find(f => f.phase === 'contact') || frameData[Math.floor(frameData.length * 0.8)];
  
  // Extract knee angle at contact
  const kneeAngleData = contactFrame.angles.find(a => a.name === 'lead_knee_angle');
  const kneeAngle = kneeAngleData?.angle || null;
  const kneeResult = kneeAngle ? scoreKneeAngle(kneeAngle) : { score: 0, status: 'No data' };
  
  // Extract ankle angle at contact
  const ankleAngleData = contactFrame.angles.find(a => a.name === 'lead_ankle_angle');
  const ankleAngle = ankleAngleData?.angle || null;
  const ankleResult = ankleAngle ? scoreAnkleAngle(ankleAngle) : { score: 0, status: 'No data' };
  
  // Calculate deceleration rate
  const decelerationRate = calculateDecelerationRate(frameData);
  const decelerationResult = decelerationRate ? scoreDecelerationRate(decelerationRate) : { score: 0, status: 'No data' };
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    (kneeResult.score * 0.40) +
    (ankleResult.score * 0.30) +
    (decelerationResult.score * 0.30)
  );
  
  // Determine overall status
  let overallStatus: FrontLegStabilityScore['overall_status'];
  if (overallScore >= 90) overallStatus = 'elite';
  else if (overallScore >= 80) overallStatus = 'good';
  else if (overallScore >= 65) overallStatus = 'developing';
  else if (overallScore >= 45) overallStatus = 'beginner';
  else overallStatus = 'critical';
  
  // Generate insight
  let insight = '';
  if (kneeResult.score < 85) {
    if (kneeAngle && kneeAngle < 145) {
      insight = `Your front leg is too soft at contact (${kneeAngle.toFixed(0)}°). Firming it up to 145-160° will add 4-6 mph bat speed by creating a stable base for rotation.`;
    } else if (kneeAngle && kneeAngle > 160) {
      insight = `Your front leg is too stiff at contact (${kneeAngle.toFixed(0)}°). Slight flexion (145-160°) maintains stability while allowing proper energy transfer.`;
    }
  } else if (decelerationResult.score < 85) {
    insight = `Your front leg plant is too slow (${decelerationRate?.toFixed(1)} m/s²). A quicker, firmer plant (>10 m/s²) creates a stable post for explosive rotation.`;
  } else if (ankleResult.score < 85) {
    insight = `Your ankle angle (${ankleAngle?.toFixed(0)}°) affects weight distribution. Optimal 10-15° keeps weight on inside of foot for stable base.`;
  } else {
    insight = `Your front leg mechanics are solid! Continue maintaining firm (not locked) front leg stability for consistent power transfer.`;
  }
  
  return {
    overall_score: overallScore,
    overall_status: overallStatus,
    knee_angle: kneeAngle,
    knee_score: kneeResult.score,
    knee_status: kneeResult.status,
    ankle_angle: ankleAngle,
    ankle_score: ankleResult.score,
    ankle_status: ankleResult.status,
    deceleration_rate: decelerationRate,
    deceleration_score: decelerationResult.score,
    deceleration_status: decelerationResult.status,
    insight,
    recommended_drill: 'Front Leg Post-Up Drill: 20 swings daily for 2 weeks focusing on firm (not locked) front leg at contact'
  };
}
