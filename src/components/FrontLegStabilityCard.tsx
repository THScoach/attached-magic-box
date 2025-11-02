import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { FrontLegStabilityScore } from '@/lib/frontLegStability';

interface FrontLegStabilityCardProps {
  stability: FrontLegStabilityScore;
}

export function FrontLegStabilityCard({ stability }: FrontLegStabilityCardProps) {
  const getStatusColor = (status: string) => {
    if (status === 'elite') return 'text-green-500';
    if (status === 'good') return 'text-blue-500';
    if (status === 'developing') return 'text-yellow-500';
    if (status === 'beginner') return 'text-orange-500';
    return 'text-red-500';
  };
  
  const getStatusBadge = (status: string) => {
    if (status === 'elite') return <Badge className="bg-green-500 text-white">Elite ✅</Badge>;
    if (status === 'good') return <Badge className="bg-blue-500 text-white">Good 👍</Badge>;
    if (status === 'developing') return <Badge className="bg-yellow-500 text-white">Developing ⚠️</Badge>;
    if (status === 'beginner') return <Badge className="bg-orange-500 text-white">Beginner 💡</Badge>;
    return <Badge variant="destructive">Critical ❌</Badge>;
  };
  
  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (score >= 80) return <TrendingUp className="h-5 w-5 text-blue-500" />;
    if (score >= 65) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Front Leg Mechanics</CardTitle>
          {getStatusBadge(stability.overall_status)}
        </div>
        <CardDescription>Biotensegrity analysis of front leg stability during rotation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(stability.overall_score)}
              <span className="font-semibold">Front Leg Stability Score</span>
            </div>
            <span className={`text-3xl font-bold ${getStatusColor(stability.overall_status)}`}>
              {stability.overall_score}/100
            </span>
          </div>
          <Progress value={stability.overall_score} className="h-2" />
        </div>
        
        {/* Detailed Metrics */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-sm text-muted-foreground">Components</h4>
          
          {/* Knee Angle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Knee Angle at Contact</span>
              <span className="text-lg font-bold">
                {stability.knee_angle !== null ? `${stability.knee_angle.toFixed(0)}°` : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimal: 145-160° • Status: {stability.knee_status}
            </div>
            <Progress value={stability.knee_score} className="h-1" />
            <div className="text-xs text-muted-foreground">
              Weight: 40% of stability score • Score: {stability.knee_score}/100
            </div>
          </div>
          
          {/* Ankle Angle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ankle Angle at Contact</span>
              <span className="text-lg font-bold">
                {stability.ankle_angle !== null ? `${stability.ankle_angle.toFixed(0)}°` : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimal: 10-15° • Status: {stability.ankle_status}
            </div>
            <Progress value={stability.ankle_score} className="h-1" />
            <div className="text-xs text-muted-foreground">
              Weight: 30% of stability score • Score: {stability.ankle_score}/100
            </div>
          </div>
          
          {/* Deceleration Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Leg Deceleration Rate</span>
              <span className="text-lg font-bold">
                {stability.deceleration_rate !== null ? `${stability.deceleration_rate.toFixed(1)} m/s²` : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimal: {'>'}10 m/s² • Status: {stability.deceleration_status}
            </div>
            <Progress value={stability.deceleration_score} className="h-1" />
            <div className="text-xs text-muted-foreground">
              Weight: 30% of stability score • Score: {stability.deceleration_score}/100
            </div>
          </div>
        </div>
        
        {/* Coach's Insight */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Coach's Insight
          </h4>
          <p className="text-sm leading-relaxed">{stability.insight}</p>
          
          {stability.overall_score < 90 && (
            <div className="bg-blue-500/10 border-2 border-blue-500/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Recommended Drill:
              </p>
              <p className="font-medium">{stability.recommended_drill}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
