import { Card } from "@/components/ui/card";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";
import { Brain } from "lucide-react";

interface ConcentrationMeterProps {
  focusScore: number; // 0-100
  grade: LetterGrade;
  consistencyRating?: number; // 0-100
}

export function ConcentrationMeter({
  focusScore,
  grade,
  consistencyRating = 75,
}: ConcentrationMeterProps) {
  const isElite = focusScore >= 85;
  const isGood = focusScore >= 70;
  
  // Calculate meter angle (-90 to 90 degrees)
  const angle = (focusScore / 100) * 180 - 90;
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6" />
        <h3 className="font-semibold text-lg">CONCENTRATION</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Mental focus and consistency throughout at-bats
      </p>

      {/* Gauge Meter */}
      <div className="relative w-64 h-40 mx-auto mb-6">
        {/* Background Arc */}
        <svg className="w-full h-full" viewBox="0 0 200 120">
          {/* Red Zone */}
          <path
            d="M 20 100 A 80 80 0 0 1 60 30"
            fill="none"
            stroke="hsl(var(--destructive))"
            strokeWidth="20"
            opacity="0.3"
          />
          {/* Yellow Zone */}
          <path
            d="M 60 30 A 80 80 0 0 1 100 10"
            fill="none"
            stroke="hsl(var(--warning))"
            strokeWidth="20"
            opacity="0.3"
          />
          {/* Green Zone */}
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
            transform={`rotate(${angle} 100 100)`}
            className="transition-all duration-500"
          />
          
          {/* Center Circle */}
          <circle cx="100" cy="100" r="8" fill="hsl(var(--primary))" />
        </svg>
        
        {/* Score Display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <div className={`text-4xl font-bold ${
            isElite ? 'text-green-500' : isGood ? 'text-yellow-500' : 'text-orange-500'
          }`}>
            {focusScore}
          </div>
          <div className="text-xs text-muted-foreground">FOCUS SCORE</div>
        </div>
      </div>

      {/* Status */}
      <div className={`p-4 rounded-lg mb-4 ${
        isElite ? 'bg-green-500/10' : isGood ? 'bg-yellow-500/10' : 'bg-orange-500/10'
      }`}>
        <div className={`font-bold mb-1 ${
          isElite ? 'text-green-500' : isGood ? 'text-yellow-500' : 'text-orange-500'
        }`}>
          {isElite ? '🧠 LOCKED IN!' : isGood ? '✓ GOOD FOCUS' : '⚠ IMPROVE CONSISTENCY'}
        </div>
        <div className="text-sm text-muted-foreground">
          {isElite && 'Your mental game is elite! You stay focused pitch-to-pitch.'}
          {isGood && !isElite && 'Solid focus. Work on maintaining it deeper into at-bats.'}
          {!isElite && !isGood && 'Focus on staying locked in from first pitch to last.'}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Mental Consistency</span>
            <span className="text-lg font-bold">{consistencyRating}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${consistencyRating}%` }}
            />
          </div>
        </div>
      </div>

      {/* Focus Tips */}
      <div className="p-4 bg-accent/50 rounded-lg mb-4">
        <div className="font-bold mb-2 text-sm">🎯 Focus Tips:</div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Deep breath between pitches</li>
          <li>• Reset after every pitch</li>
          <li>• Stay in the present moment</li>
          <li>• Trust your preparation</li>
        </ul>
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
