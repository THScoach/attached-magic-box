import { Card } from "@/components/ui/card";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";

interface ExitVelocityRocketProps {
  exitVelocity: number; // mph
  level: string;
  grade: LetterGrade;
  improvement?: number; // mph change from last measurement
}

export function ExitVelocityRocket({
  exitVelocity,
  level,
  grade,
  improvement,
}: ExitVelocityRocketProps) {
  // Determine the max speed for the gauge based on level
  const maxSpeed = level === 'youth' ? 80 : level === 'highSchool' ? 95 : level === 'college' ? 105 : 115;
  const percentage = (exitVelocity / maxSpeed) * 100;
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  // Color zones
  const getZoneColor = (velocity: number) => {
    if (level === 'youth') {
      if (velocity < 60) return 'text-red-500';
      if (velocity < 68) return 'text-yellow-500';
      return 'text-green-500';
    } else if (level === 'highSchool') {
      if (velocity < 75) return 'text-red-500';
      if (velocity < 83) return 'text-yellow-500';
      return 'text-green-500';
    } else if (level === 'college') {
      if (velocity < 85) return 'text-red-500';
      if (velocity < 91) return 'text-yellow-500';
      return 'text-green-500';
    } else {
      if (velocity < 88) return 'text-red-500';
      if (velocity < 93) return 'text-yellow-500';
      return 'text-green-500';
    }
  };

  const mlbAvg = 90;
  const isAboveMLB = exitVelocity >= mlbAvg;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🚀</span>
        <h3 className="font-semibold text-lg">EXIT VELOCITY</h3>
      </div>

      {/* Speedometer Gauge */}
      <div className="relative w-48 h-48 mx-auto mb-4">
        <svg viewBox="0 0 200 120" className="w-full">
          {/* Background arc */}
          {/* Red zone */}
          <path
            d="M 20 100 A 80 80 0 0 1 60 30"
            fill="none"
            stroke="hsl(var(--destructive))"
            strokeWidth="20"
            opacity="0.3"
          />
          {/* Yellow zone */}
          <path
            d="M 60 30 A 80 80 0 0 1 100 10"
            fill="none"
            stroke="hsl(var(--warning))"
            strokeWidth="20"
            opacity="0.3"
          />
          {/* Green zone */}
          <path
            d="M 100 10 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--success))"
            strokeWidth="20"
            opacity="0.3"
          />
          
          {/* Rocket as needle */}
          <g
            style={{
              transformOrigin: '100px 100px',
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 1s ease-out'
            }}
          >
            <text
              x="100"
              y="35"
              fontSize="28"
              textAnchor="middle"
            >
              🚀
            </text>
          </g>
          
          {/* Center dot */}
          <circle cx="100" cy="100" r="5" fill="hsl(var(--primary))" />
        </svg>

        {/* Speed display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-4">
          <div className={`text-4xl font-bold ${getZoneColor(exitVelocity)}`}>
            {exitVelocity}
          </div>
          <div className="text-sm text-muted-foreground">MPH</div>
        </div>
      </div>

      {/* Speed range labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-6 px-2">
        <span>{level === 'youth' ? '50' : level === 'highSchool' ? '60' : level === 'college' ? '70' : '80'}</span>
        <span>{level === 'youth' ? '65' : level === 'highSchool' ? '80' : level === 'college' ? '90' : '95'}</span>
        <span>{maxSpeed}</span>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
          <span className="text-muted-foreground">🎯 MLB Average:</span>
          <span className="font-medium">{mlbAvg} mph</span>
        </div>
        
        {isAboveMLB && (
          <div className="p-2 bg-green-500/10 rounded text-center">
            <span className="font-bold text-green-500">
              🔥 You're ABOVE MLB average!
            </span>
          </div>
        )}
        
        {improvement !== undefined && improvement !== 0 && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">📈 Change:</span>
            <span className={`font-medium ${improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {improvement > 0 ? '+' : ''}{improvement} mph from last month!
            </span>
          </div>
        )}
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
