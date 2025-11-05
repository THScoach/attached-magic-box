import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, TrendingUp, Zap, CheckCircle2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DrillRecommendation {
  drill_name: string;
  drill_id: string | null;
  priority: 'high' | 'medium' | 'low';
  pillar: 'ANCHOR' | 'ENGINE' | 'WHIP';
  reasoning: string;
  focus_points: string[];
  expected_improvement: string;
  drill_difficulty?: number;
  drill_duration?: number;
  drill_description?: string;
  drill_video_url?: string;
}

interface AIDrillRecommendationsProps {
  analysisId: string;
  userId: string;
  playerId?: string;
}

const PILLAR_COLORS = {
  ANCHOR: 'bg-anchor',
  ENGINE: 'bg-engine',
  WHIP: 'bg-whip'
};

const PRIORITY_CONFIG = {
  high: { label: 'High Priority', icon: Zap, color: 'text-red-500' },
  medium: { label: 'Medium Priority', icon: Target, color: 'text-yellow-500' },
  low: { label: 'Low Priority', icon: TrendingUp, color: 'text-blue-500' }
};

export function AIDrillRecommendations({ analysisId, userId, playerId }: AIDrillRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<DrillRecommendation[]>([]);
  const [trainingSummary, setTrainingSummary] = useState<string>('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const navigate = useNavigate();

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-drills-ai', {
        body: { analysisId, userId, playerId }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit') || data.error.includes('429')) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (data.error.includes('credits') || data.error.includes('402')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error(data.error);
        }
        return;
      }

      setRecommendations(data.recommendations);
      setTrainingSummary(data.training_plan_summary);
      setFocusAreas(data.focus_areas);
      toast.success('AI drill recommendations generated!');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI-Powered Drill Recommendations
            </CardTitle>
            <CardDescription>
              Personalized training plan based on your swing analysis
            </CardDescription>
          </div>
          {recommendations.length === 0 && (
            <Button onClick={generateRecommendations} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Generate Plan'
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {recommendations.length > 0 && (
        <CardContent className="space-y-6">
          {/* Training Summary */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Training Plan Overview
            </h3>
            <p className="text-sm text-muted-foreground">{trainingSummary}</p>
          </div>

          {/* Focus Areas */}
          {focusAreas.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">Key Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((area, idx) => (
                  <Badge key={idx} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Drills */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recommended Drills</h3>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/drills')}
              >
                View All Drills
              </Button>
            </div>

            {recommendations.map((rec, idx) => {
              const PriorityIcon = PRIORITY_CONFIG[rec.priority].icon;
              
              return (
                <Card key={idx} className="border-l-4" style={{ borderLeftColor: `hsl(var(--${rec.pillar.toLowerCase()}))` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{rec.drill_name}</CardTitle>
                          {rec.drill_video_url && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => window.open(rec.drill_video_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={PILLAR_COLORS[rec.pillar]}>
                            {rec.pillar}
                          </Badge>
                          <Badge variant="outline" className={PRIORITY_CONFIG[rec.priority].color}>
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {PRIORITY_CONFIG[rec.priority].label}
                          </Badge>
                          {rec.drill_difficulty && (
                            <Badge variant="secondary">
                              Difficulty: {rec.drill_difficulty}/5
                            </Badge>
                          )}
                          {rec.drill_duration && (
                            <Badge variant="secondary">
                              {rec.drill_duration} min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Reasoning */}
                    <div>
                      <p className="text-sm font-medium mb-1">Why This Drill?</p>
                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                    </div>

                    {/* Focus Points */}
                    <div>
                      <p className="text-sm font-medium mb-2">Key Focus Points</p>
                      <ul className="space-y-1">
                        {rec.focus_points.map((point, pointIdx) => (
                          <li key={pointIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Expected Improvement */}
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Expected Result</p>
                      <p className="text-sm text-muted-foreground">{rec.expected_improvement}</p>
                    </div>

                    {rec.drill_id && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => navigate('/drills')}
                      >
                        View Drill Instructions
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Regenerate Button */}
          <Button 
            onClick={generateRecommendations} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              'Regenerate Recommendations'
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
