import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Clock, Zap, TrendingUp, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TempoRatioCardProps {
  tempoRatio: number;
  loadStartTiming?: number;
  fireStartTiming?: number;
  dataSource?: 'hits_video' | 'reboot_motion' | 'both';
  rebootTempoRatio?: number;
}

interface TempoStyle {
  category: string;
  color: string;
  bgColor: string;
  description: string;
  examples: string[];
  icon: React.ReactNode;
  characteristics: string[];
}

export function TempoRatioCard({ 
  tempoRatio, 
  loadStartTiming, 
  fireStartTiming,
  dataSource = 'hits_video',
  rebootTempoRatio
}: TempoRatioCardProps) {
  
  const getTempoStyle = (tempo: number): TempoStyle => {
    if (tempo >= 4.0) {
      return {
        category: "Patient Power",
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
        description: "Extremely long load phase with ultra-quick fire. Prioritizes pitch recognition and timing over pure aggression.",
        examples: ["Kyle Tucker (10.5:1)", "Luis Arraez (3.8:1)"],
        icon: <Clock className="h-5 w-5 text-blue-600" />,
        characteristics: [
          "Very long load window (1200-2500ms)",
          "Quick, efficient fire phase",
          "Excellent pitch recognition",
          "Contact-oriented approach"
        ]
      };
    } else if (tempo >= 2.3) {
      return {
        category: "Elite Power",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        description: "The optimal tempo for elite power hitters. Long load builds energy, explosive fire generates maximum bat speed.",
        examples: ["Freddie Freeman (2.5:1)", "Aaron Judge (2.1:1)"],
        icon: <Target className="h-5 w-5 text-green-600" />,
        characteristics: [
          "Long load phase (900-1100ms)",
          "Explosive fire phase (340-380ms)",
          "Balanced power and timing",
          "Elite bat speed generation"
        ]
      };
    } else if (tempo >= 1.8) {
      return {
        category: "Balanced Attack",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
        description: "Moderate load with aggressive fire. Good balance between timing and power, suitable for all-around hitting.",
        examples: ["Manny Machado (1.5-2.0:1)"],
        icon: <TrendingUp className="h-5 w-5 text-yellow-600" />,
        characteristics: [
          "Moderate load phase (700-900ms)",
          "Aggressive fire phase (350-450ms)",
          "Balanced approach",
          "Quick bat through zone"
        ]
      };
    } else {
      return {
        category: "Aggressive Attack",
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        description: "Quick load with very fast fire. Aggressive, reactive swing for fastballs. May struggle with off-speed.",
        examples: ["Some aggressive hitters (1.5-1.8:1)"],
        icon: <Zap className="h-5 w-5 text-orange-600" />,
        characteristics: [
          "Short load phase (<700ms)",
          "Very fast fire (>400ms)",
          "Reactive to velocity",
          "May sacrifice timing window"
        ]
      };
    }
  };

  const style = getTempoStyle(tempoRatio);
  const loadDuration = loadStartTiming && fireStartTiming ? loadStartTiming - fireStartTiming : 0;
  const fireDuration = fireStartTiming || 0;

  // Calculate visual percentages for the tempo bar
  const totalDuration = loadDuration + fireDuration;
  const loadPercent = totalDuration > 0 ? (loadDuration / totalDuration) * 100 : 50;
  const firePercent = totalDuration > 0 ? (fireDuration / totalDuration) * 100 : 50;

  // Optimal range: 2.0-3.0 (elite power hitters)
  const OPTIMAL_MIN = 2.0;
  const OPTIMAL_MAX = 3.0;
  const SCALE_MIN = 0.5;
  const SCALE_MAX = 5.0;
  
  // Calculate position on scale (0-100%)
  const scalePosition = ((tempoRatio - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const optimalMinPosition = ((OPTIMAL_MIN - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const optimalMaxPosition = ((OPTIMAL_MAX - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  
  // Calculate how close to optimal (percentage)
  const isInOptimal = tempoRatio >= OPTIMAL_MIN && tempoRatio <= OPTIMAL_MAX;
  const distanceFromOptimal = isInOptimal 
    ? 0 
    : tempoRatio < OPTIMAL_MIN 
      ? OPTIMAL_MIN - tempoRatio 
      : tempoRatio - OPTIMAL_MAX;
  const optimalPercentage = Math.max(0, Math.min(100, 
    100 - (distanceFromOptimal / OPTIMAL_MAX) * 100
  ));

  // Get actionable tip based on tempo
  const getActionableTip = (tempo: number): string => {
    if (tempo >= 4.0) {
      return "Your patient approach is great for pitch recognition. To add power, work on explosive hip rotation during the fire phase.";
    } else if (tempo >= 2.3) {
      return "Excellent timing! Maintain this rhythm while focusing on rotational velocity through the zone.";
    } else if (tempo >= 1.8) {
      return "Extend your load phase by 100-200ms. Try the 'hold and explode' drill to feel more separation before firing.";
    } else {
      return "Create more time in your load. Practice the 'pause at peak' drill to develop patience and energy storage.";
    }
  };

  const getDataSourceBadge = () => {
    if (dataSource === 'hits_video') {
      return <Badge variant="outline" className="text-xs bg-blue-50">📹 HITS Video Analysis</Badge>;
    } else if (dataSource === 'reboot_motion') {
      return <Badge variant="outline" className="text-xs bg-purple-50">📊 Reboot Motion Sensors</Badge>;
    }
    return null;
  };

  const hasComparison = rebootTempoRatio && dataSource === 'both';
  const tempoDifference = hasComparison ? Math.abs(tempoRatio - rebootTempoRatio) : 0;

  return (
    <Card className={`border-2 ${style.bgColor}`}>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {style.icon}
              <CardTitle>Tempo Ratio Analysis</CardTitle>
            </div>
            <InfoTooltip content="Tempo ratio measures the Load:Fire timing pattern. Higher ratios = longer load phase for pitch recognition. Elite power hitters: 2.0-2.6:1. Contact hitters: 3.5-4.5:1. Quick swingers: 1.5-1.8:1." />
          </div>
          <div className="flex items-center gap-2">
            {getDataSourceBadge()}
            {hasComparison && (
              <Badge variant="outline" className="text-xs bg-yellow-50">⚠️ Multiple Sources</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Alert */}
        {hasComparison && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-yellow-900">Different Tempo Values Detected</h4>
                <p className="text-xs text-yellow-800 leading-relaxed">
                  HITS video analysis and Reboot Motion sensors use different detection methods (pose tracking vs. motion sensors) 
                  and may define swing phases slightly differently. A variance of {tempoDifference.toFixed(2)} is normal.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="p-2 bg-white rounded border border-yellow-300">
                    <p className="text-xs text-muted-foreground">📹 HITS Video</p>
                    <p className="text-2xl font-bold text-blue-600">{tempoRatio.toFixed(2)}:1</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-yellow-300">
                    <p className="text-xs text-muted-foreground">📊 Reboot Sensors</p>
                    <p className="text-2xl font-bold text-purple-600">{rebootTempoRatio?.toFixed(2)}:1</p>
                  </div>
                </div>
                <p className="text-xs text-yellow-800 mt-2">
                  💡 <strong>Tip:</strong> Use Reboot Motion tempo for precise biomechanics. Use HITS tempo for overall swing timing patterns.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Tempo Display */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className={`text-6xl font-bold ${style.color}`}>
              {tempoRatio.toFixed(2)}
            </span>
            <span className="text-4xl font-bold text-muted-foreground">:1</span>
          </div>
          <Badge className={`text-sm ${style.color} border-current`} variant="outline">
            {style.category}
          </Badge>
        </div>

        {/* Visual Scale */}
        <div className="space-y-3 p-4 bg-background rounded-lg border">
          <div className="text-xs font-semibold text-muted-foreground text-center">
            TEMPO SCALE
          </div>
          
          {/* Scale bar */}
          <div className="relative h-12">
            {/* Background track */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-muted rounded-full">
              {/* Optimal range highlight */}
              <div 
                className="absolute h-full bg-green-200 rounded-full"
                style={{ 
                  left: `${optimalMinPosition}%`, 
                  width: `${optimalMaxPosition - optimalMinPosition}%` 
                }}
              />
            </div>
            
            {/* User position marker */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
              style={{ left: `${Math.max(2, Math.min(98, scalePosition))}%` }}
            >
              <div className={`w-6 h-6 rounded-full border-4 ${style.color} bg-background shadow-lg`} />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge className="text-xs font-bold">You</Badge>
              </div>
            </div>

            {/* Optimal marker */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${(optimalMinPosition + optimalMaxPosition) / 2}%` }}
            >
              <div className="w-4 h-4 rounded-full bg-green-600 border-2 border-background" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-medium text-green-700">Elite</span>
              </div>
            </div>
          </div>

          {/* Scale labels */}
          <div className="flex justify-between text-xs text-muted-foreground pt-6">
            <span>0.5</span>
            <span>1.0</span>
            <span>1.5</span>
            <span>2.0</span>
            <span>2.5</span>
            <span>3.0</span>
            <span>4.0</span>
            <span>5.0</span>
          </div>

          {/* Comparison to optimal */}
          <div className="pt-3 border-t text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold">
                {isInOptimal ? (
                  <span className="text-green-700">✓ In Elite Range!</span>
                ) : (
                  <span>Compared to Elite (2.0-3.0)</span>
                )}
              </span>
            </div>
            {!isInOptimal && (
              <div className="flex items-center justify-center gap-2">
                <Progress value={optimalPercentage} className="w-32 h-2" />
                <span className="text-xl font-bold text-green-700">
                  {Math.round(optimalPercentage)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Visual Tempo Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className={style.color}>Load Phase</span>
            <span className="text-muted-foreground">Fire Phase</span>
          </div>
          <div className="h-8 w-full rounded-lg overflow-hidden flex border-2 border-border">
            <div 
              className="bg-primary flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${loadPercent}%` }}
            >
              {loadDuration > 0 && `${loadDuration}ms`}
            </div>
            <div 
              className="bg-orange-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${firePercent}%` }}
            >
              {fireDuration > 0 && `${fireDuration}ms`}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Energy Build-Up</span>
            <span>Explosive Release</span>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 bg-background rounded-lg border">
          <p className="text-sm text-muted-foreground mb-3">
            {style.description}
          </p>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Key Characteristics:</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              {style.characteristics.map((char, index) => (
                <li key={index} className="list-disc">{char}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* MLB Examples */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold">Similar MLB Players:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {style.examples.map((example, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {example}
              </Badge>
            ))}
          </div>
        </div>

        {/* Phase Breakdown */}
        {loadStartTiming && fireStartTiming && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Load Duration</span>
              </div>
              <div className="text-2xl font-bold">{loadDuration}ms</div>
              <p className="text-xs text-muted-foreground">
                {loadDuration >= 900 ? "Optimal" : loadDuration >= 650 ? "Good" : "Short"} energy storage
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-muted-foreground">Fire Duration</span>
              </div>
              <div className="text-2xl font-bold">{fireDuration}ms</div>
              <p className="text-xs text-muted-foreground">
                {fireDuration <= 380 ? "Explosive" : fireDuration <= 450 ? "Good" : "Slow"} release
              </p>
            </div>
          </div>
        )}

        {/* Actionable Tip */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-bold text-foreground">💡 TRAINING TIP</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getActionableTip(tempoRatio)}
              </p>
            </div>
          </div>
        </div>

        {/* What This Means */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span>What This Means For Your Swing</span>
          </h4>
          <div className="space-y-2 text-sm">
            {tempoRatio >= 2.3 && (
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Elite timing pattern detected</p>
                  <p className="text-muted-foreground">You're loading energy like Freddie Freeman and Aaron Judge. Maintain this rhythm while focusing on explosive rotation.</p>
                </div>
              </div>
            )}
            {tempoRatio >= 1.8 && tempoRatio < 2.3 && (
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">⚠️</span>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Good but quick for max power</p>
                  <p className="text-muted-foreground">You're {((OPTIMAL_MIN - tempoRatio) * -100).toFixed(0)}ms away from elite range. Extending your load phase will build more energy storage.</p>
                </div>
              </div>
            )}
            {tempoRatio < 1.8 && (
              <div className="flex items-start gap-2">
                <span className="text-orange-600">⚠️</span>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Aggressive, reactive swing</p>
                  <p className="text-muted-foreground">Your quick tempo ({tempoRatio.toFixed(2)}:1) may limit power and timing. Elite hitters use 2.0-3.0:1 to maximize energy transfer.</p>
                </div>
              </div>
            )}
            {tempoRatio >= 4.0 && (
              <div className="flex items-start gap-2">
                <span className="text-blue-600">ℹ️</span>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Patient, contact-focused approach</p>
                  <p className="text-muted-foreground">Your tempo prioritizes pitch recognition over pure power. Similar to Kyle Tucker's approach.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
