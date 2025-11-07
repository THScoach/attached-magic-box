import { Card } from "@/components/ui/card";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";
import { MetricSourceBadge } from "./MetricSourceBadge";

interface BatSpeedSpeedometerProps {
  speed: number;
  level: string;
  grade: LetterGrade;
  personalBest?: number;
  lastWeekSpeed?: number;
}

export function BatSpeedSpeedometer({
  speed,
  level,
  grade,
  personalBest,
  lastWeekSpeed,
}: BatSpeedSpeedometerProps) {
  // Determine the max speed for the gauge based on level
  const maxSpeed = level === 'youth' ? 70 : level === 'highSchool' ? 90 : level === 'college' ? 100 : 110;
  const percentage = (speed / maxSpeed) * 100;
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  // Color zones
  const getZoneColor = (speed: number) => {
    if (level === 'youth') {
      if (speed < 50) return 'text-red-500';
      if (speed < 58) return 'text-yellow-500';
      return 'text-green-500';
    } else if (level === 'highSchool') {
      if (speed < 65) return 'text-red-500';
      if (speed < 73) return 'text-yellow-500';
      return 'text-green-500';
    } else if (level === 'college') {
      if (speed < 75) return 'text-red-500';
      if (speed < 80) return 'text-yellow-500';
      return 'text-green-500';
    } else {
      if (speed < 80) return 'text-red-500';
      if (speed < 85) return 'text-yellow-500';
      return 'text-green-500';
    }
  };

  const improvement = lastWeekSpeed ? speed - lastWeekSpeed : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <h3 className="font-semibold text-lg">YOUR BAT SPEED</h3>
        </div>
        <MetricSourceBadge source="estimated" />
      </div>

      {/* Speedometer Gauge */}
      <div className="relative w-48 h-48 mx-auto mb-4">
        {/* Background arc */}
        <svg viewBox="0 0 200 120" className="w-full">
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
          
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transformOrigin: '100px 100px',
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 1s ease-out'
            }}
          />
          
          {/* Center dot */}
          <circle cx="100" cy="100" r="5" fill="hsl(var(--primary))" />
        </svg>

        {/* Speed display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-4">
          <div className={`text-4xl font-bold ${getZoneColor(speed)}`}>
            {speed}
          </div>
          <div className="text-sm text-muted-foreground">MPH</div>
        </div>
      </div>

      {/* Speed range labels */}
      <div className="flex justify-between text-xs text-muted-foreground mb-4 px-2">
        <span>{level === 'youth' ? '40' : level === 'highSchool' ? '50' : level === 'college' ? '60' : '70'}</span>
        <span>{level === 'youth' ? '55' : level === 'highSchool' ? '70' : level === 'college' ? '80' : '90'}</span>
        <span>{maxSpeed}</span>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mb-4 px-2">
        <span>Youth</span>
        <span>HS</span>
        <span>College</span>
        <span>MLB</span>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
          <span className="text-muted-foreground">🎯 Target:</span>
          <span className="font-medium">
            {level === 'youth' ? '55' : level === 'highSchool' ? '75' : level === 'college' ? '82' : '88'} mph
          </span>
        </div>
        
        {improvement !== 0 && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">📈 Change:</span>
            <span className={`font-medium ${improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {improvement > 0 ? '+' : ''}{improvement} mph from last week!
            </span>
          </div>
        )}
        
        {personalBest && personalBest > speed && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">🏆 Personal Best:</span>
            <span className="font-medium">{personalBest} mph</span>
          </div>
        )}
      </div>

      {/* Grade */}
      <div className="mt-4 text-center">
        <span className="text-muted-foreground">Grade: </span>
        <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>
          {grade}
        </span>
      </div>
    </Card>
  );
}
