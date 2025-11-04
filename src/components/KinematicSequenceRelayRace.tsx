import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";
import { useState } from "react";

interface KinematicSequenceRelayRaceProps {
  legsPeakVelocity: number; // degrees/second
  corePeakVelocity: number;
  armsPeakVelocity: number;
  batPeakVelocity: number;
  sequenceEfficiency: number; // 0-100%
  grade: LetterGrade;
  isCorrectSequence?: boolean;
}

export function KinematicSequenceRelayRace({
  legsPeakVelocity,
  corePeakVelocity,
  armsPeakVelocity,
  batPeakVelocity,
  sequenceEfficiency,
  grade,
  isCorrectSequence = true,
}: KinematicSequenceRelayRaceProps) {
  const [viewMode, setViewMode] = useState<'athlete' | 'coach'>('athlete');

  // Calculate bar widths relative to the fastest segment
  const maxVelocity = Math.max(legsPeakVelocity, corePeakVelocity, armsPeakVelocity, batPeakVelocity);
  const calculateWidth = (velocity: number) => (velocity / maxVelocity) * 100;

  const stars = Math.round((sequenceEfficiency / 100) * 5);

  if (viewMode === 'coach') {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h3 className="font-semibold text-lg">KINEMATIC TIMELINE</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('athlete')}
          >
            Switch to Athlete View
          </Button>
        </div>

        {/* Velocity Graph */}
        <div className="relative h-64 mb-6 bg-muted/30 rounded-lg p-4">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* Grid lines */}
            <line x1="40" y1="20" x2="40" y2="180" stroke="hsl(var(--muted-foreground))" strokeWidth="2" opacity="0.3" />
            <line x1="40" y1="180" x2="380" y2="180" stroke="hsl(var(--muted-foreground))" strokeWidth="2" opacity="0.3" />
            
            {/* Y-axis labels */}
            <text x="30" y="25" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end">2500</text>
            <text x="30" y="100" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end">1250</text>
            <text x="30" y="180" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end">0</text>
            
            {/* X-axis labels */}
            <text x="100" y="195" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">First Move</text>
            <text x="200" y="195" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">Foot Down</text>
            <text x="340" y="195" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">Contact</text>

            {/* Velocity curves */}
            {/* Legs curve (blue) */}
            <path
              d="M 60 180 Q 100 150, 120 140 L 150 145"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
            />
            <circle cx="120" cy="140" r="4" fill="hsl(var(--primary))" />
            
            {/* Core curve (green) */}
            <path
              d="M 120 140 Q 160 110, 180 100 L 220 110"
              fill="none"
              stroke="hsl(var(--success))"
              strokeWidth="3"
            />
            <circle cx="180" cy="100" r="4" fill="hsl(var(--success))" />
            
            {/* Arms curve (orange) */}
            <path
              d="M 180 100 Q 240 60, 280 50 L 320 70"
              fill="none"
              stroke="hsl(var(--warning))"
              strokeWidth="3"
            />
            <circle cx="280" cy="50" r="4" fill="hsl(var(--warning))" />
            
            {/* Bat curve (red) */}
            <path
              d="M 280 50 Q 320 20, 340 15"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="3"
            />
            <circle cx="340" cy="15" r="4" fill="hsl(var(--destructive))" />
            
            {/* Contact line */}
            <line x1="340" y1="20" x2="340" y2="180" stroke="hsl(var(--destructive))" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
          </svg>
        </div>

        {/* Segment Peaks */}
        <div className="space-y-2 mb-4">
          <h4 className="font-semibold text-sm mb-2">Segment Peaks:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-primary">🦵</span>
              <span>Legs: {legsPeakVelocity}°/s</span>
              {isCorrectSequence && <span className="text-green-500">✓</span>}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-success">🔄</span>
              <span>Core: {corePeakVelocity}°/s</span>
              {isCorrectSequence && <span className="text-green-500">✓</span>}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-warning">💪</span>
              <span>Arms: {armsPeakVelocity}°/s</span>
              {isCorrectSequence && <span className="text-green-500">✓</span>}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-destructive">⚾</span>
              <span>Bat: {batPeakVelocity}°/s</span>
              {isCorrectSequence && <span className="text-green-500">✓</span>}
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="p-3 bg-muted/50 rounded-lg mb-4">
          <div className="text-sm">
            {isCorrectSequence ? (
              <p className="text-green-500">✓ All peaks before contact</p>
            ) : (
              <p className="text-yellow-500">⚠ Some peaks after contact</p>
            )}
          </div>
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

  // Athlete View (default)
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏁</span>
          <h3 className="font-semibold text-lg">THE POWER RELAY RACE</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('coach')}
        >
          Switch to Coach View
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>START</span>
          <div className="flex-1 border-t border-dashed border-muted-foreground"></div>
          <span>FINISH (Contact)</span>
        </div>
      </div>

      {/* Relay Race Bars */}
      <div className="space-y-4 mb-6">
        {/* Legs */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🦵</span>
            <span className="text-sm font-medium w-16">Legs</span>
            <div className="flex-1 bg-muted/30 rounded-full h-8 relative overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full flex items-center justify-end pr-3 text-sm font-bold transition-all duration-1000 ease-out"
                style={{ width: `${calculateWidth(legsPeakVelocity)}%` }}
              >
                {legsPeakVelocity}°/s
              </div>
            </div>
            <span className="text-green-500 text-xl">✓</span>
            <span className="text-xs text-muted-foreground w-8">1st</span>
          </div>
        </div>

        {/* Core */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔄</span>
            <span className="text-sm font-medium w-16">Core</span>
            <div className="flex-1 bg-muted/30 rounded-full h-8 relative overflow-hidden">
              <div 
                className="bg-success h-full rounded-full flex items-center justify-end pr-3 text-sm font-bold text-white transition-all duration-1000 ease-out"
                style={{ width: `${calculateWidth(corePeakVelocity)}%`, animationDelay: '0.2s' }}
              >
                {corePeakVelocity}°/s
              </div>
            </div>
            <span className="text-green-500 text-xl">✓</span>
            <span className="text-xs text-muted-foreground w-8">2nd</span>
          </div>
        </div>

        {/* Arms */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💪</span>
            <span className="text-sm font-medium w-16">Arms</span>
            <div className="flex-1 bg-muted/30 rounded-full h-8 relative overflow-hidden">
              <div 
                className="bg-warning h-full rounded-full flex items-center justify-end pr-3 text-sm font-bold transition-all duration-1000 ease-out"
                style={{ width: `${calculateWidth(armsPeakVelocity)}%`, animationDelay: '0.4s' }}
              >
                {armsPeakVelocity}°/s
              </div>
            </div>
            <span className="text-green-500 text-xl">✓</span>
            <span className="text-xs text-muted-foreground w-8">3rd</span>
          </div>
        </div>

        {/* Bat */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚾</span>
            <span className="text-sm font-medium w-16">Bat</span>
            <div className="flex-1 bg-muted/30 rounded-full h-8 relative overflow-hidden">
              <div 
                className="bg-destructive h-full rounded-full flex items-center justify-end pr-3 text-sm font-bold text-white transition-all duration-1000 ease-out"
                style={{ width: `${calculateWidth(batPeakVelocity)}%`, animationDelay: '0.6s' }}
              >
                {batPeakVelocity}°/s
              </div>
            </div>
            <span className="text-xl">🏆</span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="p-4 bg-green-500/10 rounded-lg mb-4">
        <div className="font-bold text-green-500 mb-1">
          {isCorrectSequence ? "✓ Perfect handoff!" : "⚠ Sequence needs work"}
        </div>
        <div className="text-sm text-muted-foreground">
          {isCorrectSequence 
            ? "Each runner passed the baton on time." 
            : "Some runners are starting too early or too late."}
        </div>
      </div>

      {/* Race Efficiency */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold mb-1">
          🏆 Race Efficiency: {Math.round(sequenceEfficiency)}%
        </div>
        <div className="flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-2xl">
              {i < stars ? '⭐' : '☆'}
            </span>
          ))}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          ({stars}/5 stars)
        </div>
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
