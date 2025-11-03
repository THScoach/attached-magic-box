import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SwingAnalysis } from "@/types/swing";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { TrendingUp, Target, Zap } from "lucide-react";
import { 
  calculateDirectionScore, 
  calculateTimingScore, 
  calculateEfficiencyScore,
  calculateSwingMechanicsQuality 
} from "@/lib/swingMechanicsQuality";

interface BatSpeedQualityCardProps {
  analysis: SwingAnalysis;
}

export function BatSpeedQualityCard({ analysis }: BatSpeedQualityCardProps) {
  // Calculate scores using library functions
  const attackAngle = analysis.attackAngle || 10;
  const batPathPlane = analysis.batPathPlane || 10;
  const connectionQuality = analysis.connectionQuality || 85;
  
  const tempoRatio = analysis.tempoRatio || 2.5;
  const sequenceQuality = analysis.sequenceQuality || 85;
  const accelerationPattern = analysis.accelerationPattern || 85;
  
  const hipShoulderSeparation = Math.abs(analysis.xFactor || 40);
  const balanceScore = analysis.balanceScore || 85;
  
  const directionScore = calculateDirectionScore(attackAngle, batPathPlane, connectionQuality);
  const timingScore = calculateTimingScore(tempoRatio, sequenceQuality, accelerationPattern);
  const efficiencyScore = calculateEfficiencyScore(hipShoulderSeparation, connectionQuality, balanceScore);
  
  const mechanicsQuality = calculateSwingMechanicsQuality(
    directionScore,
    timingScore,
    efficiencyScore,
    analysis.batMaxVelocity
  );
  
  const qualityScore = mechanicsQuality.overallScore;
  const predictedSpeed = analysis.batMaxVelocity || 72;

  // Determine quality level
  const getQualityLevel = (score: number) => {
    if (score >= 90) return { label: "Elite", color: "text-green-500" };
    if (score >= 75) return { label: "Good", color: "text-yellow-500" };
    if (score >= 60) return { label: "Developing", color: "text-orange-500" };
    return { label: "Needs Work", color: "text-red-500" };
  };

  const quality = getQualityLevel(qualityScore);

  // Get score color for progress bars
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Swing Mechanics Quality
            </CardTitle>
            <CardDescription>
              How effectively your body creates bat speed
            </CardDescription>
          </div>
          <InfoTooltip content="This score measures WHERE, WHEN, and HOW your body creates bat speed - not just raw velocity. It evaluates direction of momentum, timing of peak speed, and efficiency of energy transfer." />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-muted/50 rounded-lg border-2 border-primary/20">
          <div className="text-5xl font-black mb-2 text-primary">
            {qualityScore.toFixed(1)}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <div className={`text-lg font-bold ${quality.color}`}>
            {quality.label} Quality
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Predicted Bat Speed: {mechanicsQuality.predictedBatSpeedRange}
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="space-y-4">
          {/* Direction */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-semibold">Direction</span>
                <InfoTooltip content="Where is your momentum going? Optimal bat path alignment (5-15° attack angle), hands staying inside, directing rotational energy toward the field." />
              </div>
              <span className="font-bold text-sm">{directionScore.toFixed(1)}</span>
            </div>
            <div className="relative">
              <Progress value={directionScore} className="h-3" />
              <div 
                className={`absolute inset-0 h-3 rounded-full ${getScoreColor(directionScore)}`}
                style={{ width: `${directionScore}%` }}
              />
            </div>
          </div>

          {/* Timing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-semibold">Timing</span>
                <InfoTooltip content="When does speed peak? Optimal tempo ratio (2.3-2.7:1), kinematic sequence firing in order (hips → shoulders → hands), momentum peaking at contact." />
              </div>
              <span className="font-bold text-sm">{timingScore.toFixed(1)}</span>
            </div>
            <div className="relative">
              <Progress value={timingScore} className="h-3" />
              <div 
                className={`absolute inset-0 h-3 rounded-full ${getScoreColor(timingScore)}`}
                style={{ width: `${timingScore}%` }}
              />
            </div>
          </div>

          {/* Efficiency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold">Efficiency</span>
                <InfoTooltip content="How well is momentum transferred? Optimal hip-shoulder separation (40-50°), strong connection between body rotation and bat, maintaining balance through the swing." />
              </div>
              <span className="font-bold text-sm">{efficiencyScore.toFixed(1)}</span>
            </div>
            <div className="relative">
              <Progress value={efficiencyScore} className="h-3" />
              <div 
                className={`absolute inset-0 h-3 rounded-full ${getScoreColor(efficiencyScore)}`}
                style={{ width: `${efficiencyScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 border-l-4 border-primary rounded">
            <p className="text-sm font-medium mb-2">Direction</p>
            <p className="text-sm text-muted-foreground">{mechanicsQuality.feedback.direction}</p>
          </div>
          
          <div className="p-4 bg-primary/10 border-l-4 border-primary rounded">
            <p className="text-sm font-medium mb-2">Timing</p>
            <p className="text-sm text-muted-foreground">{mechanicsQuality.feedback.timing}</p>
          </div>
          
          <div className="p-4 bg-primary/10 border-l-4 border-primary rounded">
            <p className="text-sm font-medium mb-2">Efficiency</p>
            <p className="text-sm text-muted-foreground">{mechanicsQuality.feedback.efficiency}</p>
          </div>
          
          <div className="p-4 bg-muted border-l-4 border-foreground rounded">
            <p className="text-sm font-bold mb-2">Bottom Line</p>
            <p className="text-sm">{mechanicsQuality.feedback.bottomLine}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
