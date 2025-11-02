import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, ArrowDown, Target } from 'lucide-react';
import { WeightTransferScore } from '@/lib/weightTransfer';

interface WeightTransferCardProps {
  weightTransfer: WeightTransferScore;
}

export function WeightTransferCard({ weightTransfer }: WeightTransferCardProps) {
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
          <CardTitle className="flex items-center gap-2">
            <ArrowDown className="h-5 w-5" />
            Weight Transfer Mechanics
          </CardTitle>
          {getStatusBadge(weightTransfer.overall_status)}
        </div>
        <CardDescription>COM movement and ground connection analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(weightTransfer.overall_score)}
              <span className="font-semibold">Weight Transfer Score</span>
            </div>
            <span className={`text-3xl font-bold ${getStatusColor(weightTransfer.overall_status)}`}>
              {weightTransfer.overall_score}/100
            </span>
          </div>
          <Progress value={weightTransfer.overall_score} className="h-2" />
        </div>
        
        {/* Detailed Metrics */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-sm text-muted-foreground">Components</h4>
          
          {/* Vertical Movement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vertical Movement</span>
              <span className="text-lg font-bold">
                {weightTransfer.vertical_movement !== null ? `${weightTransfer.vertical_movement.toFixed(1)}"` : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimal: 2-3 inches • Status: {weightTransfer.vertical_status}
            </div>
            <Progress value={weightTransfer.vertical_score} className="h-1" />
            <div className="text-xs text-muted-foreground">
              Weight: 25% of transfer score • Score: {weightTransfer.vertical_score}/100
            </div>
          </div>
          
          {/* COM Timing Pattern */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">COM Peak Timing</span>
              <span className="text-lg font-bold">
                {weightTransfer.timing_peak !== null ? `${weightTransfer.timing_peak.toFixed(2)}s` : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimal: 0.10-0.15s before contact • Status: {weightTransfer.timing_status}
            </div>
            <Progress value={weightTransfer.timing_score} className="h-1" />
            <div className="text-xs text-muted-foreground">
              Weight: 35% of transfer score • Score: {weightTransfer.timing_score}/100
            </div>
          </div>
          
          {/* Back Foot Contact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Back Toe Lift Timing</span>
              <span className="text-lg font-bold">
                {weightTransfer.back_foot_lift !== null 
                  ? `${weightTransfer.back_foot_lift >= 0 ? '+' : ''}${weightTransfer.back_foot_lift.toFixed(2)}s` 
                  : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimal: After contact (+0.05 to +0.10s) • Status: {weightTransfer.back_foot_status}
            </div>
            <Progress value={weightTransfer.back_foot_score} className="h-1" />
            <div className="text-xs text-muted-foreground">
              Weight: 25% of transfer score • Score: {weightTransfer.back_foot_score}/100
            </div>
          </div>
          
          {/* COM Acceleration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">COM Acceleration Peak</span>
              <span className="text-lg font-bold">
                {weightTransfer.acceleration_peak !== null ? `${weightTransfer.acceleration_peak.toFixed(1)} m/s²` : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimal: 5-8 m/s² • Status: {weightTransfer.acceleration_status}
            </div>
            <Progress value={weightTransfer.acceleration_score} className="h-1" />
            <div className="text-xs text-muted-foreground">
              Weight: 15% of transfer score • Score: {weightTransfer.acceleration_score}/100
            </div>
          </div>
        </div>
        
        {/* Coach's Insight */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Coach's Insight
          </h4>
          <p className="text-sm leading-relaxed">{weightTransfer.insight}</p>
          
          {weightTransfer.overall_score < 90 && (
            <div className="bg-blue-500/10 border-2 border-blue-500/30 p-4 rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Recommended Drill:
              </p>
              <p className="font-medium">{weightTransfer.recommended_drill}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
