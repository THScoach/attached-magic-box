import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Star, ArrowUpRight } from "lucide-react";
import { useWhopMembership } from "@/hooks/useWhopMembership";
import { useWhopAuth } from "@/contexts/WhopContext";

export function MembershipCard() {
  const { membership, loading } = useWhopMembership();
  const { upgradeToTier } = useWhopAuth();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading membership...</p>
        </CardContent>
      </Card>
    );
  }

  const tierConfig = {
    free: {
      icon: Star,
      label: "Free Lead Magnet",
      color: "secondary",
      features: ["2 swing analyses", "Basic metrics"],
    },
    challenge: {
      icon: Zap,
      label: "7-Day Challenge",
      color: "default",
      features: ["Full access for 7 days", "All drills", "Training programs", "AI Coach Rick"],
    },
    diy: {
      icon: Crown,
      label: "DIY Platform",
      color: "default",
      features: ["AI Coach Rick chat", "Live streams access", "Unlimited swing analyses", "All training programs"],
    },
    elite: {
      icon: Crown,
      label: "Elite Transformation",
      color: "default",
      features: ["Everything in DIY", "In-person coaching", "Priority support", "90-day program"],
    },
  };

  const config = tierConfig[membership?.tier || "free"];
  const Icon = config.icon;


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle>Membership</CardTitle>
          </div>
          <Badge variant={config.color as any}>{config.label}</Badge>
        </div>
        <CardDescription>
          {membership?.tier === "free" 
            ? `${membership.swingCount || 0}/10 swings used`
            : membership?.tier === "challenge"
            ? "Full access for 7 days"
            : "You have unlimited access"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Features:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {config.features.map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
        </div>
        

        {membership?.expiresAt && (
          <p className="text-xs text-muted-foreground">
            Expires: {new Date(membership.expiresAt).toLocaleDateString()}
          </p>
        )}

        {membership?.tier === "free" && (
          <div className="space-y-2 pt-2 border-t">
            <Button 
              onClick={() => upgradeToTier('challenge')} 
              className="w-full"
              size="sm"
            >
              Try 7-Day Challenge <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {membership?.tier === "challenge" && (
          <div className="space-y-2 pt-2 border-t">
            <Button 
              onClick={() => upgradeToTier('diy')} 
              className="w-full"
              size="sm"
              variant="outline"
            >
              Upgrade to DIY <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {membership?.tier === "diy" && (
          <div className="space-y-2 pt-2 border-t">
            <Button 
              onClick={() => upgradeToTier('elite')} 
              className="w-full"
              size="sm"
              variant="outline"
            >
              Upgrade to Elite <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
