import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDrillRecommendations } from "@/hooks/useDrillRecommendations";
import { Loader2, Target, TrendingUp, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DrillRecommendationsProps {
  userId: string;
  playerId?: string;
  analysisId?: string;
}

const pillarColors = {
  bat: "bg-bat/10 text-bat border-bat/20",
  body: "bg-body/10 text-body border-body/20",
  ball: "bg-ball/10 text-ball border-ball/20",
  brain: "bg-brain/10 text-brain border-brain/20",
};

const pillarLabels = {
  bat: "BAT",
  body: "BODY",
  ball: "BALL",
  brain: "BRAIN",
};

const priorityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

export function DrillRecommendations({ userId, playerId, analysisId }: DrillRecommendationsProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDrillRecommendations(userId, playerId, analysisId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing your swing and finding the perfect drills...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to generate drill recommendations. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.recommendations?.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No recommendations yet. Upload a swing to get personalized drill suggestions!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Recommended Drills
            </CardTitle>
            <CardDescription>
              Based on {data.analyses_count} recent swing{data.analyses_count !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge variant="outline" className={pillarColors[data.primary_weakness]}>
            Focus: {pillarLabels[data.primary_weakness]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.recommendations.map((rec, index) => (
          <div
            key={rec.drill_id}
            className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{index + 1}. {rec.drill_name}</span>
                  <Badge variant={priorityColors[rec.priority]} className="text-xs">
                    {rec.priority} priority
                  </Badge>
                  <Badge variant="outline" className={pillarColors[rec.pillar as keyof typeof pillarColors]}>
                    {pillarLabels[rec.pillar as keyof typeof pillarLabels]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                {rec.expected_improvement && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{rec.expected_improvement}</span>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/drills?id=${rec.drill_id}`)}
              >
                View Drill
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
