import { Benchmark } from './gradingSystem';

export interface LevelBenchmarks {
  batSpeed: Benchmark;
  exitVelocity: Benchmark;
  pelvisVelocity: Benchmark;
  torsoVelocity: Benchmark;
  timeInZone: Benchmark;
  sequenceEfficiency: Benchmark;
}

export const benchmarks: Record<string, LevelBenchmarks> = {
  youth: {
    batSpeed: { min: 45, avg: 55, max: 65, gradeAtAvg: 'C' },
    exitVelocity: { min: 55, avg: 65, max: 75, gradeAtAvg: 'C' },
    pelvisVelocity: { min: 400, avg: 550, max: 700, gradeAtAvg: 'C' },
    torsoVelocity: { min: 500, avg: 700, max: 900, gradeAtAvg: 'C' },
    timeInZone: { min: 0.08, avg: 0.12, max: 0.18, gradeAtAvg: 'C' },
    sequenceEfficiency: { min: 60, avg: 75, max: 90, gradeAtAvg: 'C' },
  },
  highSchool: {
    batSpeed: { min: 60, avg: 70, max: 80, gradeAtAvg: 'B' },
    exitVelocity: { min: 70, avg: 80, max: 90, gradeAtAvg: 'B' },
    pelvisVelocity: { min: 550, avg: 700, max: 850, gradeAtAvg: 'B' },
    torsoVelocity: { min: 700, avg: 900, max: 1100, gradeAtAvg: 'B' },
    timeInZone: { min: 0.10, avg: 0.14, max: 0.20, gradeAtAvg: 'B' },
    sequenceEfficiency: { min: 70, avg: 80, max: 92, gradeAtAvg: 'B' },
  },
  college: {
    batSpeed: { min: 70, avg: 78, max: 86, gradeAtAvg: 'A-' },
    exitVelocity: { min: 80, avg: 88, max: 96, gradeAtAvg: 'A-' },
    pelvisVelocity: { min: 650, avg: 800, max: 950, gradeAtAvg: 'A-' },
    torsoVelocity: { min: 850, avg: 1050, max: 1250, gradeAtAvg: 'A-' },
    timeInZone: { min: 0.12, avg: 0.16, max: 0.22, gradeAtAvg: 'A-' },
    sequenceEfficiency: { min: 75, avg: 85, max: 95, gradeAtAvg: 'A-' },
  },
  mlb: {
    batSpeed: { min: 75, avg: 82, max: 92, gradeAtAvg: 'A+' },
    exitVelocity: { min: 85, avg: 90, max: 100, gradeAtAvg: 'A+' },
    pelvisVelocity: { min: 700, avg: 850, max: 1000, gradeAtAvg: 'A+' },
    torsoVelocity: { min: 900, avg: 1150, max: 1400, gradeAtAvg: 'A+' },
    timeInZone: { min: 0.14, avg: 0.18, max: 0.24, gradeAtAvg: 'A+' },
    sequenceEfficiency: { min: 80, avg: 88, max: 98, gradeAtAvg: 'A+' },
  },
};

export function getBenchmarksForLevel(level: string | null | undefined): LevelBenchmarks {
  const normalizedLevel = level?.toLowerCase() || 'highschool';
  return benchmarks[normalizedLevel] || benchmarks.highSchool;
}
