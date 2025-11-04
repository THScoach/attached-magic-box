import { Card } from "@/components/ui/card";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";

interface AttackAngleLaunchRampProps {
  angle: number;
  grade: LetterGrade;
}

export function AttackAngleLaunchRamp({ angle, grade }: AttackAngleLaunchRampProps) {
  // Determine zone status
  const getStatus = (angle: number) => {
    if (angle >= 8 && angle <= 15) return { text: "SWEET SPOT", color: "text-green-500", emoji: "✓" };
    if (angle < 8) return { text: "Too Flat", color: "text-yellow-500", emoji: "⚠" };
    return { text: "Too Steep", color: "text-yellow-500", emoji: "⚠" };
  };

  const status = getStatus(angle);
  const rampRotation = Math.min(Math.max(angle, -5), 30); // Clamp between -5 and 30 degrees

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🚀</span>
        <h3 className="font-semibold text-lg">YOUR LAUNCH ANGLE</h3>
      </div>

      {/* Launch Ramp Visualization */}
      <div className="relative h-48 flex items-end justify-center mb-6">
        <svg viewBox="0 0 300 200" className="w-full h-full">
          {/* Ground line */}
          <line
            x1="20"
            y1="180"
            x2="280"
            y2="180"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="3"
            opacity="0.3"
          />
          
          {/* Ramp/Bat path */}
          <line
            x1="100"
            y1="180"
            x2="230"
            y2="180"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              transformOrigin: '100px 180px',
              transform: `rotate(-${rampRotation}deg)`,
              transition: 'transform 0.8s ease-out'
            }}
          />
          
          {/* Rocket at end of ramp */}
          <text
            x="230"
            y="180"
            fontSize="24"
            style={{
              transformOrigin: '240px 180px',
              transform: `rotate(-${rampRotation}deg) translate(10px, 0)`,
              transition: 'transform 0.8s ease-out'
            }}
          >
            🚀
          </text>
          
          {/* Angle arc */}
          <path
            d={`M 150 180 A 50 50 0 0 1 ${150 + 50 * Math.cos((rampRotation * Math.PI) / 180)} ${180 - 50 * Math.sin((rampRotation * Math.PI) / 180)}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          
          {/* Angle label */}
          <text
            x="170"
            y="165"
            fill="hsl(var(--primary))"
            fontSize="18"
            fontWeight="bold"
          >
            {angle > 0 ? '+' : ''}{angle}°
          </text>
        </svg>
      </div>

      {/* Zone indicators */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className={`text-center p-2 rounded ${angle < 8 ? 'bg-yellow-500/20' : 'bg-muted/30'}`}>
          <div className="font-semibold">❌ Too Flat</div>
          <div className="text-muted-foreground">-5 to +5°</div>
        </div>
        <div className={`text-center p-2 rounded ${angle >= 8 && angle <= 15 ? 'bg-green-500/20' : 'bg-muted/30'}`}>
          <div className="font-semibold">✓ Sweet Spot</div>
          <div className="text-muted-foreground">+8 to +15°</div>
        </div>
        <div className={`text-center p-2 rounded ${angle > 15 ? 'bg-yellow-500/20' : 'bg-muted/30'}`}>
          <div className="font-semibold">❌ Too Steep</div>
          <div className="text-muted-foreground">+20°+</div>
        </div>
      </div>

      {/* Status message */}
      <div className={`text-center p-3 rounded-lg bg-muted/50 mb-4`}>
        <div className={`text-lg font-bold ${status.color}`}>
          {status.emoji} {status.text}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {angle >= 8 && angle <= 15 
            ? "Perfect for line drives and hard contact"
            : angle < 8
            ? "Try to get the bat on a steeper path through the zone"
            : "Lower your swing plane to stay in the zone longer"
          }
        </div>
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
