import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Star } from "lucide-react";
import { useUserMembership } from "@/hooks/useUserMembership";

export function MembershipCard() {
  const { membership, loading } = useUserMembership();

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

  const handleUpgrade = () => {
    // Open 7-Day Challenge checkout for free users
    window.open("https://whop.com/the-hitting-skool/297-b6/", "_blank");
  };

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
            ? `${membership.swingCount || 0}/2 swings used - Upgrade to unlock more`
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
        
        {membership?.tier === "free" && (
          <Button onClick={handleUpgrade} className="w-full">
            Upgrade Now
          </Button>
        )}

        {membership?.expiresAt && (
          <p className="text-xs text-muted-foreground">
            Expires: {new Date(membership.expiresAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
