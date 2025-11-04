import { Card } from "@/components/ui/card";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";
import { Timer } from "lucide-react";

interface ReactionTimeStopwatchProps {
  reactionTime: number; // in milliseconds
  grade: LetterGrade;
  averageReactionTime?: number;
}

export function ReactionTimeStopwatch({
  reactionTime,
  grade,
  averageReactionTime = 180,
}: ReactionTimeStopwatchProps) {
  // Elite reaction time is < 150ms, good is 150-180ms, needs work is > 180ms
  const isElite = reactionTime < 150;
  const isGood = reactionTime >= 150 && reactionTime <= 180;
  
  // Format time in milliseconds
  const formattedTime = reactionTime.toFixed(0);
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-6 h-6" />
        <h3 className="font-semibold text-lg">REACTION TIME</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Time from pitch release to swing decision
      </p>

      {/* Stopwatch Display */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        {/* Outer Circle */}
        <div className="absolute inset-0 rounded-full border-8 border-muted flex items-center justify-center">
          {/* Time Display */}
          <div className="text-center">
            <div className={`text-5xl font-bold ${isElite ? 'text-green-500' : isGood ? 'text-yellow-500' : 'text-orange-500'}`}>
              {formattedTime}
            </div>
            <div className="text-sm text-muted-foreground mt-1">milliseconds</div>
          </div>
        </div>
        
        {/* Tick Marks */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-3 bg-muted rounded"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 30}deg) translate(-50%, -90px)`,
              transformOrigin: '50% 90px',
            }}
          />
        ))}
        
        {/* Stopwatch Hand */}
        <div
          className={`absolute w-1 bg-primary rounded-full transition-all duration-500`}
          style={{
            height: '70px',
            top: '24px',
            left: '50%',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${(reactionTime / 200) * 180}deg)`,
          }}
        />
        
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Status */}
      <div className={`p-4 rounded-lg mb-4 ${
        isElite ? 'bg-green-500/10' : isGood ? 'bg-yellow-500/10' : 'bg-orange-500/10'
      }`}>
        <div className={`font-bold mb-1 ${
          isElite ? 'text-green-500' : isGood ? 'text-yellow-500' : 'text-orange-500'
        }`}>
          {isElite ? '⚡ LIGHTNING FAST!' : isGood ? '✓ SOLID TIMING' : '⚠ WORK ON RECOGNITION'}
        </div>
        <div className="text-sm text-muted-foreground">
          {isElite && 'Your reaction time is elite level! You recognize pitches instantly.'}
          {isGood && 'Good reaction time. You can recognize most pitches effectively.'}
          {!isElite && !isGood && 'Focus on earlier pitch recognition. See the ball earlier!'}
        </div>
      </div>

      {/* Benchmarks */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm p-2 rounded bg-green-500/10">
          <span className="font-semibold text-green-500">⚡ Elite:</span>
          <span className="font-medium">&lt; 150ms</span>
        </div>
        <div className="flex items-center justify-between text-sm p-2 rounded bg-yellow-500/10">
          <span className="font-semibold text-yellow-500">✓ Good:</span>
          <span className="font-medium">150-180ms</span>
        </div>
        <div className="flex items-center justify-between text-sm p-2 rounded bg-orange-500/10">
          <span className="font-semibold text-orange-500">⚠ Needs Work:</span>
          <span className="font-medium">&gt; 180ms</span>
        </div>
      </div>

      {/* Comparison */}
      {averageReactionTime && (
        <div className="p-3 bg-muted/50 rounded-lg mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Your Average:</span>
            <span className="font-medium">{averageReactionTime.toFixed(0)}ms</span>
          </div>
        </div>
      )}

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
