/**
 * Momentum and Biomechanics Calculation Library
 * 
 * Based on research from:
 * - Welch et al. (1995) - Biomechanical Description of Baseball Hitting
 * - Fortenbaugh (2011) - Elite Database Study
 * - Physics principles for momentum, energy, and power calculations
 */

export interface SegmentPosition {
  x: number;
  y: number;
  frame: number;
  time: number; // seconds
}

export interface BodySegmentData {
  pelvis: SegmentPosition[];
  torso: SegmentPosition[];
  leadShoulder: SegmentPosition[];
  rearShoulder: SegmentPosition[];
  leadHand: SegmentPosition[];
  rearHand: SegmentPosition[];
  batKnob: SegmentPosition[];
  batBarrel: SegmentPosition[];
}

export interface PlayerPhysicalData {
  heightInches: number;
  weightLbs: number;
  age?: number;
  experienceLevel?: string;
}

export interface SwingPhases {
  stance: number;
  load: number;
  strideFootDown: number;
  launch: number;
  contact: number;
  extension: number;
}

export interface BiomechanicsMetrics {
  // Bat Speed
  batSpeed: number; // mph at contact
  peakBatSpeed: number; // mph maximum
  batSpeedAtImpact: number; // mph
  
  // Angular Velocities (degrees/second)
  pelvisAngularVelocity: number;
  torsoAngularVelocity: number;
  shoulderAngularVelocity: number;
  peakPelvisVelocity: number;
  peakTorsoVelocity: number;
  
  // Linear Momentum (slug-ft/s)
  pelvisLinearMomentum: number;
  torsoLinearMomentum: number;
  totalLinearMomentum: number;
  peakLinearMomentum: number;
  
  // Rotational Momentum (slug-ft²/s)
  pelvisRotationalMomentum: number;
  torsoRotationalMomentum: number;
  totalRotationalMomentum: number;
  
  // Kinetic Energy (ft-lb)
  translationalKE: number;
  rotationalKE: number;
  totalKineticEnergy: number;
  
  // Power Generation (horsepower)
  peakPower: number;
  averagePower: number;
  powerAtContact: number;
  
  // Efficiency Metrics
  energyTransferEfficiency: number; // 0-100%
  sequencingEfficiency: number; // 0-100%
  momentumRetention: number; // 0-100%
  
  // Detailed Frame Data
  frameByFrameMetrics?: FrameMetrics[];
}

export interface FrameMetrics {
  frame: number;
  time: number;
  batSpeed: number;
  linearMomentum: number;
  rotationalMomentum: number;
  kineticEnergy: number;
  power: number;
}

// Anthropometric Constants (based on research)
const SEGMENT_MASS_RATIOS = {
  pelvis: 0.142, // 14.2% of body mass
  torso: 0.497,  // 49.7% of body mass (includes head, arms, trunk)
  upperArm: 0.028, // 2.8% per arm
  forearm: 0.016, // 1.6% per arm
  hand: 0.006, // 0.6% per hand
};

const BAT_WEIGHT_LBS = 2.0; // Average bat weight
const BAT_LENGTH_INCHES = 34; // Average bat length

/**
 * Calculate pixel to feet ratio using bat length as reference
 */
export function calibratePixelToFeet(batPixelLength: number): number {
  const batLengthFeet = BAT_LENGTH_INCHES / 12;
  return batLengthFeet / batPixelLength;
}

/**
 * Calculate distance between two points in pixels
 */
function calculateDistance(p1: SegmentPosition, p2: SegmentPosition): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Calculate velocity from position data (pixels per frame -> feet per second)
 */
function calculateVelocity(
  positions: SegmentPosition[], 
  frameIndex: number, 
  pixelToFeetRatio: number,
  frameRate: number
): number {
  if (frameIndex < 2 || frameIndex >= positions.length - 2) return 0;
  
  // Use central difference for more accurate velocity
  const p1 = positions[frameIndex - 2];
  const p2 = positions[frameIndex + 2];
  
  const distancePixels = calculateDistance(p1, p2);
  const distanceFeet = distancePixels * pixelToFeetRatio;
  const timeSeconds = 4 / frameRate; // 4 frames apart
  
  return distanceFeet / timeSeconds; // feet/second
}

/**
 * Calculate bat speed at contact
 */
export function calculateBatSpeed(
  barrelPositions: SegmentPosition[],
  contactFrame: number,
  pixelToFeetRatio: number,
  frameRate: number
): { batSpeed: number; peakBatSpeed: number; batSpeedAtImpact: number } {
  // Calculate speed at contact (5 frames before to contact)
  const preContactFrame = Math.max(0, contactFrame - 5);
  const preContactPos = barrelPositions[preContactFrame];
  const contactPos = barrelPositions[contactFrame];
  
  const distancePixels = calculateDistance(preContactPos, contactPos);
  const distanceFeet = distancePixels * pixelToFeetRatio;
  const timeSeconds = 5 / frameRate;
  
  const speedFPS = distanceFeet / timeSeconds;
  const batSpeed = speedFPS * 0.681818; // Convert fps to mph
  
  // Calculate peak bat speed (scan 10 frames before contact)
  let peakSpeed = batSpeed;
  for (let i = Math.max(0, contactFrame - 10); i <= contactFrame; i++) {
    const frameSpeed = calculateVelocity(barrelPositions, i, pixelToFeetRatio, frameRate) * 0.681818;
    if (frameSpeed > peakSpeed) peakSpeed = frameSpeed;
  }
  
  return {
    batSpeed,
    peakBatSpeed: peakSpeed,
    batSpeedAtImpact: batSpeed
  };
}

/**
 * Calculate angular velocity for a body segment
 */
export function calculateAngularVelocity(
  positions: SegmentPosition[],
  frameIndex: number,
  frameRate: number
): number {
  if (frameIndex < 2 || frameIndex >= positions.length - 2) return 0;
  
  const p1 = positions[frameIndex - 2];
  const p2 = positions[frameIndex];
  const p3 = positions[frameIndex + 2];
  
  // Calculate angles relative to horizontal
  const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  
  // Angular difference in radians
  let angleDiff = angle2 - angle1;
  
  // Normalize to [-π, π]
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
  
  // Convert to degrees per second
  const timeSeconds = 4 / frameRate;
  const degreesPerSecond = (angleDiff * 180 / Math.PI) / timeSeconds;
  
  return Math.abs(degreesPerSecond);
}

/**
 * Calculate segment mass in slugs (for imperial calculations)
 */
function calculateSegmentMass(weightLbs: number, massRatio: number): number {
  // Convert lbs to slugs (1 slug = 32.174 lbs)
  return (weightLbs * massRatio) / 32.174;
}

/**
 * Calculate linear momentum for a segment
 */
export function calculateLinearMomentum(
  positions: SegmentPosition[],
  frameIndex: number,
  segmentMass: number,
  pixelToFeetRatio: number,
  frameRate: number
): number {
  const velocity = calculateVelocity(positions, frameIndex, pixelToFeetRatio, frameRate);
  return segmentMass * velocity; // slug-ft/s
}

/**
 * Calculate moment of inertia for a segment (approximated as cylinder)
 */
function calculateMomentOfInertia(mass: number, radius: number): number {
  // I = 0.5 * m * r^2 for cylinder rotating about axis
  return 0.5 * mass * Math.pow(radius, 2);
}

/**
 * Calculate rotational momentum (angular momentum)
 */
export function calculateRotationalMomentum(
  angularVelocity: number, // degrees/second
  momentOfInertia: number
): number {
  // Convert angular velocity to radians/second
  const angularVelocityRad = angularVelocity * Math.PI / 180;
  return momentOfInertia * angularVelocityRad; // slug-ft²/s
}

/**
 * Calculate kinetic energy components
 */
export function calculateKineticEnergy(
  linearVelocity: number, // ft/s
  angularVelocity: number, // deg/s
  mass: number, // slugs
  momentOfInertia: number
): { translational: number; rotational: number; total: number } {
  // Translational KE = 0.5 * m * v^2
  const translational = 0.5 * mass * Math.pow(linearVelocity, 2);
  
  // Rotational KE = 0.5 * I * ω^2
  const angularVelocityRad = angularVelocity * Math.PI / 180;
  const rotational = 0.5 * momentOfInertia * Math.pow(angularVelocityRad, 2);
  
  return {
    translational,
    rotational,
    total: translational + rotational
  };
}

/**
 * Calculate power (rate of energy change)
 */
export function calculatePower(
  energy: number[], // array of energy values
  times: number[], // corresponding times
  frameIndex: number
): number {
  if (frameIndex < 2 || frameIndex >= energy.length - 2) return 0;
  
  const deltaEnergy = energy[frameIndex + 2] - energy[frameIndex - 2];
  const deltaTime = times[frameIndex + 2] - times[frameIndex - 2];
  
  if (deltaTime === 0) return 0;
  
  // Power in ft-lb/s, convert to horsepower (1 hp = 550 ft-lb/s)
  const powerFtLbPerSec = deltaEnergy / deltaTime;
  return powerFtLbPerSec / 550;
}

/**
 * Main biomechanics analysis function
 */
export function analyzeBiomechanics(
  bodySegmentData: BodySegmentData,
  swingPhases: SwingPhases,
  playerData: PlayerPhysicalData,
  pixelToFeetRatio: number,
  frameRate: number
): BiomechanicsMetrics {
  const { contact } = swingPhases;
  const { weightLbs, heightInches } = playerData;
  
  // Calculate segment masses
  const pelvisMass = calculateSegmentMass(weightLbs, SEGMENT_MASS_RATIOS.pelvis);
  const torsoMass = calculateSegmentMass(weightLbs, SEGMENT_MASS_RATIOS.torso);
  const batMass = BAT_WEIGHT_LBS / 32.174; // Convert to slugs
  
  // Estimate segment radii based on height
  const heightFeet = heightInches / 12;
  const pelvisRadius = heightFeet * 0.12; // ~12% of height
  const torsoRadius = heightFeet * 0.15; // ~15% of height
  const batRadius = (BAT_LENGTH_INCHES / 12) / 2;
  
  // Calculate moments of inertia
  const pelvisI = calculateMomentOfInertia(pelvisMass, pelvisRadius);
  const torsoI = calculateMomentOfInertia(torsoMass, torsoRadius);
  const batI = calculateMomentOfInertia(batMass, batRadius);
  
  // BAT SPEED
  const batSpeedMetrics = calculateBatSpeed(
    bodySegmentData.batBarrel,
    contact,
    pixelToFeetRatio,
    frameRate
  );
  
  // ANGULAR VELOCITIES at contact
  const pelvisAngularVel = calculateAngularVelocity(bodySegmentData.pelvis, contact, frameRate);
  const torsoAngularVel = calculateAngularVelocity(bodySegmentData.torso, contact, frameRate);
  const shoulderAngularVel = calculateAngularVelocity(bodySegmentData.leadShoulder, contact, frameRate);
  
  // Find peak angular velocities (scan 10 frames before contact)
  let peakPelvisVel = pelvisAngularVel;
  let peakTorsoVel = torsoAngularVel;
  
  for (let i = Math.max(0, contact - 10); i <= contact; i++) {
    const pVel = calculateAngularVelocity(bodySegmentData.pelvis, i, frameRate);
    const tVel = calculateAngularVelocity(bodySegmentData.torso, i, frameRate);
    
    if (pVel > peakPelvisVel) peakPelvisVel = pVel;
    if (tVel > peakTorsoVel) peakTorsoVel = tVel;
  }
  
  // LINEAR MOMENTUM at contact
  const pelvisLinearMom = calculateLinearMomentum(
    bodySegmentData.pelvis,
    contact,
    pelvisMass,
    pixelToFeetRatio,
    frameRate
  );
  
  const torsoLinearMom = calculateLinearMomentum(
    bodySegmentData.torso,
    contact,
    torsoMass,
    pixelToFeetRatio,
    frameRate
  );
  
  const totalLinearMom = pelvisLinearMom + torsoLinearMom;
  
  // Find peak linear momentum
  let peakLinearMom = totalLinearMom;
  for (let i = Math.max(0, contact - 10); i <= contact; i++) {
    const pMom = calculateLinearMomentum(bodySegmentData.pelvis, i, pelvisMass, pixelToFeetRatio, frameRate);
    const tMom = calculateLinearMomentum(bodySegmentData.torso, i, torsoMass, pixelToFeetRatio, frameRate);
    const totalMom = pMom + tMom;
    
    if (totalMom > peakLinearMom) peakLinearMom = totalMom;
  }
  
  // ROTATIONAL MOMENTUM at contact
  const pelvisRotationalMom = calculateRotationalMomentum(pelvisAngularVel, pelvisI);
  const torsoRotationalMom = calculateRotationalMomentum(torsoAngularVel, torsoI);
  const totalRotationalMom = pelvisRotationalMom + torsoRotationalMom;
  
  // KINETIC ENERGY at contact
  const pelvisVelocity = calculateVelocity(bodySegmentData.pelvis, contact, pixelToFeetRatio, frameRate);
  const torsoVelocity = calculateVelocity(bodySegmentData.torso, contact, pixelToFeetRatio, frameRate);
  
  const pelvisKE = calculateKineticEnergy(pelvisVelocity, pelvisAngularVel, pelvisMass, pelvisI);
  const torsoKE = calculateKineticEnergy(torsoVelocity, torsoAngularVel, torsoMass, torsoI);
  
  const totalTranslationalKE = pelvisKE.translational + torsoKE.translational;
  const totalRotationalKE = pelvisKE.rotational + torsoKE.rotational;
  const totalKE = totalTranslationalKE + totalRotationalKE;
  
  // POWER GENERATION
  // Calculate frame-by-frame energy for power calculation
  const energyProfile: number[] = [];
  const timeProfile: number[] = [];
  const frameMetrics: FrameMetrics[] = [];
  
  const startFrame = Math.max(0, swingPhases.launch);
  const endFrame = Math.min(contact + 5, bodySegmentData.pelvis.length - 1);
  
  for (let i = startFrame; i <= endFrame; i++) {
    const pVel = calculateVelocity(bodySegmentData.pelvis, i, pixelToFeetRatio, frameRate);
    const tVel = calculateVelocity(bodySegmentData.torso, i, pixelToFeetRatio, frameRate);
    const pAngVel = calculateAngularVelocity(bodySegmentData.pelvis, i, frameRate);
    const tAngVel = calculateAngularVelocity(bodySegmentData.torso, i, frameRate);
    
    const pKE = calculateKineticEnergy(pVel, pAngVel, pelvisMass, pelvisI);
    const tKE = calculateKineticEnergy(tVel, tAngVel, torsoMass, torsoI);
    const frameEnergy = pKE.total + tKE.total;
    
    energyProfile.push(frameEnergy);
    timeProfile.push(i / frameRate);
    
    const framePower = i > startFrame + 2 && i < endFrame - 2
      ? calculatePower(energyProfile, timeProfile, energyProfile.length - 1)
      : 0;
    
    frameMetrics.push({
      frame: i,
      time: i / frameRate,
      batSpeed: calculateVelocity(bodySegmentData.batBarrel, i, pixelToFeetRatio, frameRate) * 0.681818,
      linearMomentum: calculateLinearMomentum(bodySegmentData.pelvis, i, pelvisMass, pixelToFeetRatio, frameRate) +
                      calculateLinearMomentum(bodySegmentData.torso, i, torsoMass, pixelToFeetRatio, frameRate),
      rotationalMomentum: calculateRotationalMomentum(pAngVel, pelvisI) + calculateRotationalMomentum(tAngVel, torsoI),
      kineticEnergy: frameEnergy,
      power: framePower
    });
  }
  
  // Find peak and average power
  const peakPower = Math.max(...frameMetrics.map(f => f.power));
  const averagePower = frameMetrics.reduce((sum, f) => sum + f.power, 0) / frameMetrics.length;
  const powerAtContact = frameMetrics.find(f => f.frame === contact)?.power || 0;
  
  // EFFICIENCY METRICS
  
  // Energy Transfer Efficiency: How much of the body's energy transfers to bat
  const batVelocityAtContact = calculateVelocity(bodySegmentData.batBarrel, contact, pixelToFeetRatio, frameRate);
  const batKE = 0.5 * batMass * Math.pow(batVelocityAtContact, 2);
  const energyTransferEfficiency = Math.min(100, (batKE / totalKE) * 100);
  
  // Sequencing Efficiency: Based on proper pelvis -> torso -> bat progression
  const pelvisTiming = swingPhases.launch;
  const expectedTorsoDelay = 0.03; // 30ms
  const expectedBatDelay = 0.06; // 60ms
  
  // Find actual peak timings
  let peakPelvisFrame = pelvisTiming;
  let peakTorsoFrame = pelvisTiming;
  
  for (let i = pelvisTiming; i <= contact; i++) {
    if (calculateAngularVelocity(bodySegmentData.pelvis, i, frameRate) > 
        calculateAngularVelocity(bodySegmentData.pelvis, peakPelvisFrame, frameRate)) {
      peakPelvisFrame = i;
    }
    if (calculateAngularVelocity(bodySegmentData.torso, i, frameRate) > 
        calculateAngularVelocity(bodySegmentData.torso, peakTorsoFrame, frameRate)) {
      peakTorsoFrame = i;
    }
  }
  
  const actualTorsoDelay = (peakTorsoFrame - peakPelvisFrame) / frameRate;
  const actualBatDelay = (contact - peakPelvisFrame) / frameRate;
  
  const torsoTimingScore = Math.max(0, 100 - Math.abs(actualTorsoDelay - expectedTorsoDelay) * 1000);
  const batTimingScore = Math.max(0, 100 - Math.abs(actualBatDelay - expectedBatDelay) * 500);
  const sequencingEfficiency = (torsoTimingScore + batTimingScore) / 2;
  
  // Momentum Retention: How well momentum is maintained through the swing
  const initialMomentum = frameMetrics[0]?.linearMomentum || 0;
  const finalMomentum = totalLinearMom;
  const momentumRetention = initialMomentum > 0 
    ? Math.min(100, (finalMomentum / initialMomentum) * 100)
    : 100;
  
  return {
    batSpeed: batSpeedMetrics.batSpeed,
    peakBatSpeed: batSpeedMetrics.peakBatSpeed,
    batSpeedAtImpact: batSpeedMetrics.batSpeedAtImpact,
    
    pelvisAngularVelocity: pelvisAngularVel,
    torsoAngularVelocity: torsoAngularVel,
    shoulderAngularVelocity: shoulderAngularVel,
    peakPelvisVelocity: peakPelvisVel,
    peakTorsoVelocity: peakTorsoVel,
    
    pelvisLinearMomentum: pelvisLinearMom,
    torsoLinearMomentum: torsoLinearMom,
    totalLinearMomentum: totalLinearMom,
    peakLinearMomentum: peakLinearMom,
    
    pelvisRotationalMomentum: pelvisRotationalMom,
    torsoRotationalMomentum: torsoRotationalMom,
    totalRotationalMomentum: totalRotationalMom,
    
    translationalKE: totalTranslationalKE,
    rotationalKE: totalRotationalKE,
    totalKineticEnergy: totalKE,
    
    peakPower: peakPower,
    averagePower: averagePower,
    powerAtContact: powerAtContact,
    
    energyTransferEfficiency: Math.round(energyTransferEfficiency * 10) / 10,
    sequencingEfficiency: Math.round(sequencingEfficiency * 10) / 10,
    momentumRetention: Math.round(momentumRetention * 10) / 10,
    
    frameByFrameMetrics: frameMetrics
  };
}
