import { SwingAnalysis, VelocityData, Drill } from "@/types/swing";

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
    recommendedDrills: ["drill_1", "drill_2", "drill_3"]
  };
}

export function generateVelocityData(): VelocityData[] {
  const data: VelocityData[] = [];
  
  // Generate realistic velocity curves
  for (let time = -600; time <= 200; time += 10) {
    const normalizedTime = (time + 600) / 800; // 0 to 1
    
    // Pelvis peaks early
    const pelvisVel = Math.max(0, 
      2800 * Math.exp(-Math.pow((normalizedTime - 0.4) * 3, 2))
    );
    
    // Torso peaks slightly later
    const torsoVel = Math.max(0,
      2600 * Math.exp(-Math.pow((normalizedTime - 0.5) * 3, 2))
    );
    
    // Hands peak latest and fastest
    const handsVel = Math.max(0,
      3000 * Math.exp(-Math.pow((normalizedTime - 0.65) * 3.5, 2))
    );
    
    data.push({
      time,
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
