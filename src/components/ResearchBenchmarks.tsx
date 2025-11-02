import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { SwingAnalysis } from "@/types/swing";
import { TrendingUp, TrendingDown, Minus, Award } from "lucide-react";

interface ResearchBenchmarksProps {
  analysis: SwingAnalysis;
}

interface BenchmarkMetric {
  label: string;
  value: number;
  unit: string;
  eliteRange: [number, number];
  mlbAverage: number;
  percentile: number;
  citation: string;
}

export function ResearchBenchmarks({ analysis }: ResearchBenchmarksProps) {
  const calculatePercentile = (value: number, eliteMin: number, eliteMax: number, mlbAvg: number): number => {
    if (value >= eliteMax) return 95;
    if (value >= mlbAvg) return 50 + ((value - mlbAvg) / (eliteMax - mlbAvg)) * 45;
    if (value >= eliteMin) return 25 + ((value - eliteMin) / (mlbAvg - eliteMin)) * 25;
    return Math.max(5, (value / eliteMin) * 25);
  };

  const getPercentileColor = (percentile: number): string => {
    if (percentile >= 75) return "text-green-500";
    if (percentile >= 50) return "text-yellow-500";
    if (percentile >= 25) return "text-orange-500";
    return "text-red-500";
  };

  const getPercentileBadge = (percentile: number): string => {
    if (percentile >= 90) return "Elite (Top 10%)";
    if (percentile >= 75) return "Advanced (Top 25%)";
    if (percentile >= 50) return "Average MLB";
    if (percentile >= 25) return "Developing";
    return "Beginner";
  };

  const getTrendIcon = (percentile: number) => {
    if (percentile >= 75) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentile >= 50) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  // Use Reboot Motion in-game data benchmarks (actual MLB game performance)
  const benchmarks: BenchmarkMetric[] = [
    {
      label: "Tempo Ratio",
      value: analysis.tempoRatio || 0,
      unit: ":1",
      eliteRange: [2.0, 2.6],
      mlbAverage: 2.43, // Reboot Motion Freeman data
      percentile: calculatePercentile(analysis.tempoRatio || 0, 1.5, 2.6, 2.43),
      citation: "Reboot Motion (2025)"
    },
    {
      label: "Pelvis Max Velocity",
      value: analysis.pelvisMaxVelocity || 0,
      unit: "°/s",
      eliteRange: [550, 700],
      mlbAverage: 600,
      percentile: calculatePercentile(analysis.pelvisMaxVelocity || 0, 450, 700, 600),
      citation: "Reboot Motion (2025)"
    },
    {
      label: "Torso Max Velocity",
      value: analysis.torsoMaxVelocity || 0,
      unit: "°/s",
      eliteRange: [900, 1200],
      mlbAverage: 1050,
      percentile: calculatePercentile(analysis.torsoMaxVelocity || 0, 800, 1200, 1050),
      citation: "Reboot Motion (2025)"
    },
    {
      label: "Bat Speed",
      value: analysis.batMaxVelocity || 0,
      unit: "mph",
      eliteRange: [70, 76],
      mlbAverage: 72,
      percentile: calculatePercentile(analysis.batMaxVelocity || 0, 65, 76, 72),
      citation: "Reboot Motion (2025)"
    },
    {
      label: "X-Factor (Peak Separation)",
      value: Math.abs(analysis.xFactor || 0),
      unit: "°",
      eliteRange: [25, 40],
      mlbAverage: 27,
      percentile: calculatePercentile(Math.abs(analysis.xFactor || 0), 20, 40, 27),
      citation: "Reboot Motion (2025)"
    },
    {
      label: "COM Max Velocity",
      value: analysis.comMaxVelocity || 0,
      unit: "m/s",
      eliteRange: [1.0, 1.2],
      mlbAverage: 1.06, // Reboot Motion Freeman data
      percentile: calculatePercentile(analysis.comMaxVelocity || 0, 0.6, 1.2, 1.06),
      citation: "Reboot Motion (2025)"
    },
    {
      label: "Front Foot GRF",
      value: analysis.frontFootGRF || 0,
      unit: "% BW",
      eliteRange: [120, 130],
      mlbAverage: 123,
      percentile: calculatePercentile(analysis.frontFootGRF || 0, 100, 130, 123),
      citation: "Reboot Motion (2025)"
    },
    {
      label: "COM Peak Timing",
      value: analysis.comPeakTiming || 0,
      unit: "ms",
      eliteRange: [100, 190],
      mlbAverage: 110,
      percentile: 100 - calculatePercentile(Math.abs((analysis.comPeakTiming || 110) - 110), 0, 50, 20),
      citation: "Reboot Motion (2025)"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Research-Validated Benchmarks</CardTitle>
          </div>
          <InfoTooltip content="Metrics compared against peer-reviewed research from elite MLB players (Welch et al. 1995, Fortenbaugh 2011)" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {benchmarks.map((benchmark, index) => (
            <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getTrendIcon(benchmark.percentile)}
                    <h4 className="font-medium">{benchmark.label}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`text-2xl font-bold ${getPercentileColor(benchmark.percentile)}`}>
                      {benchmark.value.toFixed(benchmark.unit === "°" || benchmark.unit === "°/s" ? 0 : 1)}{benchmark.unit}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        MLB Avg: {benchmark.mlbAverage}{benchmark.unit}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Elite: {benchmark.eliteRange[0]}-{benchmark.eliteRange[1]}{benchmark.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={benchmark.percentile >= 75 ? "default" : benchmark.percentile >= 50 ? "secondary" : "outline"}>
                    {getPercentileBadge(benchmark.percentile)}
                  </Badge>
                  <span className={`text-xs font-semibold ${getPercentileColor(benchmark.percentile)}`}>
                    {benchmark.percentile.toFixed(0)}th percentile
                  </span>
                  <span className="text-xs text-muted-foreground italic">
                    {benchmark.citation}
                  </span>
                </div>
              </div>
              
              {/* Visual percentile bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full transition-all ${
                    benchmark.percentile >= 75 ? "bg-green-500" :
                    benchmark.percentile >= 50 ? "bg-yellow-500" :
                    benchmark.percentile >= 25 ? "bg-orange-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, benchmark.percentile))}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Research Citations
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>Reboot Motion (2025)</strong> - In-game biomechanical data from MLB players using 
              wearable sensor technology. Captures actual game performance under live pitching conditions,
              providing more realistic benchmarks than controlled laboratory studies.
            </p>
            <p className="text-xs italic">
              Note: Lab-based studies (Welch 1995, Fortenbaugh 2011) show higher values due to controlled 
              conditions. Reboot Motion game data reflects real-world performance constraints.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
