import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDrillRecommendations } from '@/hooks/useDrillRecommendations';
import { scheduleDrillsToCalendar } from '@/lib/scheduleDrills';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Target, TrendingUp, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DrillRecommendationsProps {
  playerId: string | null;
  limit?: number;
}

export function DrillRecommendations({ playerId, limit = 5 }: DrillRecommendationsProps) {
  const { recommendations, loading, weaknesses } = useDrillRecommendations(playerId, limit);
  const [scheduling, setScheduling] = useState<string | null>(null);

  const handleScheduleDrill = async (drillId: string, drillName: string, pillar: string) => {
    if (!playerId) return;

    setScheduling(drillId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const result = await scheduleDrillsToCalendar({
        userId: user.id,
        playerId,
        drillIds: [drillId],
        drillNames: [drillName],
        pillar: pillar as 'ANCHOR' | 'ENGINE' | 'WHIP',
        weeksAhead: 4,
        sessionsPerWeek: 4
      });

      if (result.success) {
        toast.success(`${drillName} scheduled for the next 4 weeks!`);
      } else {
        toast.error(result.error || 'Failed to schedule drill');
      }
    } catch (error: any) {
      console.error('Error scheduling drill:', error);
      toast.error(error.message || 'Failed to schedule drill');
    } finally {
      setScheduling(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'ANCHOR': return 'text-anchor';
      case 'ENGINE': return 'text-engine';
      case 'WHIP': return 'text-whip';
      default: return 'text-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing your swing data...</span>
        </div>
      </Card>
    );
  }

  if (!playerId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Select a player to see personalized drill recommendations
        </AlertDescription>
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No recommendations yet</p>
          <p className="text-sm">Complete more swing analyses to get personalized drill recommendations</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Weakness Summary */}
      {weaknesses.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Focus Areas</h4>
              <div className="flex flex-wrap gap-2">
                {weaknesses.map((weakness) => (
                  <Badge 
                    key={weakness.pillar}
                    variant={getPriorityColor(weakness.priority)}
                    className="gap-1"
                  >
                    <span className={getPillarColor(weakness.pillar)}>
                      {weakness.pillar}
                    </span>
                    <span className="opacity-70">•</span>
                    <span>{weakness.avgScore.toFixed(0)}/100</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Drill Recommendations */}
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <Card key={rec.drill.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className={getPillarColor(rec.drill.pillar)}>
                    {rec.drill.pillar}
                  </Badge>
                  <Badge variant={getPriorityColor(rec.priority)}>
                    {rec.priority} priority
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold">{rec.drill.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {rec.drill.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Difficulty: {rec.drill.difficulty}/5</span>
                  <span>Duration: {rec.drill.duration} min</span>
                  {rec.drill.target_area && (
                    <span>Target: {rec.drill.target_area}</span>
                  )}
                </div>

                <p className="text-sm text-primary font-medium">
                  {rec.reason}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => handleScheduleDrill(rec.drill.id, rec.drill.name, rec.drill.pillar)}
                disabled={scheduling === rec.drill.id}
              >
                {scheduling === rec.drill.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
