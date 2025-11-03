export interface SwingAnalysis {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  analyzedAt: Date;
  hitsScore: number;
  anchorScore: number;
  engineScore: number;
  whipScore: number;
  tempoRatio: number;
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
  // Bat Speed Quality Framework
  directionScore?: number; // 0-100
  timingScore?: number; // 0-100
  efficiencyScore?: number; // 0-100
  swingMechanicsQualityScore?: number; // 0-100
  attackAngle?: number; // degrees
  batPathPlane?: number; // degrees  
  connectionQuality?: number; // 0-100
  sequenceQuality?: number; // 0-100
  accelerationPattern?: number; // 0-100
  balanceScore?: number; // 0-100
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
