import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface BenchmarkComparisonProps {
  metricName: string;
  userValue: number;
  unit: string;
  benchmarks: {
    youth: number;
    highSchool: number;
    college: number;
    pro: number;
  };
  higherIsBetter?: boolean;
}

export function BenchmarkComparison({
  metricName,
  userValue,
  unit,
  benchmarks,
  higherIsBetter = true,
}: BenchmarkComparisonProps) {
  const levels = [
    { name: "Youth", value: benchmarks.youth, color: "bg-blue-500" },
    { name: "High School", value: benchmarks.highSchool, color: "bg-green-500" },
    { name: "College", value: benchmarks.college, color: "bg-yellow-500" },
    { name: "Pro", value: benchmarks.pro, color: "bg-red-500" },
  ];

  const getUserLevel = () => {
    if (higherIsBetter) {
      if (userValue >= benchmarks.pro) return "Pro";
      if (userValue >= benchmarks.college) return "College";
      if (userValue >= benchmarks.highSchool) return "High School";
      if (userValue >= benchmarks.youth) return "Youth";
      return "Developing";
    } else {
      if (userValue <= benchmarks.pro) return "Pro";
      if (userValue <= benchmarks.college) return "College";
      if (userValue <= benchmarks.highSchool) return "High School";
      if (userValue <= benchmarks.youth) return "Youth";
      return "Developing";
    }
  };

  const getProgressPercentage = (target: number) => {
    if (higherIsBetter) {
      return Math.min((userValue / target) * 100, 100);
    } else {
      return Math.min((target / userValue) * 100, 100);
    }
  };

  const userLevel = getUserLevel();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{metricName}</h3>
        <Badge variant={userLevel === "Pro" ? "default" : "secondary"}>
          {userLevel} Level
        </Badge>
      </div>

      <div className="text-3xl font-bold mb-6">
        {userValue.toFixed(1)} <span className="text-lg text-muted-foreground">{unit}</span>
      </div>

      <div className="space-y-4">
        {levels.map((level) => (
          <div key={level.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{level.name}</span>
              <span className="text-muted-foreground">
                {level.value.toFixed(1)} {unit}
              </span>
            </div>
            <div className="relative">
              <Progress value={getProgressPercentage(level.value)} className="h-2" />
              {userValue >= level.value && higherIsBetter && (
                <div className="absolute right-0 -top-1">
                  <span className="text-xs">✓</span>
                </div>
              )}
              {userValue <= level.value && !higherIsBetter && (
                <div className="absolute right-0 -top-1">
                  <span className="text-xs">✓</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          {higherIsBetter
            ? `You're performing at ${userLevel} level. Keep pushing to reach the next milestone!`
            : `Your efficiency is at ${userLevel} level. Lower is better for this metric.`}
        </p>
      </div>
    </Card>
  );
}
