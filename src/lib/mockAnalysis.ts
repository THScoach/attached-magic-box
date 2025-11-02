import { SwingAnalysis, VelocityData, Drill } from "@/types/swing";

// Estimate exit velocity based on bat speed and other factors
function estimateExitVelocity(batSpeed: number, bodyMass: number = 180): number {
  // Simplified formula: EV ≈ (bat speed × efficiency factor) + mass adjustment
  const efficiency = 0.75 + Math.random() * 0.15; // 75-90% energy transfer
  const massBonus = (bodyMass - 150) * 0.1;
  return Math.round(batSpeed * efficiency + massBonus);
}

// Estimate distance based on exit velocity and launch angle
function estimateDistance(exitVelocity: number, launchAngle: number): number {
  // Optimal launch angle is around 25-30 degrees
  const optimalAngle = 27;
  const anglePenalty = Math.abs(launchAngle - optimalAngle) * 2;
  const baseDistance = (exitVelocity * 4.5) - anglePenalty;
  return Math.round(Math.max(0, baseDistance));
}

export function generateMockAnalysis(videoUrl: string): SwingAnalysis {
  // Generate realistic random scores
  const anchorScore = Math.floor(Math.random() * 20) + 75; // 75-95
  const engineScore = Math.floor(Math.random() * 30) + 65; // 65-95
  const whipScore = Math.floor(Math.random() * 25) + 70; // 70-95
  
  // Calculate H.I.T.S. Score (ENGINE weighted at 50%)
  const hitsScore = Math.round(
    anchorScore * 0.25 + engineScore * 0.5 + whipScore * 0.25
  );

  const tempoRatio = parseFloat((Math.random() * 1.5 + 1.5).toFixed(1)); // 1.5-3.0

  const opportunities = [
    {
      text: "Your torso is starting 0.04 seconds too early, breaking the kinematic chain",
      impact: "Fixing this could add 3-5 mph to your exit velocity"
    },
    {
      text: "Your hands are lagging behind the ideal sequence by 0.06 seconds",
      impact: "Improving this timing could increase bat speed by 4-6 mph"
    },
    {
      text: "Your weight shift is starting too late, reducing ground force generation",
      impact: "Better anchor timing could add 2-4 mph to your exit velocity"
    },
    {
      text: "Your pelvis rotation peaks 0.08 seconds early, causing energy leaks",
      impact: "Optimizing this could boost your power output by 8-10%"
    }
  ];

  const opportunity = opportunities[Math.floor(Math.random() * opportunities.length)];

  // Enhanced Reboot-style metrics
  const pelvisMaxVelocity = 550 + Math.random() * 200; // 550-750 deg/s
  const torsoMaxVelocity = 900 + Math.random() * 400;  // 900-1300 deg/s
  const armMaxVelocity = 1600 + Math.random() * 600;   // 1600-2200 deg/s
  const batMaxVelocity = 65 + Math.random() * 15;      // 65-80 mph
  const xFactorStance = 20 + Math.random() * 30;       // 20-50 degrees
  const xFactor = 25 + Math.random() * 35;             // 25-60 degrees
  const pelvisRotation = -(100 + Math.random() * 40);  // -100 to -140 degrees
  const shoulderRotation = 85 + Math.random() * 40;
  const comDistance = 6 + Math.random() * 4;
  const comMaxVelocity = 8 + Math.random() * 6;

  // Enhanced COM metrics from research (Welch 1995, Fortenbaugh 2011)
  const comLateralMovement = 2 + Math.random() * 5; // 2-7 inches (elite 2-4)
  const comForwardMovement = 8 + Math.random() * 10; // 8-18 inches (elite 10-16)
  const comVerticalMovement = 1.5 + Math.random() * 3.5; // 1.5-5 inches (elite 2-3)
  const comPeakTiming = 80 + Math.random() * 80; // 80-160ms before contact (elite 100-120)
  const comAccelerationPeak = 3 + Math.random() * 7; // 3-10 m/s² (elite 5-8)
  const frontFootWeightPercent = 55 + Math.random() * 30; // 55-85% (elite 70-80)
  const frontFootGRF = 95 + Math.random() * 40; // 95-135% body weight (elite >120)
  const comCopDistance = 2 + Math.random() * 6; // 2-8 inches (elite 2-4)
  const balanceRecoveryTime = 0.2 + Math.random() * 0.8; // 0.2-1.0s (elite 0.3-0.5)

  // Calculate exit velocity and distance estimates
  const batSpeed = batMaxVelocity * 2.237; // Convert m/s to mph (for consistency)
  const launchAngle = 15 + Math.random() * 20; // 15-35 degrees
  const exitVelocity = estimateExitVelocity(batSpeed);
  const distance = estimateDistance(exitVelocity, launchAngle);

  return {
    id: `swing_${Date.now()}`,
    videoUrl,
    thumbnailUrl: undefined,
    analyzedAt: new Date(),
    hitsScore,
    anchorScore,
    engineScore,
    whipScore,
    tempoRatio,
    pelvisTiming: parseFloat((Math.random() * 0.2 - 0.15).toFixed(3)),
    torsoTiming: parseFloat((Math.random() * 0.15 - 0.1).toFixed(3)),
    handsTiming: parseFloat((Math.random() * 0.1 - 0.05).toFixed(3)),
    primaryOpportunity: opportunity.text,
    impactStatement: opportunity.impact,
    recommendedDrills: ["drill_1", "drill_2", "drill_3"],
    pelvisMaxVelocity,
    torsoMaxVelocity,
    armMaxVelocity,
    batMaxVelocity,
    xFactor,
    xFactorStance,
    pelvisRotation,
    shoulderRotation,
    comDistance,
    comMaxVelocity,
    comLateralMovement,
    comForwardMovement,
    comVerticalMovement,
    comPeakTiming,
    comAccelerationPeak,
    frontFootWeightPercent,
    frontFootGRF,
    comCopDistance,
    balanceRecoveryTime,
    mlbComparison: {
      pelvisVelocity: { player: pelvisMaxVelocity, mlb: 700 },
      torsoVelocity: { player: torsoMaxVelocity, mlb: 1100 },
      xFactor: { player: xFactor, mlb: 50 },
    },
    exitVelocity,
    launchAngle,
    projectedDistance: distance,
  };
}

export function generateVelocityData(): VelocityData[] {
  const data: VelocityData[] = [];
  
  // Generate realistic velocity curves with proper MLB ranges
  for (let time = -600; time <= 200; time += 10) {
    const normalizedTime = ((time + 600) / 800) * 100; // 0 to 100 (Reboot style)
    const norm = (time + 600) / 800; // 0 to 1 for calculations
    
    // Pelvis peaks early - MLB range 400-750 deg/s, avg ~600
    const pelvisVel = Math.max(0, 
      650 * Math.exp(-Math.pow((norm - 0.4) * 3, 2))
    );
    
    // Torso peaks slightly later - MLB range 600-1300 deg/s, avg ~950
    const torsoVel = Math.max(0,
      1000 * Math.exp(-Math.pow((norm - 0.5) * 3, 2))
    );
    
    // Hands/Arms peak latest - MLB range 750-2200 deg/s, avg ~1800
    const handsVel = Math.max(0,
      1900 * Math.exp(-Math.pow((norm - 0.65) * 3.5, 2))
    );
    
    data.push({
      time,
      normalizedTime: Math.round(normalizedTime * 10) / 10, // Round to 1 decimal
      pelvis: Math.round(pelvisVel),
      torso: Math.round(torsoVel),
      hands: Math.round(handsVel)
    });
  }
  
  return data;
}

export const mockDrills: Drill[] = [
  {
    id: "drill_1",
    name: "Separation Hold Drill",
    pillar: "ENGINE",
    difficulty: 2,
    duration: 10,
    description: "Practice holding your separation position to improve sequencing timing",
    thumbnailUrl: undefined
  },
  {
    id: "drill_2",
    name: "Ground Force Transfer",
    pillar: "ANCHOR",
    difficulty: 3,
    duration: 15,
    description: "Focus on weight shift and vertical force generation",
    thumbnailUrl: undefined
  },
  {
    id: "drill_3",
    name: "Bat Path Optimization",
    pillar: "WHIP",
    difficulty: 2,
    duration: 12,
    description: "Work on direct hand path and acceleration through contact",
    thumbnailUrl: undefined
  },
  {
    id: "drill_4",
    name: "Tempo Sequencing",
    pillar: "ENGINE",
    difficulty: 4,
    duration: 20,
    description: "Advanced drill for perfecting the kinematic sequence",
    thumbnailUrl: undefined
  },
  {
    id: "drill_5",
    name: "Anchor Stability",
    pillar: "ANCHOR",
    difficulty: 1,
    duration: 8,
    description: "Build a stable base for consistent power generation",
    thumbnailUrl: undefined
  },
  {
    id: "drill_6",
    name: "Whip Acceleration",
    pillar: "WHIP",
    difficulty: 3,
    duration: 15,
    description: "Maximize bat speed through proper acceleration mechanics",
    thumbnailUrl: undefined
  }
];
