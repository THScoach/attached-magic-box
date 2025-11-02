import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Clock, Zap, TrendingUp, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TempoRatioCardProps {
  tempoRatio: number;
  loadStartTiming?: number;
  fireStartTiming?: number;
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
  fireStartTiming 
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

  return (
    <Card className={`border-2 ${style.bgColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {style.icon}
            <CardTitle>Tempo Ratio Analysis</CardTitle>
          </div>
          <InfoTooltip content="Tempo ratio measures the Load:Fire timing pattern. Higher ratios = longer load phase for pitch recognition. Elite power hitters: 2.0-2.6:1. Contact hitters: 3.5-4.5:1. Quick swingers: 1.5-1.8:1." />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Tempo Display */}
        <div className="text-center space-y-2">
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

        {/* What This Means */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">What This Means For Your Swing:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {tempoRatio >= 2.3 && (
              <>
                <p>✅ You're loading energy like elite power hitters (Freeman, Judge)</p>
                <p>💡 Focus on maintaining this rhythm while improving rotational velocities</p>
              </>
            )}
            {tempoRatio >= 1.8 && tempoRatio < 2.3 && (
              <>
                <p>⚠️ Your tempo is slightly quick for maximum power generation</p>
                <p>💡 Consider lengthening your load phase by 100-200ms to build more energy</p>
              </>
            )}
            {tempoRatio < 1.8 && (
              <>
                <p>⚠️ Your tempo is very aggressive, which may limit power and timing</p>
                <p>💡 Work on creating more separation time before initiating your swing</p>
              </>
            )}
            {tempoRatio >= 4.0 && (
              <>
                <p>ℹ️ You have a patient, contact-oriented tempo</p>
                <p>💡 This approach prioritizes timing and pitch recognition over pure power</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
