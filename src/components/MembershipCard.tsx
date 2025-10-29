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
      label: "Free",
      color: "secondary",
      features: ["Basic analysis", "Limited drills"],
    },
    basic: {
      icon: Zap,
      label: "Basic",
      color: "default",
      features: ["Full analysis", "All drills", "Training programs"],
    },
    pro: {
      icon: Crown,
      label: "Pro",
      color: "default",
      features: ["Everything in Basic", "AI Coach Rick", "Priority support", "Advanced analytics"],
    },
  };

  const config = tierConfig[membership?.tier || "free"];
  const Icon = config.icon;

  const handleUpgrade = () => {
    // Replace with your actual Whop checkout URL
    window.open("https://whop.com/your-product", "_blank");
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
            ? "Upgrade to unlock premium features"
            : "You have full access to premium features"}
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
