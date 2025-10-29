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
  mlbComparison?: {
    pelvisVelocity: { player: number; mlb: number };
    torsoVelocity: { player: number; mlb: number };
    xFactor: { player: number; mlb: number };
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
