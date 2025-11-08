import { ReactionTimeStopwatch } from "./ReactionTimeStopwatch";
import { SwingDecisionTrafficLight } from "./SwingDecisionTrafficLight";
import { ConcentrationMeter } from "./ConcentrationMeter";
import { MetricSourceBadge } from "./MetricSourceBadge";
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
  dataSource?: "video" | "sensor" | "estimated";
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
  dataSource = "estimated",
}: BrainMetricsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧠</span>
          <h2 className="text-2xl font-bold">BRAIN (Mental)</h2>
        </div>
        <MetricSourceBadge source={dataSource} />
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
