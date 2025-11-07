import { useWhopMembership } from "@/hooks/useWhopMembership";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, Zap, Trophy, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export function WhopSubscriptionCard() {
  const { membership, loading } = useWhopMembership();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const tierDetails = {
    free: {
      name: "Free Trial",
      icon: Zap,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      benefits: ["10 swing analyses", "Basic metrics", "View replays"],
    },
    challenge: {
      name: "21-Day Challenge",
      icon: Trophy,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      benefits: ["Unlimited analyses", "Weekly scheduler", "GRIND score", "Coach Rick AI"],
    },
    diy: {
      name: "DIY Annual",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      benefits: ["Everything in Challenge", "Full scheduler", "Live coaching access", "Advanced analytics"],
    },
    elite: {
      name: "Elite Transformation",
      icon: Crown,
      color: "text-primary",
      bgColor: "bg-primary/10",
      benefits: ["Everything in DIY", "1-on-1 coaching", "Priority support", "Custom training plans"],
    },
  };

  const tier = membership.tier;
  const details = tierDetails[tier];
  const Icon = details.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${details.color}`} />
            {details.name}
          </CardTitle>
          <Badge 
            variant={membership.status === 'active' ? 'default' : 'secondary'}
            className={membership.status === 'active' ? details.bgColor : ''}
          >
            {membership.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <CardDescription>
          {tier === 'free' && (
            <>
              {membership.swingCount >= 10 
                ? "You've used all your free swings" 
                : `${10 - membership.swingCount} swings remaining`}
            </>
          )}
          {tier === 'challenge' && membership.expiresAt && (
            <>Expires {format(new Date(membership.expiresAt), 'MMM d, yyyy')}</>
          )}
          {['diy', 'elite'].includes(tier) && (
            <>Unlimited access to all features</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Benefits List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Benefits:</p>
          <ul className="space-y-1">
            {details.benefits.map((benefit, index) => (
              <li key={index} className="text-sm flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade CTA for free/challenge users */}
        {['free', 'challenge'].includes(tier) && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              {tier === 'free' 
                ? 'Unlock unlimited analyses and advanced features' 
                : 'Upgrade for 1-on-1 coaching and custom training'}
            </p>
            <Button 
              className="w-full" 
              variant={tier === 'free' ? 'default' : 'outline'}
              onClick={() => window.open('https://whop.com/hits', '_blank')}
            >
              <Crown className="h-4 w-4 mr-2" />
              {tier === 'free' ? 'Upgrade Now' : 'View Premium Plans'}
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        )}

        {/* Manage subscription link */}
        {membership.status === 'active' && tier !== 'free' && (
          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full text-xs"
              onClick={() => window.open('https://whop.com/hub', '_blank')}
            >
              Manage Subscription
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
