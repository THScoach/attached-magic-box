/**
 * The 4 B's Framework for Baseball Hitting Analysis
 * 
 * Philosophy: Simple, memorable, comprehensive approach that even a 6th grader can understand.
 * 
 * The hitting chain:
 * 1. 🧠 BRAIN (Mental/Decision) → Makes the decision
 * 2. 💪 BODY (Mechanics/Movement) → Executes the movement
 * 3. 🏏 BAT (Tool/Weapon) → Delivers the tool
 * 4. ⚾ BALL (Output/Results) → Creates the result
 */

export type MembershipTier = 'free' | 'challenge' | 'diy' | 'elite';

export type BCategory = 'brain' | 'body' | 'bat' | 'ball';

export type DataSource = 'camera' | 'ai_estimated' | 'blast_motion' | 'reboot_motion' | 'hittrax' | 'rapsodo';

export interface MetricDefinition {
  id: string;
  name: string;
  category: BCategory;
  description: string;
  dataSource: DataSource;
  accuracy: number; // 0-100
  unit: string;
  icon: string;
  requiredTier: MembershipTier;
  sensorRequired?: string; // e.g., "Blast Motion", "Reboot Motion"
  gamificationVisual: string; // e.g., "speedometer", "relay_race", "rocket"
}

export interface TierAccess {
  tier: MembershipTier;
  swingsPerMonth: number | 'unlimited';
  price: string;
  brainAccess: boolean;
  bodyAccess: 'none' | 'basic' | 'enhanced' | 'full';
  batAccess: 'none' | 'estimated' | 'improved' | 'sensor';
  ballAccess: 'none' | 'estimated' | 'improved' | 'sensor';
  features: string[];
}

export const TIER_ACCESS: Record<MembershipTier, TierAccess> = {
  free: {
    tier: 'free',
    swingsPerMonth: 2,
    price: '$0/year',
    brainAccess: false,
    bodyAccess: 'basic',
    batAccess: 'none',
    ballAccess: 'none',
    features: [
      'Basic body mechanics (visual only)',
      'Kinematic sequence visualization',
      'Posture and balance analysis',
      '2 swings per month',
    ],
  },
  challenge: {
    tier: 'challenge',
    swingsPerMonth: 'unlimited',
    price: '$9.97 for 7 days',
    brainAccess: true,
    bodyAccess: 'basic',
    batAccess: 'estimated',
    ballAccess: 'estimated',
    features: [
      'Unlimited swings for 7 days',
      'All 4 B\'s analysis',
      'AI-estimated bat speed',
      'AI-estimated exit velocity',
      'Swing decision analysis',
      'Basic benchmarks',
    ],
  },
  diy: {
    tier: 'diy',
    swingsPerMonth: 'unlimited',
    price: '$297/year',
    brainAccess: true,
    bodyAccess: 'enhanced',
    batAccess: 'improved',
    ballAccess: 'improved',
    features: [
      'Unlimited swings',
      'Enhanced 4 B\'s analysis',
      'Improved AI estimates',
      'Progress tracking',
      'MLB benchmarks',
      'Detailed reports',
      'Drill recommendations',
    ],
  },
  elite: {
    tier: 'elite',
    swingsPerMonth: 'unlimited',
    price: '$997/year',
    brainAccess: true,
    bodyAccess: 'full',
    batAccess: 'sensor',
    ballAccess: 'sensor',
    features: [
      'Unlimited swings',
      'Sensor-verified accuracy',
      'Blast Motion integration',
      'Reboot Motion 3D analysis',
      'Professional reports',
      'MLB comparisons',
      'Advanced biomechanics',
      'Injury risk analysis',
    ],
  },
};

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  // 🧠 BRAIN METRICS
  {
    id: 'swing_decision_rate',
    name: 'Swing Decision Rate',
    category: 'brain',
    description: 'Percentage of good swing decisions vs. all pitches',
    dataSource: 'camera',
    accuracy: 75,
    unit: '%',
    icon: '🎯',
    requiredTier: 'challenge',
    gamificationVisual: 'traffic_light',
  },
  {
    id: 'chase_rate',
    name: 'Chase Rate',
    category: 'brain',
    description: 'Percentage of swings at pitches outside the zone',
    dataSource: 'ai_estimated',
    accuracy: 65,
    unit: '%',
    icon: '🚫',
    requiredTier: 'diy',
    gamificationVisual: 'target',
  },
  {
    id: 'timing_consistency',
    name: 'Timing Consistency',
    category: 'brain',
    description: 'Consistency of swing timing across multiple swings',
    dataSource: 'camera',
    accuracy: 80,
    unit: '%',
    icon: '⏱️',
    requiredTier: 'diy',
    gamificationVisual: 'stopwatch',
  },

  // 💪 BODY METRICS
  {
    id: 'kinematic_sequence',
    name: 'Kinematic Sequence',
    category: 'body',
    description: 'Proper order: Pelvis → Torso → Hands → Bat',
    dataSource: 'camera',
    accuracy: 90,
    unit: '%',
    icon: '🏃',
    requiredTier: 'free',
    gamificationVisual: 'relay_race',
  },
  {
    id: 'hip_shoulder_separation',
    name: 'Hip-Shoulder Separation',
    category: 'body',
    description: 'Maximum angle between hips and shoulders',
    dataSource: 'camera',
    accuracy: 85,
    unit: '°',
    icon: '🔄',
    requiredTier: 'challenge',
    gamificationVisual: 'angle_meter',
  },
  {
    id: 'tempo_ratio',
    name: 'Tempo/Rhythm',
    category: 'body',
    description: 'Load to fire timing ratio',
    dataSource: 'camera',
    accuracy: 90,
    unit: 'ratio',
    icon: '🎵',
    requiredTier: 'free',
    gamificationVisual: 'metronome',
  },
  {
    id: 'weight_transfer',
    name: 'Weight Transfer',
    category: 'body',
    description: 'Center of mass forward movement',
    dataSource: 'camera',
    accuracy: 85,
    unit: 'inches',
    icon: '⚖️',
    requiredTier: 'diy',
    gamificationVisual: 'balance_scale',
  },
  {
    id: 'ground_force',
    name: 'Ground Force',
    category: 'body',
    description: 'Maximum ground reaction force',
    dataSource: 'reboot_motion',
    accuracy: 95,
    unit: '%BW',
    icon: '💥',
    requiredTier: 'elite',
    sensorRequired: 'Reboot Motion with force plates',
    gamificationVisual: 'power_meter',
  },

  // 🏏 BAT METRICS
  {
    id: 'bat_speed',
    name: 'Bat Speed',
    category: 'bat',
    description: 'Speed of bat at contact',
    dataSource: 'ai_estimated',
    accuracy: 65,
    unit: 'mph',
    icon: '⚡',
    requiredTier: 'challenge',
    gamificationVisual: 'speedometer',
  },
  {
    id: 'bat_speed_sensor',
    name: 'Bat Speed (Verified)',
    category: 'bat',
    description: 'Sensor-verified bat speed',
    dataSource: 'blast_motion',
    accuracy: 95,
    unit: 'mph',
    icon: '✅',
    requiredTier: 'elite',
    sensorRequired: 'Blast Motion',
    gamificationVisual: 'speedometer',
  },
  {
    id: 'attack_angle',
    name: 'Attack Angle',
    category: 'bat',
    description: 'Vertical angle of bat at contact (ideal: 5-20°)',
    dataSource: 'ai_estimated',
    accuracy: 70,
    unit: '°',
    icon: '📐',
    requiredTier: 'challenge',
    gamificationVisual: 'launch_ramp',
  },
  {
    id: 'attack_angle_sensor',
    name: 'Attack Angle (Verified)',
    category: 'bat',
    description: 'Sensor-verified attack angle',
    dataSource: 'blast_motion',
    accuracy: 90,
    unit: '°',
    icon: '✅',
    requiredTier: 'elite',
    sensorRequired: 'Blast Motion',
    gamificationVisual: 'launch_ramp',
  },
  {
    id: 'ideal_attack_angle_rate',
    name: 'Ideal Attack Angle Rate',
    category: 'bat',
    description: '% of swings in 5-20° range',
    dataSource: 'ai_estimated',
    accuracy: 70,
    unit: '%',
    icon: '🎯',
    requiredTier: 'challenge',
    gamificationVisual: 'progress_bar',
  },
  {
    id: 'swing_path_tilt',
    name: 'Swing Path Tilt',
    category: 'bat',
    description: 'Angular orientation of swing plane',
    dataSource: 'ai_estimated',
    accuracy: 75,
    unit: '°',
    icon: '↗️',
    requiredTier: 'challenge',
    gamificationVisual: 'swing_path',
  },
  {
    id: 'attack_direction',
    name: 'Attack Direction',
    category: 'bat',
    description: 'Horizontal angle - pull vs. opposite field',
    dataSource: 'blast_motion',
    accuracy: 90,
    unit: '°',
    icon: '↔️',
    requiredTier: 'elite',
    sensorRequired: 'Blast Motion',
    gamificationVisual: 'spray_chart',
  },
  {
    id: 'time_in_zone',
    name: 'Time in Zone',
    category: 'bat',
    description: 'Time bat spends in hitting zone',
    dataSource: 'ai_estimated',
    accuracy: 70,
    unit: 'ms',
    icon: '⏱️',
    requiredTier: 'diy',
    gamificationVisual: 'zone_timer',
  },

  // ⚾ BALL METRICS
  {
    id: 'exit_velocity',
    name: 'Exit Velocity',
    category: 'ball',
    description: 'Speed of ball off bat',
    dataSource: 'ai_estimated',
    accuracy: 55,
    unit: 'mph',
    icon: '🚀',
    requiredTier: 'challenge',
    gamificationVisual: 'rocket',
  },
  {
    id: 'exit_velocity_sensor',
    name: 'Exit Velocity (Verified)',
    category: 'ball',
    description: 'Radar-verified exit velocity',
    dataSource: 'hittrax',
    accuracy: 98,
    unit: 'mph',
    icon: '✅',
    requiredTier: 'elite',
    sensorRequired: 'HitTrax or Rapsodo',
    gamificationVisual: 'rocket',
  },
  {
    id: 'launch_angle',
    name: 'Launch Angle',
    category: 'ball',
    description: 'Vertical angle of batted ball',
    dataSource: 'ai_estimated',
    accuracy: 60,
    unit: '°',
    icon: '📊',
    requiredTier: 'challenge',
    gamificationVisual: 'arc',
  },
  {
    id: 'barrel_rate',
    name: 'Barrel Rate',
    category: 'ball',
    description: '% of balls with optimal EV + LA',
    dataSource: 'ai_estimated',
    accuracy: 50,
    unit: '%',
    icon: '🎯',
    requiredTier: 'diy',
    gamificationVisual: 'target',
  },
  {
    id: 'hard_hit_rate',
    name: 'Hard Hit %',
    category: 'ball',
    description: '% of balls hit 95+ mph',
    dataSource: 'ai_estimated',
    accuracy: 55,
    unit: '%',
    icon: '💪',
    requiredTier: 'diy',
    gamificationVisual: 'power_meter',
  },
  {
    id: 'estimated_distance',
    name: 'Estimated Distance',
    category: 'ball',
    description: 'Projected ball flight distance',
    dataSource: 'ai_estimated',
    accuracy: 50,
    unit: 'ft',
    icon: '📏',
    requiredTier: 'challenge',
    gamificationVisual: 'distance_marker',
  },
];

/**
 * Check if user has access to a specific metric based on their tier
 */
export function hasMetricAccess(
  userTier: MembershipTier,
  metric: MetricDefinition
): boolean {
  const tierOrder: MembershipTier[] = ['free', 'challenge', 'diy', 'elite'];
  const userTierIndex = tierOrder.indexOf(userTier);
  const requiredTierIndex = tierOrder.indexOf(metric.requiredTier);
  return userTierIndex >= requiredTierIndex;
}

/**
 * Get metrics available for a specific tier and category
 */
export function getAvailableMetrics(
  userTier: MembershipTier,
  category?: BCategory
): MetricDefinition[] {
  let metrics = METRIC_DEFINITIONS.filter((m) => hasMetricAccess(userTier, m));
  if (category) {
    metrics = metrics.filter((m) => m.category === category);
  }
  return metrics;
}

/**
 * Get locked metrics that require upgrade
 */
export function getLockedMetrics(
  userTier: MembershipTier,
  category?: BCategory
): MetricDefinition[] {
  let metrics = METRIC_DEFINITIONS.filter((m) => !hasMetricAccess(userTier, m));
  if (category) {
    metrics = metrics.filter((m) => m.category === category);
  }
  return metrics;
}

/**
 * Calculate overall grade for a B category
 * Returns 0 if no data is available for the category
 */
export function calculateBGrade(
  category: BCategory,
  metrics: Record<string, number>,
  userTier: MembershipTier
): number {
  const availableMetrics = getAvailableMetrics(userTier, category);
  
  if (availableMetrics.length === 0) return 0;

  let totalScore = 0;
  let count = 0;

  availableMetrics.forEach((metric) => {
    const value = metrics[metric.id];
    if (value !== undefined && value !== null && !isNaN(value)) {
      // Normalize to 0-100 scale based on metric type
      const normalizedScore = normalizeMetricValue(metric, value);
      totalScore += normalizedScore;
      count++;
    }
  });

  return count > 0 ? Math.round(totalScore / count) : 0;
}

/**
 * Check if a category has any actual data available
 */
export function categoryHasData(
  category: BCategory,
  metrics: Record<string, number>,
  userTier: MembershipTier
): boolean {
  // BRAIN is always educational-only (no grading)
  if (category === 'brain') {
    return false;
  }
  
  const availableMetrics = getAvailableMetrics(userTier, category);
  return availableMetrics.some((metric) => {
    const value = metrics[metric.id];
    return value !== undefined && value !== null && !isNaN(value);
  });
}

/**
 * Check if a category should display educational content only (no grade)
 */
export function isEducationalOnly(category: BCategory): boolean {
  return category === 'brain';
}

/**
 * Normalize metric value to 0-100 scale for grading
 */
function normalizeMetricValue(metric: MetricDefinition, value: number): number {
  // Normalize metrics to 0-100 scale based on realistic benchmarks
  
  switch (metric.id) {
    case 'bat_speed':
    case 'bat_speed_sensor':
      // Bat speed normalization: 50 mph = 0, 85+ mph = 100
      // Youth ~60mph, HS ~70mph, College ~75mph, MLB ~73-82mph
      if (value >= 85) return 100;
      if (value <= 50) return 0;
      return ((value - 50) / 35) * 100;
    
    case 'exit_velocity':
    case 'exit_velocity_sensor':
      // Exit velocity: 60 mph = 0, 110+ mph = 100
      // Youth ~70mph, HS ~80mph, College ~88mph, MLB ~88-95mph
      if (value >= 110) return 100;
      if (value <= 60) return 0;
      return ((value - 60) / 50) * 100;
    
    case 'attack_angle':
    case 'attack_angle_sensor':
      // Ideal range is 5-20°, optimal around 10-15°
      if (value >= 5 && value <= 20) {
        // Within ideal range - grade on how close to optimal
        const optimal = 12;
        const distanceFromOptimal = Math.abs(value - optimal);
        return Math.max(80, 100 - (distanceFromOptimal * 3));
      } else if (value < 5) {
        // Too steep/downward
        return Math.max(0, 60 - ((5 - value) * 10));
      } else {
        // Too much uppercut
        return Math.max(0, 60 - ((value - 20) * 5));
      }
    
    case 'tempo_ratio':
      // Optimal tempo ratio is 3:1 (3.0)
      // Acceptable range: 2.5-3.5 = A grade
      // Research shows elite hitters use 3:1 load to fire ratio
      const ideal = 3.0;
      const distance = Math.abs(value - ideal);
      if (distance <= 0.5) return 95; // Within 0.5 of ideal = A
      if (distance <= 1.0) return 85; // Within 1.0 = B
      if (distance <= 1.5) return 75; // Within 1.5 = C
      if (distance <= 2.0) return 65; // Within 2.0 = D
      return 50; // More than 2.0 away = F
    
    case 'weight_transfer':
      // Weight transfer in inches: 10-16 inches is optimal for elite hitters
      if (value >= 10 && value <= 16) return 95;
      if (value >= 8 && value < 10) return 85;
      if (value >= 6 && value < 8) return 75;
      if (value >= 4 && value < 6) return 65;
      return 50;
    
    case 'hip_shoulder_separation':
      // Hip-shoulder separation: 40-60° is elite
      if (value >= 40 && value <= 60) return 95;
      if (value >= 30 && value < 40) return 85;
      if (value >= 20 && value < 30) return 75;
      return 60;
    
    case 'ideal_attack_angle_rate':
    case 'barrel_rate':
    case 'hard_hit_rate':
    case 'swing_decision_rate':
    case 'chase_rate':
    case 'timing_consistency':
      // These are already percentages (0-100)
      return Math.max(0, Math.min(100, value));
    
    case 'kinematic_sequence':
      // Sequence efficiency percentage (0-100)
      return Math.max(0, Math.min(100, value));
    
    case 'ground_force':
      // Ground force as % of body weight: 120%+ is elite
      if (value >= 120) return 100;
      if (value >= 110) return 90;
      if (value >= 100) return 80;
      if (value >= 90) return 70;
      return 60;
    
    case 'time_in_zone':
      // Time in zone (milliseconds): 150-200ms is ideal
      if (value >= 150 && value <= 200) return 95;
      if (value >= 120 && value < 150) return 85;
      if (value >= 100 && value < 120) return 75;
      return 60;
    
    case 'swing_path_tilt':
    case 'attack_direction':
      // Angular measurements in degrees - normalize based on specific metric needs
      // Default to percentage-style scoring
      return Math.max(0, Math.min(100, value));
    
    case 'launch_angle':
      // Launch angle: 10-30° is good for line drives/fly balls
      if (value >= 10 && value <= 30) return 90;
      if (value >= 5 && value < 10) return 80;
      if (value >= 0 && value < 5) return 70;
      if (value < 0) return 60; // Ground balls
      if (value > 30 && value <= 40) return 75;
      return 60; // Pop ups
    
    case 'estimated_distance':
      // Distance in feet: 300+ = 100, 200 = 70, 100 = 40
      if (value >= 400) return 100;
      return Math.max(40, Math.min(100, 40 + ((value - 100) / 300) * 60));
    
    default:
      // For unknown metrics, assume already normalized to 0-100
      // But cap at reasonable bounds
      return Math.max(0, Math.min(100, value));
  }
}

/**
 * Get category icon and display name
 */
export function getBCategoryInfo(category: BCategory): {
  icon: string;
  name: string;
  color: string;
  description: string;
} {
  const info = {
    brain: {
      icon: '🧠',
      name: 'BRAIN',
      color: 'text-purple-600',
      description: 'Mental & Decision Making',
    },
    body: {
      icon: '💪',
      name: 'BODY',
      color: 'text-blue-600',
      description: 'Mechanics & Movement',
    },
    bat: {
      icon: '🏏',
      name: 'BAT',
      color: 'text-orange-600',
      description: 'Tool & Delivery',
    },
    ball: {
      icon: '⚾',
      name: 'BALL',
      color: 'text-red-600',
      description: 'Output & Results',
    },
  };

  return info[category];
}

/**
 * Get MLB benchmarks for a metric
 */
export interface Benchmark {
  level: string;
  min: number;
  max: number;
  avg?: number;
}

export function getMLBBenchmarks(metricId: string): Benchmark[] {
  const benchmarks: Record<string, Benchmark[]> = {
    bat_speed: [
      { level: 'Youth (12-14)', min: 55, max: 65 },
      { level: 'High School', min: 65, max: 75 },
      { level: 'College', min: 72, max: 78 },
      { level: 'MLB', min: 72, max: 79, avg: 73 },
      { level: 'Elite MLB', min: 78, max: 82 },
    ],
    attack_angle: [
      { level: 'Youth', min: 8, max: 15 },
      { level: 'High School', min: 10, max: 18 },
      { level: 'College', min: 10, max: 20 },
      { level: 'MLB Avg', min: 8, max: 12, avg: 10 },
      { level: 'Ideal Range', min: 5, max: 20 },
    ],
    exit_velocity: [
      { level: 'Youth', min: 65, max: 75 },
      { level: 'High School', min: 75, max: 85 },
      { level: 'College', min: 85, max: 92 },
      { level: 'MLB', min: 88, max: 90 },
      { level: 'Hard Hit', min: 95, max: 120 },
    ],
    ideal_attack_angle_rate: [
      { level: 'Average', min: 40, max: 50, avg: 50 },
      { level: 'Good', min: 60, max: 70 },
      { level: 'Elite MLB', min: 70, max: 75 },
    ],
  };

  return benchmarks[metricId] || [];
}
