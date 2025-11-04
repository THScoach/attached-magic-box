export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

export function calculateGrade(percentage: number): LetterGrade {
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 87) return 'A-';
  if (percentage >= 83) return 'B+';
  if (percentage >= 80) return 'B';
  if (percentage >= 77) return 'B-';
  if (percentage >= 73) return 'C+';
  if (percentage >= 70) return 'C';
  if (percentage >= 67) return 'C-';
  if (percentage >= 60) return 'D';
  return 'F';
}

export function getGradeColor(grade: LetterGrade): string {
  if (grade.startsWith('A')) return 'text-green-500';
  if (grade.startsWith('B')) return 'text-blue-500';
  if (grade.startsWith('C')) return 'text-yellow-500';
  if (grade === 'D') return 'text-orange-500';
  return 'text-red-500';
}

export function getGradeIcon(grade: LetterGrade): string {
  if (grade.startsWith('A')) return '✓';
  if (grade.startsWith('B')) return '⚠';
  if (grade.startsWith('C')) return '⚠';
  return '✗';
}

export interface CategoryMetrics {
  batSpeed?: number;
  attackAngle?: number;
  timeInZone?: number;
  pelvisPeakVelocity?: number;
  torsoPeakVelocity?: number;
  sequenceEfficiency?: number;
  tempoRatio?: number;
  exitVelocity?: number;
  launchAngle?: number;
  hardHitPercentage?: number;
  reactionTime?: number;
  decisionAccuracy?: number;
}

export interface Benchmark {
  min: number;
  avg: number;
  max: number;
  gradeAtAvg: LetterGrade;
}

export function calculateMetricPercentage(
  value: number,
  benchmark: Benchmark,
  higherIsBetter: boolean = true
): number {
  const range = benchmark.max - benchmark.min;
  if (range === 0) return 50;
  
  const normalizedValue = higherIsBetter
    ? ((value - benchmark.min) / range) * 100
    : ((benchmark.max - value) / range) * 100;
  
  return Math.max(0, Math.min(100, normalizedValue));
}

export function calculateBatGrade(metrics: CategoryMetrics, level: string, benchmarks: any): { grade: LetterGrade; percentage: number } {
  const levelBenchmarks = benchmarks[level] || benchmarks.highSchool;
  
  const scores: number[] = [];
  
  if (metrics.batSpeed !== undefined) {
    scores.push(calculateMetricPercentage(metrics.batSpeed, levelBenchmarks.batSpeed, true));
  }
  
  if (metrics.attackAngle !== undefined) {
    // Attack angle: ideal is 8-15 degrees
    const ideal = 12;
    const deviation = Math.abs(metrics.attackAngle - ideal);
    const score = Math.max(0, 100 - (deviation * 10));
    scores.push(score);
  }
  
  if (metrics.timeInZone !== undefined) {
    scores.push(calculateMetricPercentage(metrics.timeInZone, levelBenchmarks.timeInZone, true));
  }
  
  const avgPercentage = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
  return { grade: calculateGrade(avgPercentage), percentage: avgPercentage };
}

export function calculateBodyGrade(metrics: CategoryMetrics, level: string, benchmarks: any): { grade: LetterGrade; percentage: number } {
  const levelBenchmarks = benchmarks[level] || benchmarks.highSchool;
  
  const scores: number[] = [];
  
  if (metrics.sequenceEfficiency !== undefined) {
    scores.push(metrics.sequenceEfficiency);
  }
  
  if (metrics.tempoRatio !== undefined) {
    // Ideal tempo ratio is 1.5-2.0
    const ideal = 1.75;
    const deviation = Math.abs(metrics.tempoRatio - ideal);
    const score = Math.max(0, 100 - (deviation * 40));
    scores.push(score);
  }
  
  if (metrics.pelvisPeakVelocity !== undefined) {
    scores.push(calculateMetricPercentage(metrics.pelvisPeakVelocity, levelBenchmarks.pelvisVelocity, true));
  }
  
  const avgPercentage = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
  return { grade: calculateGrade(avgPercentage), percentage: avgPercentage };
}

export function calculateBallGrade(metrics: CategoryMetrics, level: string, benchmarks: any): { grade: LetterGrade; percentage: number } {
  const levelBenchmarks = benchmarks[level] || benchmarks.highSchool;
  
  const scores: number[] = [];
  
  if (metrics.exitVelocity !== undefined) {
    scores.push(calculateMetricPercentage(metrics.exitVelocity, levelBenchmarks.exitVelocity, true));
  }
  
  if (metrics.launchAngle !== undefined) {
    // Launch angle: ideal is 10-30 degrees
    if (metrics.launchAngle >= 10 && metrics.launchAngle <= 30) {
      scores.push(90);
    } else {
      const deviation = metrics.launchAngle < 10 ? 10 - metrics.launchAngle : metrics.launchAngle - 30;
      scores.push(Math.max(0, 90 - (deviation * 5)));
    }
  }
  
  if (metrics.hardHitPercentage !== undefined) {
    scores.push(metrics.hardHitPercentage);
  }
  
  const avgPercentage = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
  return { grade: calculateGrade(avgPercentage), percentage: avgPercentage };
}

export function calculateBrainGrade(metrics: CategoryMetrics, level: string, benchmarks: any): { grade: LetterGrade; percentage: number } {
  const scores: number[] = [];
  
  if (metrics.reactionTime !== undefined) {
    // Reaction time: lower is better (0.3-0.7s range)
    const benchmark = { min: 0.3, avg: 0.5, max: 0.7, gradeAtAvg: 'B' as LetterGrade };
    scores.push(calculateMetricPercentage(metrics.reactionTime, benchmark, false));
  }
  
  if (metrics.decisionAccuracy !== undefined) {
    scores.push(metrics.decisionAccuracy);
  }
  
  const avgPercentage = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
  return { grade: calculateGrade(avgPercentage), percentage: avgPercentage };
}

export function calculateOverallGrade(
  ballGrade: { percentage: number },
  batGrade: { percentage: number },
  bodyGrade: { percentage: number },
  brainGrade: { percentage: number },
  tier: 'free' | 'challenge' | 'diy' | 'elite'
): { grade: LetterGrade; percentage: number } {
  // Different tiers have different available metrics
  const percentages: number[] = [];
  
  if (tier === 'free') {
    // Free tier: Only bat + body
    percentages.push(batGrade.percentage, bodyGrade.percentage);
  } else if (tier === 'challenge') {
    // Challenge tier: Bat + body + estimated ball
    percentages.push(batGrade.percentage, bodyGrade.percentage, ballGrade.percentage);
  } else {
    // DIY/Elite: All 4 B's
    percentages.push(ballGrade.percentage, batGrade.percentage, bodyGrade.percentage, brainGrade.percentage);
  }
  
  const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;
  return { grade: calculateGrade(avgPercentage), percentage: avgPercentage };
}
