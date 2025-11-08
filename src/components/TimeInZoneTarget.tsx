import { Card } from "@/components/ui/card";
import { MetricSourceBadge } from "./MetricSourceBadge";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";

interface TimeInZoneTargetProps {
  timeInZone: number; // in seconds
  level: string;
  grade: LetterGrade;
}

export function TimeInZoneTarget({ timeInZone, level, grade }: TimeInZoneTargetProps) {
  // Determine target size based on time in zone
  // Longer time = bigger target
  const maxTime = level === 'youth' ? 0.18 : level === 'highSchool' ? 0.20 : level === 'college' ? 0.22 : 0.24;
  const minTime = level === 'youth' ? 0.08 : level === 'highSchool' ? 0.10 : level === 'college' ? 0.12 : 0.14;
  
  const percentage = Math.min(Math.max((timeInZone - minTime) / (maxTime - minTime), 0), 1);
  const targetSize = 40 + (percentage * 60); // 40-100px radius
  
  const getStatus = (time: number) => {
    const avg = (maxTime + minTime) / 2;
    if (time >= avg * 1.1) return { text: "BIG TARGET!", color: "text-green-500", emoji: "✓" };
    if (time >= avg * 0.9) return { text: "Good target", color: "text-blue-500", emoji: "⚠" };
    return { text: "Small target", color: "text-yellow-500", emoji: "⚠" };
  };

  const status = getStatus(timeInZone);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h3 className="font-semibold text-lg">TIME IN THE ZONE</h3>
        </div>
        <MetricSourceBadge source="estimated" />
      </div>

      <div className="mb-4 p-2 bg-warning/10 border border-warning/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          ⚠️ <strong>In Development:</strong> Time-in-zone calculation is being refined. 
          Values shown are estimates based on bat path analysis.
        </p>
      </div>

      {/* Target visualization */}
      <div className="relative h-48 flex items-center justify-center mb-4">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Outer rings (always visible) */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            opacity="0.2"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            opacity="0.3"
          />
          <circle
            cx="100"
            cy="100"
            r="50"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            opacity="0.4"
          />
          
          {/* Active target zone (grows with better time) */}
          <circle
            cx="100"
            cy="100"
            r={targetSize}
            fill="hsl(var(--primary))"
            opacity="0.2"
            style={{
              transition: 'r 0.8s ease-out'
            }}
          />
          <circle
            cx="100"
            cy="100"
            r={targetSize}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            style={{
              transition: 'r 0.8s ease-out'
            }}
          />
          
          {/* Bullseye */}
          <text
            x="100"
            y="110"
            textAnchor="middle"
            fontSize="32"
          >
            🎯
          </text>
        </svg>
      </div>

      {/* Time display */}
      <div className="text-center mb-4">
        <div className="text-sm text-muted-foreground mb-1">
          Your bat was in the strike zone for:
        </div>
        <div className="text-3xl font-bold text-primary">
          {timeInZone.toFixed(2)} seconds
        </div>
      </div>

      {/* Status message */}
      <div className={`text-center p-3 rounded-lg bg-muted/50 mb-4`}>
        <div className={`text-lg font-bold ${status.color}`}>
          {status.emoji} {status.text}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {percentage > 0.7
            ? "Easier to hit the ball! Great bat path."
            : percentage > 0.5
            ? "Decent margin for error. Keep working on it."
            : "Work on staying through the zone longer."
          }
        </div>
      </div>

      {/* Info box */}
      <div className="p-3 bg-blue-500/10 rounded-lg mb-4">
        <div className="text-xs text-muted-foreground">
          💡 Longer time = bigger target for the ball to hit your bat!
        </div>
      </div>

      {/* Grade */}
      <div className="text-center">
        <span className="text-muted-foreground">Grade: </span>
        <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>
          {grade}
        </span>
      </div>
    </Card>
  );
}
