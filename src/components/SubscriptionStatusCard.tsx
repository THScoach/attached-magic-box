import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Check, X, Crown, Zap, Target } from "lucide-react";
import { useSubscriptionTier } from "@/hooks/useSubscriptionTier";
import { toast } from "sonner";
import { formatDistance } from "date-fns";

export function SubscriptionStatusCard() {
  const { subscription, isLoading, refreshTier } = useSubscriptionTier();

  const handleRefresh = async () => {
    toast.info("Refreshing subscription...");
    await refreshTier();
    toast.success("Subscription refreshed!");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Loading your subscription details...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const getTierIcon = () => {
    switch (subscription.tier) {
      case "elite":
        return <Crown className="h-5 w-5 text-primary" />;
      case "diy":
        return <Zap className="h-5 w-5 text-blue-500" />;
      case "challenge":
        return <Target className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getTierColor = () => {
    switch (subscription.tier) {
      case "elite":
        return "bg-gradient-to-r from-primary to-amber-400 text-black";
      case "diy":
        return "bg-blue-500";
      case "challenge":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTierIcon()}
            <div>
              <CardTitle className="flex items-center gap-2">
                Subscription Status
                <Badge className={getTierColor()}>
                  {subscription.tier.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Status: {subscription.status}
                {subscription.expiresAt && (
                  <> • Expires {formatDistance(new Date(subscription.expiresAt), new Date(), { addSuffix: true })}</>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Swing Count for non-unlimited tiers */}
        {subscription.features.swingsAllowed > 0 && (
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Swings Used</span>
              <span className="text-lg font-bold">
                {subscription.swingCount} / {subscription.features.swingsAllowed}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    (subscription.swingCount / subscription.features.swingsAllowed) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Features List */}
        <div>
          <h4 className="mb-3 font-semibold">Your Features</h4>
          <div className="grid gap-2">
            <FeatureItem
              enabled={subscription.features.unlimitedAnalyses}
              label="Unlimited Swing Analyses"
            />
            <FeatureItem
              enabled={subscription.features.coachRickAI}
              label="Coach Rick AI Chat"
            />
            <FeatureItem
              enabled={subscription.features.drillPlans}
              label="Personalized Drill Plans"
            />
            <FeatureItem
              enabled={subscription.features.advancedReports}
              label="Advanced Biomechanics Reports"
            />
            <FeatureItem
              enabled={subscription.features.liveCoaching}
              label="Live Coaching Access"
            />
          </div>
        </div>

        {/* Upgrade CTA for free/challenge users */}
        {(subscription.tier === "free" || subscription.tier === "challenge") && (
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
            <h4 className="mb-2 font-bold text-primary">Upgrade Your Training</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Get unlimited analyses, AI coaching, and advanced features
            </p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.location.href = "/programs"}
            >
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FeatureItem({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-400" />
      )}
      <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}
