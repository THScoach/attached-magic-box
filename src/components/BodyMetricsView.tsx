import { KinematicSequenceRelayRace } from "./KinematicSequenceRelayRace";
import { PowerDistributionBattery } from "./PowerDistributionBattery";
import { TempoMetronome } from "./TempoMetronome";
import { MetricsDisclaimer } from "./MetricsDisclaimer";
import { LetterGrade } from "@/lib/gradingSystem";

interface BodyMetricsViewProps {
  legsPeakVelocity: number;
  corePeakVelocity: number;
  armsPeakVelocity: number;
  batPeakVelocity: number;
  sequenceEfficiency: number;
  sequenceGrade: LetterGrade;
  legsPower: number;
  corePower: number;
  armsPower: number;
  powerGrade: LetterGrade;
  loadTime: number;
  launchTime: number;
  tempoRatio: number;
  tempoGrade: LetterGrade;
  isCorrectSequence?: boolean;
}

export function BodyMetricsView({
  legsPeakVelocity,
  corePeakVelocity,
  armsPeakVelocity,
  batPeakVelocity,
  sequenceEfficiency,
  sequenceGrade,
  legsPower,
  corePower,
  armsPower,
  powerGrade,
  loadTime,
  launchTime,
  tempoRatio,
  tempoGrade,
  isCorrectSequence,
}: BodyMetricsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">💪</span>
        <h2 className="text-2xl font-bold">BODY (Mechanics)</h2>
      </div>

      <MetricsDisclaimer type="body" />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <KinematicSequenceRelayRace
            legsPeakVelocity={legsPeakVelocity}
            corePeakVelocity={corePeakVelocity}
            armsPeakVelocity={armsPeakVelocity}
            batPeakVelocity={batPeakVelocity}
            sequenceEfficiency={sequenceEfficiency}
            grade={sequenceGrade}
            isCorrectSequence={isCorrectSequence}
          />
        </div>
        
        <PowerDistributionBattery
          legsPower={legsPower}
          corePower={corePower}
          armsPower={armsPower}
          grade={powerGrade}
        />
        
        <TempoMetronome
          loadTime={loadTime}
          launchTime={launchTime}
          tempoRatio={tempoRatio}
          grade={tempoGrade}
        />
      </div>
    </div>
  );
}
