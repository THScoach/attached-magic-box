import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MembershipTier, TIER_ACCESS, getBCategoryInfo, type BCategory } from "@/lib/fourBsFramework";

interface TierUpgradePromptProps {
  currentTier: MembershipTier;
  lockedCategory?: BCategory;
  lockedMetrics?: string[];
  compact?: boolean;
}

export function TierUpgradePrompt({
  currentTier,
  lockedCategory,
  lockedMetrics = [],
  compact = false,
}: TierUpgradePromptProps) {
  const navigate = useNavigate();

  // Determine next tier to recommend
  const getNextTier = (): MembershipTier => {
    if (currentTier === 'free') return 'challenge';
    if (currentTier === 'challenge') return 'diy';
    return 'elite';
  };

  const nextTier = getNextTier();
  const nextTierInfo = TIER_ACCESS[nextTier];

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-dashed border-primary/30">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-sm">Locked Feature</p>
            <p className="text-xs text-muted-foreground">
              Upgrade to {nextTierInfo.tier.charAt(0).toUpperCase() + nextTierInfo.tier.slice(1)} to unlock
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => navigate('/pricing')}>
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              {lockedCategory ? (
                <>
                  {getBCategoryInfo(lockedCategory).icon}{' '}
                  {getBCategoryInfo(lockedCategory).name} Metrics Locked
                </>
              ) : (
                'Premium Features Locked'
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Upgrade to access {lockedMetrics.length > 0 ? `${lockedMetrics.length} additional metrics` : 'all features'}
            </p>
          </div>
          <Badge variant="secondary" className="text-primary font-bold">
            {nextTierInfo.price}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* What you'll unlock */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            Unlock with {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}:
          </h4>
          <ul className="space-y-1.5">
            {nextTierInfo.features.slice(0, 4).map((feature, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/pricing')}
          >
            <Zap className="h-5 w-5 mr-2" />
            Upgrade Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate('/pricing')}
          >
            Compare All Tiers
          </Button>
        </div>

        {/* Tier-specific messaging */}
        {currentTier === 'free' && (
          <div className="text-xs text-center text-muted-foreground pt-2 border-t">
            🎯 Start with 7-day Challenge for just $9.97 - try all 4 B's!
          </div>
        )}
        {currentTier === 'challenge' && (
          <div className="text-xs text-center text-muted-foreground pt-2 border-t">
            📊 Get improved AI estimates + progress tracking with DIY tier
          </div>
        )}
        {currentTier === 'diy' && (
          <div className="text-xs text-center text-muted-foreground pt-2 border-t">
            ✅ Get sensor-verified accuracy + professional reports with Elite
          </div>
        )}
      </CardContent>
    </Card>
  );
}
