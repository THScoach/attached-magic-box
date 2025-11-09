import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Target, Lightbulb, TrendingUp, MessageCircle } from "lucide-react";
import { useState } from "react";
import coachRickAvatar from "@/assets/coach-rick-avatar.png";

interface CoachRickInsightCardProps {
  insights: {
    mainMessage: string;
    keyInsight?: string;
    weeklyFocus?: string;
    strengths?: string[];
    improvements?: string[];
    profile?: string;
  };
  onAskQuestion?: () => void;
  loading?: boolean;
}

export function CoachRickInsightCard({ insights, onAskQuestion, loading }: CoachRickInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={coachRickAvatar} alt="Coach Rick" />
              <AvatarFallback>CR</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Coach Rick
              </CardTitle>
              <p className="text-xs text-muted-foreground">Analyzing your swing...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={coachRickAvatar} alt="Coach Rick" />
              <AvatarFallback>CR</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Coach Rick
              </CardTitle>
              <p className="text-xs text-muted-foreground">Your Personal Hitting Coach</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Minimize" : "Expand"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Main Message */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {insights.mainMessage}
            </p>
          </div>

          {/* Key Insight */}
          {insights.keyInsight && (
            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-1">
                    KEY INSIGHT:
                  </p>
                  <p className="text-sm text-foreground">{insights.keyInsight}</p>
                </div>
              </div>
            </div>
          )}

          {/* Strengths */}
          {insights.strengths && insights.strengths.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="font-semibold text-sm text-green-700 dark:text-green-300">
                  YOUR STRENGTHS:
                </p>
              </div>
              <div className="space-y-1 ml-6">
                {insights.strengths.map((strength, idx) => (
                  <p key={idx} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-green-500">✅</span>
                    <span>{strength}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {insights.improvements && insights.improvements.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-yellow-500" />
                <p className="font-semibold text-sm text-yellow-700 dark:text-yellow-300">
                  AREAS TO REFINE:
                </p>
              </div>
              <div className="space-y-1 ml-6">
                {insights.improvements.map((improvement, idx) => (
                  <p key={idx} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-yellow-500">⚠️</span>
                    <span>{improvement}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Focus */}
          {insights.weeklyFocus && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-primary mb-1">
                    🎯 FOCUS THIS WEEK:
                  </p>
                  <p className="text-sm text-foreground">{insights.weeklyFocus}</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Badge */}
          {insights.profile && (
            <div className="flex justify-center">
              <Badge variant="outline" className="text-xs">
                Profile: {insights.profile.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
          )}

          {/* Actions */}
          {onAskQuestion && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onAskQuestion}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask Coach Rick
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
