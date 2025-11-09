import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Progress } from "@/components/ui/progress";

interface MomentumAnalysisProps {
  metrics: {
    height?: number; // inches
    weight?: number; // lbs
    peakCOMVelocity?: number; // m/s
    momentumDirectionAngle?: number; // degrees from swing plane
    forwardMomentumPct?: number; // percentage
    transferEfficiency?: number; // percentage
  };
}

export function MomentumAnalysis({ metrics }: MomentumAnalysisProps) {
  // Calculate mass in kg
  const massKg = metrics.weight ? (metrics.weight * 0.453592) : undefined;
  
  // Calculate linear momentum (kg⋅m/s)
  const peakLinearMomentum = massKg && metrics.peakCOMVelocity 
    ? massKg * metrics.peakCOMVelocity 
    : undefined;

  // Determine alignment status
  const getAlignmentStatus = (angle: number | undefined) => {
    if (angle === undefined) return { text: "Unknown", color: "text-muted-foreground", bgColor: "bg-gray-500" };
    if (angle <= 15) return { 
      text: "Momentum well-aligned with swing plane - efficient power transfer", 
      color: "text-green-600",
      bgColor: "bg-green-500"
    };
    if (angle <= 30) return { 
      text: "Momentum slightly off-axis - focus on forward move into the ball", 
      color: "text-yellow-600",
      bgColor: "bg-yellow-500"
    };
    return { 
      text: "Momentum directed too laterally - work on weight transfer and stride direction", 
      color: "text-red-600",
      bgColor: "bg-red-500"
    };
  };

  const alignmentStatus = getAlignmentStatus(metrics.momentumDirectionAngle);

  // Draw momentum vector diagram
  const MomentumVectorDiagram = () => {
    const angle = metrics.momentumDirectionAngle || 0;
    const svgSize = 200;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const arrowLength = 60;
    
    // Convert angle to radians (0° = right/forward, positive = up)
    const angleRad = (angle * Math.PI) / 180;
    const arrowEndX = centerX + arrowLength * Math.cos(angleRad);
    const arrowEndY = centerY - arrowLength * Math.sin(angleRad); // Negative because SVG Y increases downward

    return (
      <svg width={svgSize} height={svgSize} className="mx-auto">
        {/* Swing plane zone (±15°) */}
        <rect
          x={centerX - 80}
          y={centerY - 20}
          width={160}
          height={40}
          fill="rgba(34, 197, 94, 0.1)"
          stroke="rgba(34, 197, 94, 0.3)"
          strokeWidth="2"
          strokeDasharray="4"
          rx="4"
        />
        
        {/* Center point */}
        <circle cx={centerX} cy={centerY} r="4" fill="hsl(var(--foreground))" />
        
        {/* Momentum vector arrow */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill={alignmentStatus.bgColor.replace('bg-', '#')} />
          </marker>
        </defs>
        <line
          x1={centerX}
          y1={centerY}
          x2={arrowEndX}
          y2={arrowEndY}
          stroke={alignmentStatus.bgColor.replace('bg-', '#')}
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
        />
        
        {/* Angle arc */}
        {Math.abs(angle) > 1 && (
          <>
            <path
              d={`M ${centerX + 30} ${centerY} A 30 30 0 0 ${angle > 0 ? 1 : 0} ${
                centerX + 30 * Math.cos(angleRad)
              } ${centerY - 30 * Math.sin(angleRad)}`}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
              strokeDasharray="2"
            />
            <text
              x={centerX + 40}
              y={centerY - (angle > 0 ? 10 : -10)}
              fontSize="12"
              fill="hsl(var(--muted-foreground))"
            >
              {angle.toFixed(0)}°
            </text>
          </>
        )}
        
        {/* Labels */}
        <text x={centerX + 85} y={centerY + 5} fontSize="11" fill="hsl(var(--muted-foreground))">
          Forward →
        </text>
        <text x={centerX - 20} y={centerY - 40} fontSize="10" fill="rgba(34, 197, 94, 0.8)">
          Optimal Zone
        </text>
      </svg>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Momentum Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT: Athlete Info & Metrics */}
          <div className="space-y-4">
            {/* Athlete Info */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Athlete Info
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {metrics.height ? `${Math.floor(metrics.height / 12)}'${metrics.height % 12}"` : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Height</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {metrics.weight || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Weight (lbs)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {massKg?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Mass (kg)</div>
                </div>
              </div>
            </div>

            {/* Momentum Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Peak Linear Momentum</span>
                  <InfoTooltip content="Linear momentum = mass × velocity. Represents total forward momentum at peak COM velocity." />
                </div>
                <span className="text-sm font-bold">
                  {peakLinearMomentum ? `${peakLinearMomentum.toFixed(1)} kg⋅m/s` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Peak COM Velocity</span>
                  <InfoTooltip content="Maximum center of mass velocity during the swing. Elite hitters: 1.0-1.2 m/s." />
                </div>
                <span className="text-sm font-bold">
                  {metrics.peakCOMVelocity ? `${metrics.peakCOMVelocity.toFixed(2)} m/s` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Momentum Direction</span>
                  <InfoTooltip content="Angle of momentum vector from optimal swing plane. 0-15° = optimal, 15-30° = acceptable, >30° = needs work." />
                </div>
                <span className="text-sm font-bold">
                  {metrics.momentumDirectionAngle !== undefined ? `${metrics.momentumDirectionAngle.toFixed(1)}°` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Forward Momentum %</span>
                  <InfoTooltip content="Percentage of total momentum directed forward toward the pitcher." />
                </div>
                <span className="text-sm font-bold">
                  {metrics.forwardMomentumPct !== undefined ? `${metrics.forwardMomentumPct.toFixed(0)}%` : 'N/A'}
                </span>
              </div>

              <div className="py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Transfer Efficiency</span>
                    <InfoTooltip content="How efficiently linear momentum converts to rotational power. >75% = elite." />
                  </div>
                  <span className="text-sm font-bold">
                    {metrics.transferEfficiency !== undefined ? `${metrics.transferEfficiency.toFixed(0)}%` : 'N/A'}
                  </span>
                </div>
                {metrics.transferEfficiency !== undefined && (
                  <Progress value={metrics.transferEfficiency} className="h-2" />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Diagram */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide text-center">
              Top-Down Momentum Vector
            </h4>
            
            <MomentumVectorDiagram />

            {/* Status */}
            <div className={`p-4 rounded-lg border-2 ${
              metrics.momentumDirectionAngle !== undefined && metrics.momentumDirectionAngle <= 15 
                ? 'border-green-500 bg-green-500/10' 
                : metrics.momentumDirectionAngle !== undefined && metrics.momentumDirectionAngle <= 30
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-red-500 bg-red-500/10'
            }`}>
              <div className="font-semibold mb-1">Momentum Alignment</div>
              <p className={`text-sm ${alignmentStatus.color}`}>
                {alignmentStatus.text}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
