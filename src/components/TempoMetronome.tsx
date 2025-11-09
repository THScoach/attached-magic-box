import { Card } from "@/components/ui/card";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";
import { MetricSourceBadge } from "./MetricSourceBadge";
import { TempoDataSourceIndicator } from "./TempoDataSourceIndicator";

interface TempoMetronomeProps {
  loadTime: number; // seconds
  launchTime: number; // seconds
  tempoRatio: number; // load:launch ratio
  grade: LetterGrade;
  rebootTempoRatio?: number; // Optional Reboot Motion tempo for comparison
}

export function TempoMetronome({
  loadTime,
  launchTime,
  tempoRatio,
  grade,
  rebootTempoRatio,
}: TempoMetronomeProps) {
  const isOptimal = tempoRatio >= 1.5 && tempoRatio <= 2.0;
  const totalTime = loadTime + launchTime;
  const loadPercentage = (loadTime / totalTime) * 100;
  const launchPercentage = (launchTime / totalTime) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <h3 className="font-semibold text-lg">SWING TEMPO</h3>
        </div>
        <MetricSourceBadge source="video" />
      </div>

      {/* Data Source Comparison */}
      <div className="mb-4">
        <TempoDataSourceIndicator 
          hitsTempoRatio={tempoRatio}
          rebootTempoRatio={rebootTempoRatio}
        />
      </div>

      <div className="mb-6">
        <div className="text-sm text-muted-foreground text-center mb-2">
          Load → Launch
        </div>
        
        {/* Visual representation */}
        <div className="flex gap-2 mb-4">
          <div 
            className="bg-primary/20 border-2 border-primary rounded flex items-center justify-center relative"
            style={{ width: `${loadPercentage}%`, minHeight: '80px' }}
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Load</div>
              <div className="text-lg font-bold">{loadTime.toFixed(2)}s</div>
            </div>
          </div>
          <div 
            className="bg-success/20 border-2 border-success rounded flex items-center justify-center relative"
            style={{ width: `${launchPercentage}%`, minHeight: '80px' }}
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Launch</div>
              <div className="text-lg font-bold">{launchTime.toFixed(2)}s</div>
            </div>
          </div>
        </div>

        {/* Tempo Ratio Display */}
        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground mb-1">Tempo Ratio:</div>
          <div className="text-4xl font-bold text-primary">
            {tempoRatio.toFixed(1)}:1
          </div>
        </div>
      </div>

      {/* Status */}
      <div className={`p-4 rounded-lg mb-4 ${isOptimal ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
        <div className={`font-bold mb-1 ${isOptimal ? 'text-green-500' : 'text-yellow-500'}`}>
          {isOptimal ? '✓ SMOOTH & RHYTHMIC!' : '⚠ Tempo needs adjustment'}
        </div>
        <div className="text-sm text-muted-foreground">
          {isOptimal 
            ? "Your swing has good rhythm - not too fast, not too slow."
            : tempoRatio < 1.5 
              ? "Your load phase is too short. Take more time to gather energy."
              : "Your load phase is too long. Work on being more explosive."}
        </div>
      </div>

      {/* Ideal Range */}
      <div className="p-3 bg-muted/50 rounded-lg mb-4">
        <div className="text-sm">
          <span className="font-semibold">Ideal:</span> 1.5:1 to 2.0:1
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Load phase should be about 1.5-2x longer than launch phase
        </div>
      </div>

      {/* Metronome Visual */}
      <div className="flex justify-center mb-4">
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          {/* Metronome base */}
          <path
            d="M 30 90 L 40 70 L 60 70 L 70 90 Z"
            fill="hsl(var(--muted))"
          />
          {/* Metronome arm */}
          <line
            x1="50"
            y1="70"
            x2="50"
            y2="20"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transformOrigin: '50px 70px',
              transform: `rotate(${isOptimal ? '0deg' : '-15deg'})`,
              transition: 'transform 1s ease-in-out'
            }}
          />
          {/* Weight at top */}
          <circle
            cx="50"
            cy="20"
            r="5"
            fill="hsl(var(--primary))"
            style={{
              transformOrigin: '50px 70px',
              transform: `rotate(${isOptimal ? '0deg' : '-15deg'})`,
              transition: 'transform 1s ease-in-out'
            }}
          />
        </svg>
      </div>

      <div className="text-center">
        <span className="text-muted-foreground">Grade: </span>
        <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>
          {grade}
        </span>
      </div>
    </Card>
  );
}
