import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";

interface LaunchAngleSprayChartProps {
  flyBallPercentage: number; // 0-100
  lineDrivePercentage: number; // 0-100
  groundBallPercentage: number; // 0-100
  grade: LetterGrade;
}

export function LaunchAngleSprayChart({
  flyBallPercentage,
  lineDrivePercentage,
  groundBallPercentage,
  grade,
}: LaunchAngleSprayChartProps) {
  const isOptimal = lineDrivePercentage >= 50;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h3 className="font-semibold text-lg">LAUNCH ANGLE MIX</h3>
      </div>

      {/* Visual Field Representation */}
      <div className="relative h-48 mb-6 bg-gradient-to-t from-green-500/10 via-blue-500/10 to-sky-500/10 rounded-lg overflow-hidden">
        <svg viewBox="0 0 300 200" className="w-full h-full">
          {/* Field lines */}
          <line x1="150" y1="200" x2="150" y2="0" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
          <line x1="0" y1="150" x2="300" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="300" y2="100" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
          
          {/* Ground balls (bottom third) */}
          <rect x="0" y="150" width="300" height="50" fill="hsl(var(--destructive))" opacity="0.2" />
          <text x="150" y="180" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">
            Ground Balls
          </text>
          
          {/* Line drives (middle third) */}
          <rect x="0" y="100" width="300" height="50" fill="hsl(var(--success))" opacity="0.3" />
          <text x="150" y="130" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">
            Line Drives ✓
          </text>
          
          {/* Fly balls (top third) */}
          <rect x="0" y="50" width="300" height="50" fill="hsl(var(--primary))" opacity="0.2" />
          <text x="150" y="80" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">
            Fly Balls
          </text>
          
          {/* Batter position */}
          <circle cx="150" cy="195" r="5" fill="hsl(var(--primary))" />
        </svg>
      </div>

      {/* Percentage Bars */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Fly Balls</span>
            <span className="text-sm font-bold">{flyBallPercentage}%</span>
          </div>
          <Progress value={flyBallPercentage} className="h-3" />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Line Drives</span>
              {lineDrivePercentage >= 50 && <span className="text-green-500">✓</span>}
            </div>
            <span className="text-sm font-bold text-green-500">{lineDrivePercentage}%</span>
          </div>
          <Progress 
            value={lineDrivePercentage} 
            className="h-3 [&>div]:bg-success" 
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Ground Balls</span>
            <span className="text-sm font-bold">{groundBallPercentage}%</span>
          </div>
          <Progress 
            value={groundBallPercentage} 
            className="h-3 [&>div]:bg-destructive" 
          />
        </div>
      </div>

      {/* Status */}
      <div className={`p-4 rounded-lg mb-4 ${isOptimal ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
        <div className={`font-bold mb-1 ${isOptimal ? 'text-green-500' : 'text-yellow-500'}`}>
          {isOptimal ? '✓ Perfect mix!' : '⚠ Work on launch angle'}
        </div>
        <div className="text-sm text-muted-foreground">
          {isOptimal 
            ? "You're hitting the ball hard and in the air."
            : "Try to hit more line drives - aim for 50%+ of contact."}
        </div>
      </div>

      {/* Ideal target */}
      <div className="p-3 bg-muted/50 rounded-lg mb-4">
        <div className="text-sm">
          <span className="font-semibold">🎯 Ideal:</span> 50%+ line drives
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
