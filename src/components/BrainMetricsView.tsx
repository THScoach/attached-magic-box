import { ReactionTimeStopwatch } from "./ReactionTimeStopwatch";
import { SwingDecisionTrafficLight } from "./SwingDecisionTrafficLight";
import { ConcentrationMeter } from "./ConcentrationMeter";
import { LetterGrade } from "@/lib/gradingSystem";

interface BrainMetricsViewProps {
  reactionTime: number;
  reactionTimeGrade: LetterGrade;
  averageReactionTime?: number;
  goodSwingsPercentage: number;
  goodTakesPercentage: number;
  chaseRate: number;
  swingDecisionGrade: LetterGrade;
  totalPitches?: number;
  focusScore: number;
  focusGrade: LetterGrade;
  consistencyRating?: number;
}

export function BrainMetricsView({
  reactionTime,
  reactionTimeGrade,
  averageReactionTime,
  goodSwingsPercentage,
  goodTakesPercentage,
  chaseRate,
  swingDecisionGrade,
  totalPitches,
  focusScore,
  focusGrade,
  consistencyRating,
}: BrainMetricsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">🧠</span>
        <h2 className="text-2xl font-bold">BRAIN (Mental)</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ReactionTimeStopwatch
          reactionTime={reactionTime}
          grade={reactionTimeGrade}
          averageReactionTime={averageReactionTime}
        />
        
        <SwingDecisionTrafficLight
          goodSwingsPercentage={goodSwingsPercentage}
          goodTakesPercentage={goodTakesPercentage}
          chaseRate={chaseRate}
          grade={swingDecisionGrade}
          totalPitches={totalPitches}
        />
        
        <div className="lg:col-span-2">
          <ConcentrationMeter
            focusScore={focusScore}
            grade={focusGrade}
            consistencyRating={consistencyRating}
          />
        </div>
      </div>
    </div>
  );
}
