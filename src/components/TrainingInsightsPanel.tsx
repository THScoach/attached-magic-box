import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, TrendingUp, TrendingDown, Target, Dumbbell, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { useTrainingInsights } from "@/hooks/useTrainingInsights";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TrainingInsightsPanelProps {
  playerId?: string;
}

export function TrainingInsightsPanel({ playerId }: TrainingInsightsPanelProps) {
  const { insights, trends, loading, generateInsights } = useTrainingInsights();
  const [showInsights, setShowInsights] = useState(false);

  const handleGenerate = async () => {
    await generateInsights(playerId);
    setShowInsights(true);
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'ANCHOR': return 'bg-anchor text-anchor-foreground';
      case 'ENGINE': return 'bg-engine text-engine-foreground';
      case 'WHIP': return 'bg-whip text-whip-foreground';
      default: return 'bg-primary';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">AI Training Insights</h3>
      </div>

      {!showInsights ? (
        <div className="text-center py-12">
          <Brain className="h-20 w-20 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get AI-powered analysis of your performance patterns with personalized drill recommendations and training plans.
          </p>
          <Button onClick={handleGenerate} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Performance...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Training Insights
              </>
            )}
          </Button>
        </div>
      ) : insights ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="drills">Drills</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Assessment */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Overall Assessment
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights.assessment}
              </p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Key Strengths
              </h4>
              <div className="space-y-2">
                {insights.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Areas for Improvement
              </h4>
              <div className="space-y-2">
                {insights.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-500 mt-0.5">→</span>
                    <span>{improvement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Focus */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                Training Focus
              </h4>
              <p className="text-sm">{insights.trainingFocus}</p>
            </Card>

            <Button onClick={handleGenerate} disabled={loading} variant="outline" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Refresh Insights
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="drills" className="mt-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {insights.drillRecommendations.map((drill, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{drill.name}</h4>
                        <Badge className={`mt-2 ${getPillarColor(drill.pillar)}`}>
                          {drill.pillar}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {drill.description}
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Why This Drill:</p>
                      <p className="text-sm">{drill.reason}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="plan" className="space-y-6 mt-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                This Week's Focus
              </h4>
              <p className="text-sm text-muted-foreground">
                {insights.weeklyPlan.focus}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Practice Structure</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights.weeklyPlan.structure}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="space-y-3">
              {Object.entries(trends).map(([metric, value]) => (
                <div key={metric} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    {value > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">
                          +{value.toFixed(1)}%
                        </span>
                      </>
                    ) : value < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-500">
                          {value.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">
                        0%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No insights available. Record more swings to get analysis.
          </p>
        </div>
      )}
    </Card>
  );
}
