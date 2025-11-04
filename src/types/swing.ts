export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

export interface SwingAnalysis {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  analyzedAt: Date;
  
  // 4 B's Category Grades
  ballGrade?: LetterGrade;
  batGrade?: LetterGrade;
  bodyGrade?: LetterGrade;
  brainGrade?: LetterGrade;
  overallGrade?: LetterGrade;
  
  // 4 B's Category Percentages
  ballScore?: number;
  batScore?: number;
  bodyScore?: number;
  brainScore?: number;
  overallScore?: number;
  
  // Legacy HITS scores
  hitsScore: number;
  anchorScore: number;
  engineScore: number;
  whipScore: number;
  loadStartTiming?: number; // ms before contact when loading begins
  fireStartTiming?: number; // ms before contact when fire phase begins
  pelvisTiming?: number;
  torsoTiming?: number;
  handsTiming?: number;
  primaryOpportunity?: string;
  impactStatement?: string;
  recommendedDrills?: string[];
  poseData?: any;
  // Enhanced Reboot-style metrics
  pelvisMaxVelocity?: number;
  torsoMaxVelocity?: number;
  armMaxVelocity?: number;
  batMaxVelocity?: number;
  xFactor?: number; // Shoulder-pelvis separation at max
  xFactorStance?: number;
  pelvisRotation?: number;
  shoulderRotation?: number;
  comDistance?: number; // Center of mass travel distance
  comMaxVelocity?: number;
  // Enhanced COM metrics from research (Welch 1995, Fortenbaugh 2011)
  comLateralMovement?: number; // inches side-to-side
  comForwardMovement?: number; // inches total forward
  comVerticalMovement?: number; // inches up-down
  comPeakTiming?: number; // ms before contact when COM velocity peaks
  comAccelerationPeak?: number; // m/s² at front foot plant
  frontFootWeightPercent?: number; // % at contact
  frontFootGRF?: number; // % of body weight
  comCopDistance?: number; // inches COM-COP separation (balance)
  balanceRecoveryTime?: number; // seconds after contact
  mlbComparison?: {
    pelvisVelocity: { player: number; mlb: number };
    torsoVelocity: { player: number; mlb: number };
    xFactor: { player: number; mlb: number };
  };
  // Exit velocity and distance estimates
  exitVelocity?: number; // mph
  launchAngle?: number; // degrees
  projectedDistance?: number; // feet
  // BAT Metrics (🏏)
  batSpeed?: number; // mph
  attackAngle?: number; // degrees
  timeInZone?: number; // seconds
  batPathLength?: number; // inches
  barrelControl?: number; // 0-100%
  
  // Bat Speed Quality Framework (legacy)
  directionScore?: number; // 0-100
  timingScore?: number; // 0-100
  efficiencyScore?: number; // 0-100
  swingMechanicsQualityScore?: number; // 0-100
  batPathPlane?: number; // degrees  
  connectionQuality?: number; // 0-100
  sequenceQuality?: number; // 0-100
  accelerationPattern?: number; // 0-100
  balanceScore?: number; // 0-100
  
  // BODY Metrics (💪)
  sequenceEfficiency?: number; // 0-100%
  isCorrectSequence?: boolean;
  tempoRatio?: number; // e.g., 1.8 (load:launch)
  lowerBodyPower?: number; // percentage
  corePower?: number; // percentage
  upperBodyPower?: number; // percentage
  handSpeed?: number; // mph
  
  // BALL Metrics (⚾)
  hardHitPercentage?: number; // 0-100%
  lineDrivePercentage?: number; // 0-100%
  groundBallPercentage?: number; // 0-100%
  flyBallPercentage?: number; // 0-100%
  distance?: number; // feet (projected distance)
  
  // BRAIN Metrics (🧠)
  reactionTime?: number; // seconds
  decisionAccuracy?: number; // 0-100%
  chaseRate?: number; // 0-100%
  focusScore?: number; // 0-100%
  
  // Momentum & Biomechanics Metrics
  biomechanicsMetrics?: {
    batSpeed: number;
    peakBatSpeed: number;
    batSpeedAtImpact: number;
    pelvisAngularVelocity: number;
    torsoAngularVelocity: number;
    shoulderAngularVelocity: number;
    peakPelvisVelocity: number;
    peakTorsoVelocity: number;
    pelvisLinearMomentum: number;
    torsoLinearMomentum: number;
    totalLinearMomentum: number;
    peakLinearMomentum: number;
    pelvisRotationalMomentum: number;
    torsoRotationalMomentum: number;
    totalRotationalMomentum: number;
    translationalKE: number;
    rotationalKE: number;
    totalKineticEnergy: number;
    peakPower: number;
    averagePower: number;
    powerAtContact: number;
    energyTransferEfficiency: number;
    sequencingEfficiency: number;
    momentumRetention: number;
    frameByFrameMetrics?: Array<{
      frame: number;
      time: number;
      batSpeed: number;
      linearMomentum: number;
      rotationalMomentum: number;
      kineticEnergy: number;
      power: number;
    }>;
  };
}

export interface VelocityData {
  time: number;
  normalizedTime: number; // 0-100 scale like Reboot
  pelvis: number;
  torso: number;
  hands: number;
  bat?: number;
}

export interface Drill {
  id: string;
  name: string;
  pillar: "ANCHOR" | "ENGINE" | "WHIP";
  difficulty: number;
  duration: number;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}
