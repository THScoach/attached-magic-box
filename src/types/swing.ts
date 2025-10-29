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
}

export interface VelocityData {
  time: number;
  pelvis: number;
  torso: number;
  hands: number;
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
