import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";

interface PowerDistributionBatteryProps {
  legsPower: number; // percentage 0-100
  corePower: number;
  armsPower: number;
  grade: LetterGrade;
}

export function PowerDistributionBattery({
  legsPower,
  corePower,
  armsPower,
  grade,
}: PowerDistributionBatteryProps) {
  const getStatus = (value: number, ideal: { min: number; max: number }) => {
    if (value >= ideal.min && value <= ideal.max) return { text: "STRONG!", color: "text-green-500", emoji: "✓" };
    if (value < ideal.min) return { text: "Could be stronger", color: "text-yellow-500", emoji: "⚠" };
    return { text: "Good!", color: "text-green-500", emoji: "✓" };
  };

  const legsStatus = getStatus(legsPower, { min: 60, max: 70 });
  const coreStatus = getStatus(corePower, { min: 20, max: 30 });
  const armsStatus = getStatus(armsPower, { min: 10, max: 15 });

  const getRecommendation = () => {
    if (corePower < 20) {
      return {
        title: "🎯 Recommended Drill:",
        drill: "Medicine Ball Rotational Throws",
        description: "(strengthen core)"
      };
    }
    if (legsPower < 60) {
      return {
        title: "🎯 Recommended Drill:",
        drill: "Lower Body Rotational Exercises",
        description: "(strengthen legs)"
      };
    }
    return null;
  };

  const recommendation = getRecommendation();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔋</span>
        <h3 className="font-semibold text-lg">POWER SOURCES</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Where's your power coming from?
      </p>

      {/* Legs Battery */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦵</span>
            <span className="font-medium">Legs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{legsPower}%</span>
            <span className={legsStatus.color}>{legsStatus.emoji}</span>
          </div>
        </div>
        <Progress value={legsPower} className="h-6 mb-1" />
        <div className="text-sm">
          <span className={legsStatus.color + " font-medium"}>
            {legsStatus.text}
          </span>
        </div>
      </div>

      {/* Core Battery */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <span className="font-medium">Core</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{corePower}%</span>
            <span className={coreStatus.color}>{coreStatus.emoji}</span>
          </div>
        </div>
        <Progress value={corePower} className="h-6 mb-1" />
        <div className="text-sm">
          <span className={coreStatus.color + " font-medium"}>
            {coreStatus.text}
          </span>
        </div>
      </div>

      {/* Arms Battery */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">💪</span>
            <span className="font-medium">Arms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{armsPower}%</span>
            <span className={armsStatus.color}>{armsStatus.emoji}</span>
          </div>
        </div>
        <Progress value={armsPower} className="h-6 mb-1" />
        <div className="text-sm">
          <span className={armsStatus.color + " font-medium"}>
            {armsStatus.text}
          </span>
        </div>
      </div>

      {/* Analysis */}
      <div className="p-4 bg-blue-500/10 rounded-lg mb-4">
        <p className="text-sm">
          💡 {legsPower >= 60 
            ? "Your legs are doing the heavy lifting! (Good!)" 
            : "Try to generate more power from your legs."}
        </p>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="p-4 bg-muted/50 rounded-lg mb-4">
          <div className="font-semibold mb-2">{recommendation.title}</div>
          <div className="text-sm">
            <span className="font-medium">{recommendation.drill}</span>
            <br />
            <span className="text-muted-foreground">{recommendation.description}</span>
          </div>
        </div>
      )}

      <div className="text-center">
        <span className="text-muted-foreground">Grade: </span>
        <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>
          {grade}
        </span>
      </div>
    </Card>
  );
}
