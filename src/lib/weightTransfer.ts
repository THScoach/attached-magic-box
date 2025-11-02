import { FrameJointData } from './poseAnalysis';

export interface WeightTransferScore {
  overall_score: number;
  overall_status: 'elite' | 'good' | 'developing' | 'beginner' | 'critical';
  vertical_movement: number | null;
  vertical_score: number;
  vertical_status: string;
  timing_peak: number | null; // seconds before contact
  timing_score: number;
  timing_status: string;
  back_foot_lift: number | null; // seconds relative to contact (negative = before, positive = after)
  back_foot_score: number;
  back_foot_status: string;
  acceleration_peak: number | null; // m/s²
  acceleration_score: number;
  acceleration_status: string;
  insight: string;
  recommended_drill: string;
}

function scoreVerticalMovement(inches: number): { score: number; status: string } {
  if (inches >= 2 && inches <= 3) {
    return { score: 100, status: 'Elite - Stays low, connected to ground' };
  } else if (inches > 3 && inches <= 4) {
    return { score: 85, status: 'Good - Minimal rise' };
  } else if (inches > 4 && inches <= 5) {
    return { score: 70, status: 'Developing - Slight jumping tendency' };
  } else if (inches > 5 && inches <= 7) {
    return { score: 50, status: 'Beginner - Jumping tendency' };
  } else {
    return { score: 25, status: 'Critical - Severe jumping, losing connection' };
  }
}

function scoreTiming(secondsBeforeContact: number): { score: number; status: string } {
  const sec = secondsBeforeContact;
  if (sec >= 0.10 && sec <= 0.15) {
    return { score: 100, status: 'Elite - Perfect timing, momentum at contact' };
  } else if ((sec >= 0.08 && sec < 0.10) || (sec > 0.15 && sec <= 0.18)) {
    return { score: 85, status: 'Good - Acceptable timing window' };
  } else if ((sec >= 0.05 && sec < 0.08) || (sec > 0.18 && sec <= 0.22)) {
    return { score: 70, status: 'Developing - Slightly off timing' };
  } else if ((sec >= 0.03 && sec < 0.05) || (sec > 0.22 && sec <= 0.28)) {
    return { score: 50, status: 'Beginner - Poor timing, losing momentum' };
  } else {
    return { score: 25, status: 'Critical - Way too early or late' };
  }
}

function scoreBackFootLift(secondsRelativeToContact: number): { score: number; status: string } {
  const sec = secondsRelativeToContact;
  // Positive = after contact (good), Negative = before contact (bad)
  if (sec >= 0.05 && sec <= 0.10) {
    return { score: 100, status: 'Elite - Maintained connection through contact' };
  } else if (sec >= 0.00 && sec < 0.05) {
    return { score: 85, status: 'Good - Slight early lift but acceptable' };
  } else if (sec >= -0.05 && sec < 0.00) {
    return { score: 70, status: 'Developing - Lifting early, losing connection' };
  } else if (sec >= -0.10 && sec < -0.05) {
    return { score: 50, status: 'Beginner - Lost connection, jumping off back foot' };
  } else {
    return { score: 25, status: 'Critical - Severe jumping, no connection at contact' };
  }
}

function scoreAcceleration(peakAccel: number, timingBeforeContact: number): { score: number; status: string } {
  if (peakAccel >= 5 && peakAccel <= 8 && timingBeforeContact >= 0.15 && timingBeforeContact <= 0.25) {
    return { score: 100, status: 'Elite - Controlled, sustained acceleration' };
  } else if ((peakAccel >= 8 && peakAccel <= 10) && 
             ((timingBeforeContact >= 0.12 && timingBeforeContact < 0.15) || 
              (timingBeforeContact > 0.25 && timingBeforeContact <= 0.30))) {
    return { score: 85, status: 'Good - Slightly aggressive but controlled' };
  } else if ((peakAccel >= 10 && peakAccel <= 12) && 
             ((timingBeforeContact >= 0.08 && timingBeforeContact < 0.12) || 
              (timingBeforeContact > 0.30 && timingBeforeContact <= 0.35))) {
    return { score: 70, status: 'Developing - Too explosive or poor timing' };
  } else if (peakAccel >= 12 && peakAccel <= 15) {
    return { score: 50, status: 'Beginner - Way too aggressive, indicates jumping' };
  } else {
    return { score: 25, status: 'Critical - Explosive burst causing jumping' };
  }
}

function calculateVerticalMovement(frameData: FrameJointData[]): number | null {
  if (frameData.length === 0) return null;
  
  // Track COM Y-coordinate (approximate from hip center)
  let minY = Infinity;
  let maxY = -Infinity;
  
  for (const frame of frameData) {
    const leftHip = frame.joints['left_hip'];
    const rightHip = frame.joints['right_hip'];
    
    if (leftHip && rightHip && leftHip.confidence > 0.5 && rightHip.confidence > 0.5) {
      const comY = (leftHip.y + rightHip.y) / 2;
      minY = Math.min(minY, comY);
      maxY = Math.max(maxY, comY);
    }
  }
  
  if (minY === Infinity || maxY === -Infinity) return null;
  
  // Convert pixels to inches (rough estimate: ~100 pixels per meter, ~39.37 inches per meter)
  const verticalPixels = maxY - minY;
  const verticalInches = (verticalPixels / 100) * 39.37;
  
  return verticalInches;
}

function calculateCOMTimingPattern(frameData: FrameJointData[]): { peak: number | null; timing: number | null } {
  if (frameData.length === 0) return { peak: null, timing: null };
  
  // Find contact frame
  const contactFrame = frameData.find(f => f.phase === 'contact') || frameData[Math.floor(frameData.length * 0.8)];
  const contactTime = contactFrame.timestamp / 1000; // Convert to seconds
  
  // Track forward velocity (X-direction) from hip movement
  let peakVelocity = 0;
  let peakTime = 0;
  
  for (let i = 1; i < frameData.length; i++) {
    const prevFrame = frameData[i - 1];
    const currFrame = frameData[i];
    
    const prevLeftHip = prevFrame.joints['left_hip'];
    const prevRightHip = prevFrame.joints['right_hip'];
    const currLeftHip = currFrame.joints['left_hip'];
    const currRightHip = currFrame.joints['right_hip'];
    
    if (prevLeftHip && prevRightHip && currLeftHip && currRightHip) {
      const prevComX = (prevLeftHip.x + prevRightHip.x) / 2;
      const currComX = (currLeftHip.x + currRightHip.x) / 2;
      
      const deltaX = currComX - prevComX;
      const deltaT = (currFrame.timestamp - prevFrame.timestamp) / 1000;
      
      if (deltaT > 0) {
        const velocity = Math.abs(deltaX / deltaT); // pixels per second
        
        if (velocity > peakVelocity) {
          peakVelocity = velocity;
          peakTime = currFrame.timestamp / 1000;
        }
      }
    }
  }
  
  const timingBeforeContact = contactTime - peakTime;
  
  return { 
    peak: peakVelocity, 
    timing: timingBeforeContact 
  };
}

function calculateBackFootLift(frameData: FrameJointData[]): number | null {
  if (frameData.length === 0) return null;
  
  // Find contact frame
  const contactFrame = frameData.find(f => f.phase === 'contact') || frameData[Math.floor(frameData.length * 0.8)];
  const contactTime = contactFrame.timestamp / 1000;
  
  // Track rear ankle/heel Y-coordinate
  // Find baseline during stance
  const stanceFrames = frameData.filter(f => f.phase === 'stance' || f.phase === 'load');
  if (stanceFrames.length === 0) return null;
  
  let baselineY = 0;
  let baselineCount = 0;
  
  for (const frame of stanceFrames) {
    const rearAnkle = frame.joints['right_ankle'] || frame.joints['left_ankle'];
    if (rearAnkle && rearAnkle.confidence > 0.5) {
      baselineY += rearAnkle.y;
      baselineCount++;
    }
  }
  
  if (baselineCount === 0) return null;
  baselineY /= baselineCount;
  
  // Find when toe lifts (Y increases significantly)
  let toeLiftTime: number | null = null;
  
  for (const frame of frameData) {
    if (frame.phase === 'fire' || frame.phase === 'contact' || frame.phase === 'follow_through') {
      const rearAnkle = frame.joints['right_ankle'] || frame.joints['left_ankle'];
      
      if (rearAnkle && rearAnkle.confidence > 0.5) {
        const liftAmount = baselineY - rearAnkle.y; // Positive = lifted
        const liftInches = (liftAmount / 100) * 39.37;
        
        if (liftInches > 4) { // Toe lifted >4 inches
          toeLiftTime = frame.timestamp / 1000;
          break;
        }
      }
    }
  }
  
  if (toeLiftTime === null) {
    // Toe never lifted significantly - excellent connection
    return 0.10; // Treat as lifting after contact
  }
  
  return toeLiftTime - contactTime; // Positive = after, Negative = before
}

function calculateCOMAcceleration(frameData: FrameJointData[]): { peak: number | null; timing: number | null } {
  if (frameData.length < 3) return { peak: null, timing: null };
  
  const contactFrame = frameData.find(f => f.phase === 'contact') || frameData[Math.floor(frameData.length * 0.8)];
  const contactTime = contactFrame.timestamp / 1000;
  
  let peakAcceleration = 0;
  let peakAccelTime = 0;
  
  for (let i = 2; i < frameData.length; i++) {
    const f1 = frameData[i - 2];
    const f2 = frameData[i - 1];
    const f3 = frameData[i];
    
    const h1L = f1.joints['left_hip'];
    const h1R = f1.joints['right_hip'];
    const h2L = f2.joints['left_hip'];
    const h2R = f2.joints['right_hip'];
    const h3L = f3.joints['left_hip'];
    const h3R = f3.joints['right_hip'];
    
    if (h1L && h1R && h2L && h2R && h3L && h3R) {
      const x1 = (h1L.x + h1R.x) / 2;
      const x2 = (h2L.x + h2R.x) / 2;
      const x3 = (h3L.x + h3R.x) / 2;
      
      const t1 = f1.timestamp / 1000;
      const t2 = f2.timestamp / 1000;
      const t3 = f3.timestamp / 1000;
      
      const v1 = (x2 - x1) / (t2 - t1);
      const v2 = (x3 - x2) / (t3 - t2);
      
      const accel = Math.abs((v2 - v1) / (t3 - t1));
      const accelMetric = (accel / 100) * 39.37; // Convert to m/s²
      
      if (accelMetric > peakAcceleration) {
        peakAcceleration = accelMetric;
        peakAccelTime = t2;
      }
    }
  }
  
  const timingBeforeContact = contactTime - peakAccelTime;
  
  return { 
    peak: peakAcceleration, 
    timing: timingBeforeContact 
  };
}

export function calculateWeightTransfer(frameData: FrameJointData[]): WeightTransferScore | null {
  if (frameData.length === 0) return null;
  
  // Calculate vertical movement
  const verticalMovement = calculateVerticalMovement(frameData);
  const verticalResult = verticalMovement ? scoreVerticalMovement(verticalMovement) : { score: 0, status: 'No data' };
  
  // Calculate COM timing pattern
  const { timing: comTiming } = calculateCOMTimingPattern(frameData);
  const timingResult = comTiming ? scoreTiming(comTiming) : { score: 0, status: 'No data' };
  
  // Calculate back foot lift
  const backFootLift = calculateBackFootLift(frameData);
  const backFootResult = backFootLift !== null ? scoreBackFootLift(backFootLift) : { score: 0, status: 'No data' };
  
  // Calculate COM acceleration
  const { peak: accelPeak, timing: accelTiming } = calculateCOMAcceleration(frameData);
  const accelResult = (accelPeak && accelTiming) 
    ? scoreAcceleration(accelPeak, accelTiming) 
    : { score: 0, status: 'No data' };
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    (verticalResult.score * 0.25) +
    (timingResult.score * 0.35) +
    (backFootResult.score * 0.25) +
    (accelResult.score * 0.15)
  );
  
  // Determine overall status
  let overallStatus: WeightTransferScore['overall_status'];
  if (overallScore >= 90) overallStatus = 'elite';
  else if (overallScore >= 80) overallStatus = 'good';
  else if (overallScore >= 65) overallStatus = 'developing';
  else if (overallScore >= 45) overallStatus = 'beginner';
  else overallStatus = 'critical';
  
  // Generate insight
  let insight = '';
  if (verticalResult.score < 85 && verticalMovement && verticalMovement > 4) {
    insight = `You're jumping off your back foot (${verticalMovement.toFixed(1)}" vertical rise). Stay connected to the ground - this will add 3-5 mph bat speed by maintaining power transfer.`;
  } else if (backFootResult.score < 85 && backFootLift !== null && backFootLift < 0) {
    insight = `Your back toe lifts ${Math.abs(backFootLift).toFixed(2)} seconds before contact. Keep it down through contact to maintain connection and maximize power.`;
  } else if (timingResult.score < 85 && comTiming) {
    if (comTiming > 0.18) {
      insight = `Your COM peaks too early (${comTiming.toFixed(2)}s before contact). You're already slowing down at impact. Delay your weight shift slightly for peak momentum at contact.`;
    } else {
      insight = `Your COM peaks too late (${comTiming.toFixed(2)}s before contact). Start your weight transfer earlier to build momentum for contact.`;
    }
  } else if (accelResult.score < 85 && accelPeak && accelPeak > 10) {
    insight = `Your acceleration is too explosive (${accelPeak.toFixed(1)} m/s²). A smoother, more controlled transfer (5-8 m/s²) will improve consistency and prevent jumping.`;
  } else {
    insight = `Your weight transfer mechanics are solid! You're staying connected and transferring power efficiently from back foot to front foot.`;
  }
  
  return {
    overall_score: overallScore,
    overall_status: overallStatus,
    vertical_movement: verticalMovement,
    vertical_score: verticalResult.score,
    vertical_status: verticalResult.status,
    timing_peak: comTiming,
    timing_score: timingResult.score,
    timing_status: timingResult.status,
    back_foot_lift: backFootLift,
    back_foot_score: backFootResult.score,
    back_foot_status: backFootResult.status,
    acceleration_peak: accelPeak,
    acceleration_score: accelResult.score,
    acceleration_status: accelResult.status,
    insight,
    recommended_drill: 'Back Foot Connection Drill: Place towel under back toe, take 20 swings daily maintaining contact through impact'
  };
}
