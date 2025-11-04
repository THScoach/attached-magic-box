import { Card } from "@/components/ui/card";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";

interface SwingDecisionTrafficLightProps {
  goodSwingsPercentage: number; // Swung at good pitches
  goodTakesPercentage: number; // Took good pitches
  chaseRate: number; // Swung at bad pitches
  grade: LetterGrade;
  totalPitches?: number;
}

export function SwingDecisionTrafficLight({
  goodSwingsPercentage,
  goodTakesPercentage,
  chaseRate,
  grade,
  totalPitches = 100,
}: SwingDecisionTrafficLightProps) {
  // Overall decision quality score
  const decisionScore = ((goodSwingsPercentage + goodTakesPercentage) / 2) - (chaseRate / 2);
  const isElite = decisionScore >= 75 && chaseRate < 25;
  const isGood = decisionScore >= 60 && chaseRate < 35;
  
  // Determine which light is active
  const activeLight = isElite ? 'green' : isGood ? 'yellow' : 'red';
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🚦</span>
        <h3 className="font-semibold text-lg">SWING DECISIONS</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Quality of your pitch selection and swing decisions
      </p>

      {/* Traffic Light */}
      <div className="flex justify-center mb-6">
        <div className="bg-card-foreground/10 rounded-3xl p-4 w-32 space-y-4">
          {/* Red Light - Chase Rate */}
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
            activeLight === 'red' 
              ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
              : 'bg-red-500/20'
          }`}>
            {activeLight === 'red' && <span className="text-3xl">⚠️</span>}
          </div>
          
          {/* Yellow Light - Good */}
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
            activeLight === 'yellow' 
              ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse' 
              : 'bg-yellow-500/20'
          }`}>
            {activeLight === 'yellow' && <span className="text-3xl">✓</span>}
          </div>
          
          {/* Green Light - Elite */}
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
            activeLight === 'green' 
              ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
              : 'bg-green-500/20'
          }`}>
            {activeLight === 'green' && <span className="text-3xl">🎯</span>}
          </div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="space-y-3 mb-4">
        {/* Good Swings */}
        <div className="p-3 rounded-lg bg-green-500/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-green-500">✓ Good Swings</span>
            <span className="text-lg font-bold text-green-500">{goodSwingsPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${goodSwingsPercentage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Swung at hittable pitches
          </div>
        </div>

        {/* Good Takes */}
        <div className="p-3 rounded-lg bg-blue-500/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-blue-500">👁️ Good Takes</span>
            <span className="text-lg font-bold text-blue-500">{goodTakesPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${goodTakesPercentage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Laid off bad pitches
          </div>
        </div>

        {/* Chase Rate */}
        <div className="p-3 rounded-lg bg-red-500/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-red-500">⚠️ Chase Rate</span>
            <span className="text-lg font-bold text-red-500">{chaseRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${chaseRate}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Swung at unhittable pitches
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-lg mb-4 ${
        isElite ? 'bg-green-500/10' : isGood ? 'bg-yellow-500/10' : 'bg-red-500/10'
      }`}>
        <div className={`font-bold mb-1 ${
          isElite ? 'text-green-500' : isGood ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {isElite && '🎯 ELITE DISCIPLINE!'}
          {isGood && !isElite && '✓ SOLID DECISIONS'}
          {!isElite && !isGood && '⚠️ WORK ON PLATE DISCIPLINE'}
        </div>
        <div className="text-sm text-muted-foreground">
          {isElite && 'You have outstanding pitch recognition and discipline!'}
          {isGood && !isElite && 'Good decision making. Keep refining your pitch selection.'}
          {!isElite && !isGood && 'Focus on recognizing pitches earlier and controlling the strike zone.'}
        </div>
      </div>

      {/* Total Pitches */}
      {totalPitches && (
        <div className="p-3 bg-muted/50 rounded-lg mb-4 text-center">
          <div className="text-sm text-muted-foreground">Based on</div>
          <div className="text-2xl font-bold">{totalPitches}</div>
          <div className="text-sm text-muted-foreground">total pitches</div>
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
