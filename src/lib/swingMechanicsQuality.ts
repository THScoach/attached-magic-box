/**
 * Swing Mechanics Quality Scoring System
 * 
 * Evaluates swing quality across three dimensions:
 * - Direction (40%): Where is momentum directed?
 * - Timing (35%): When does momentum peak?
 * - Efficiency (25%): How well is momentum transferred?
 */

export interface SwingMechanicsQuality {
  overallScore: number;
  directionScore: number;
  timingScore: number;
  efficiencyScore: number;
  predictedBatSpeedRange: string;
  qualityLevel: 'elite' | 'good' | 'developing' | 'poor';
  feedback: {
    direction: string;
    timing: string;
    efficiency: string;
    bottomLine: string;
  };
}

/**
 * Calculate Direction Score (0-100)
 * Measures how well bat path is aligned toward the field
 */
export function calculateDirectionScore(
  attackAngle: number,
  batPathPlane: number,
  connectionQuality: number
): number {
  // 1. Attack Angle Score (0-100)
  // Optimal: 5-15 degrees upward
  let attackScore: number;
  if (attackAngle >= 5 && attackAngle <= 15) {
    attackScore = 100;
  } else if (attackAngle >= 0 && attackAngle < 5) {
    attackScore = 100 - ((5 - attackAngle) * 5);
  } else if (attackAngle > 15 && attackAngle <= 25) {
    attackScore = 100 - ((attackAngle - 15) * 3);
  } else if (attackAngle < 0) {
    attackScore = Math.max(0, 50 + (attackAngle * 5));
  } else {
    attackScore = Math.max(0, 70 - ((attackAngle - 25) * 5));
  }

  // 2. Bat Path Plane Score (0-100)
  // Optimal: 5-15 degrees upward through zone
  let pathScore: number;
  if (batPathPlane >= 5 && batPathPlane <= 15) {
    pathScore = 100;
  } else if (batPathPlane >= 0 && batPathPlane < 5) {
    pathScore = 100 - ((5 - batPathPlane) * 5);
  } else if (batPathPlane > 15 && batPathPlane <= 25) {
    pathScore = 100 - ((batPathPlane - 15) * 3);
  } else if (batPathPlane < 0) {
    pathScore = Math.max(0, 50 + (batPathPlane * 5));
  } else {
    pathScore = Math.max(0, 70 - ((batPathPlane - 25) * 5));
  }

  // 3. Connection Quality Score (already 0-100)
  // Combine scores
  const directionScore = (attackScore * 0.40) + (pathScore * 0.35) + (connectionQuality * 0.25);
  
  return Math.round(directionScore * 10) / 10;
}

/**
 * Calculate Timing Score (0-100)
 * Measures how well kinematic sequence creates momentum at the right time
 */
export function calculateTimingScore(
  tempoRatio: number,
  sequenceQuality: number,
  accelerationPattern: number
): number {
  // 1. Tempo Ratio Score (0-100)
  // Optimal: 2.3-2.7:1 (elite MLB range)
  let tempoScore: number;
  if (tempoRatio >= 2.3 && tempoRatio <= 2.7) {
    tempoScore = 100;
  } else if (tempoRatio >= 2.0 && tempoRatio < 2.3) {
    tempoScore = 100 - ((2.3 - tempoRatio) * 20);
  } else if (tempoRatio > 2.7 && tempoRatio <= 3.0) {
    tempoScore = 100 - ((tempoRatio - 2.7) * 15);
  } else if (tempoRatio >= 1.5 && tempoRatio < 2.0) {
    tempoScore = Math.max(50, 100 - ((2.3 - tempoRatio) * 25));
  } else if (tempoRatio > 3.0 && tempoRatio <= 3.5) {
    tempoScore = Math.max(50, 100 - ((tempoRatio - 2.7) * 20));
  } else {
    tempoScore = Math.max(30, 50 - Math.abs(tempoRatio - 2.5) * 10);
  }

  // 2. Sequence Quality Score (already 0-100)
  // 3. Acceleration Pattern Score (already 0-100)
  
  // Combine scores
  const timingScore = (tempoScore * 0.40) + (sequenceQuality * 0.35) + (accelerationPattern * 0.25);
  
  return Math.round(timingScore * 10) / 10;
}

/**
 * Calculate Efficiency Score (0-100)
 * Measures how efficiently body transfers rotational energy
 */
export function calculateEfficiencyScore(
  hipShoulderSeparation: number,
  connectionQuality: number,
  balanceScore: number
): number {
  // 1. Hip-Shoulder Separation Score (0-100)
  // Optimal: 40-50 degrees (game data)
  let separationScore: number;
  if (hipShoulderSeparation >= 40 && hipShoulderSeparation <= 50) {
    separationScore = 100;
  } else if (hipShoulderSeparation >= 35 && hipShoulderSeparation < 40) {
    separationScore = 100 - ((40 - hipShoulderSeparation) * 4);
  } else if (hipShoulderSeparation > 50 && hipShoulderSeparation <= 55) {
    separationScore = 100 - ((hipShoulderSeparation - 50) * 2);
  } else if (hipShoulderSeparation >= 30 && hipShoulderSeparation < 35) {
    separationScore = Math.max(60, 100 - ((40 - hipShoulderSeparation) * 5));
  } else if (hipShoulderSeparation > 55 && hipShoulderSeparation <= 60) {
    separationScore = Math.max(85, 100 - ((hipShoulderSeparation - 50) * 3));
  } else if (hipShoulderSeparation < 30) {
    separationScore = Math.max(40, 60 - ((30 - hipShoulderSeparation) * 2));
  } else {
    separationScore = Math.max(70, 100 - ((hipShoulderSeparation - 50) * 4));
  }

  // 2. Connection Quality Score (already 0-100)
  // 3. Balance Score (already 0-100)
  
  // Combine scores
  const efficiencyScore = (separationScore * 0.40) + (connectionQuality * 0.35) + (balanceScore * 0.25);
  
  return Math.round(efficiencyScore * 10) / 10;
}

/**
 * Calculate Overall Swing Mechanics Quality Score
 */
export function calculateSwingMechanicsQuality(
  directionScore: number,
  timingScore: number,
  efficiencyScore: number,
  predictedBatSpeed?: number
): SwingMechanicsQuality {
  // Calculate overall score
  const overallScore = Math.round(
    ((directionScore * 0.40) + (timingScore * 0.35) + (efficiencyScore * 0.25)) * 10
  ) / 10;

  // Determine quality level
  let qualityLevel: 'elite' | 'good' | 'developing' | 'poor';
  if (overallScore >= 90) {
    qualityLevel = 'elite';
  } else if (overallScore >= 75) {
    qualityLevel = 'good';
  } else if (overallScore >= 60) {
    qualityLevel = 'developing';
  } else {
    qualityLevel = 'poor';
  }

  // Determine predicted bat speed range
  let predictedBatSpeedRange: string;
  if (predictedBatSpeed) {
    const lower = Math.round(predictedBatSpeed - 2.5);
    const upper = Math.round(predictedBatSpeed + 2.5);
    predictedBatSpeedRange = `${lower}-${upper} mph`;
  } else if (overallScore >= 90) {
    predictedBatSpeedRange = '75-80 mph';
  } else if (overallScore >= 75) {
    predictedBatSpeedRange = '70-78 mph';
  } else if (overallScore >= 60) {
    predictedBatSpeedRange = '68-75 mph';
  } else {
    predictedBatSpeedRange = '65-72 mph';
  }

  // Generate feedback
  const feedback = generateFeedback(
    qualityLevel,
    directionScore,
    timingScore,
    efficiencyScore
  );

  return {
    overallScore,
    directionScore,
    timingScore,
    efficiencyScore,
    predictedBatSpeedRange,
    qualityLevel,
    feedback,
  };
}

/**
 * Generate feedback text based on scores
 */
function generateFeedback(
  qualityLevel: 'elite' | 'good' | 'developing' | 'poor',
  directionScore: number,
  timingScore: number,
  efficiencyScore: number
): SwingMechanicsQuality['feedback'] {
  // Direction feedback
  let direction: string;
  if (directionScore >= 90) {
    direction = 'Your bat path is aligned perfectly toward the field. Hands stay inside, creating a long contact zone.';
  } else if (directionScore >= 75) {
    direction = 'Your bat path is good, but hands occasionally drift away from your body (casting).';
  } else if (directionScore >= 60) {
    direction = 'Your bat path is too steep or inconsistent. Hands are casting, wasting momentum.';
  } else {
    direction = 'Your bat path needs significant work. Inconsistent angles and poor connection waste 30-40% of momentum.';
  }

  // Timing feedback
  let timing: string;
  if (timingScore >= 90) {
    timing = 'Your kinematic sequence is excellent - body segments fire in perfect order, peaking right at contact.';
  } else if (timingScore >= 75) {
    timing = 'Your tempo is slightly quick. Body segments peak about 50ms before contact.';
  } else if (timingScore >= 60) {
    timing = 'Your tempo is too quick. Not enough time to create separation and build momentum.';
  } else {
    timing = 'Your tempo is very rushed. Body segments peak 150ms before contact, losing 10-15 mph at impact.';
  }

  // Efficiency feedback
  let efficiency: string;
  if (efficiencyScore >= 90) {
    efficiency = 'Your body transfers rotational energy very efficiently. Great separation, connection, and balance.';
  } else if (efficiencyScore >= 75) {
    efficiency = 'Good hip-shoulder separation, but connection could be better when hands cast out.';
  } else if (efficiencyScore >= 60) {
    efficiency = 'Limited hip-shoulder separation (32-35°). Connection is inconsistent, balance issues.';
  } else {
    efficiency = 'Minimal separation (<30°). Swinging mostly with arms. Poor connection and balance.';
  }

  // Bottom line
  let bottomLine: string;
  if (qualityLevel === 'elite') {
    bottomLine = "You don't need to swing faster - you're already using your mechanics incredibly well.";
  } else if (qualityLevel === 'good') {
    bottomLine = 'Improving these areas will help you hit the ball 5-10 mph harder WITHOUT increasing raw speed.';
  } else if (qualityLevel === 'developing') {
    bottomLine = 'Focus on these areas for 4-6 weeks to improve effective bat speed by 8-12 mph.';
  } else {
    bottomLine = 'These fundamental issues need 8-12 weeks of work. Fixing them will add 15-20 mph to effective bat speed.';
  }

  return {
    direction,
    timing,
    efficiency,
    bottomLine,
  };
}
