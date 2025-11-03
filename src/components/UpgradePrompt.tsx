import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Star, Lock, X } from "lucide-react";
import { useTierAccess } from "@/hooks/useTierAccess";

interface UpgradePromptProps {
  context?: 'swing_limit' | 'coach_rick' | 'book_call' | 'challenge_expiring' | 'challenge_expired';
  onClose?: () => void;
}

const WHOP_URLS = {
  challenge: 'https://whop.com/the-hitting-skool/297-b6/',
  diy: 'https://whop.com/the-hitting-skool/diy-annual/',
  elite: 'https://whop.com/the-hitting-skool/elite-90-day-transformation/',
};

export function UpgradePrompt({ context = 'swing_limit', onClose }: UpgradePromptProps) {
  const { tier, swingCount, swingsRemaining, daysRemaining, isExpired } = useTierAccess();

  // Free tier - used all 10 swings
  if (context === 'swing_limit' && tier === 'free' && swingsRemaining === 0) {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <Lock className="h-8 w-8 text-primary" />
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardTitle className="text-2xl">You've Used All 10 Free Swings!</CardTitle>
          <CardDescription>
            Upgrade to continue analyzing your swing and unlock expert coaching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Challenge Option */}
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">7-Day Challenge</CardTitle>
                  <CardDescription>Try HITS™ risk-free</CardDescription>
                </div>
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-black">$9.97</div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Unlimited swings for 7 days</li>
                <li>✓ Coach Rick AI chat</li>
                <li>✓ Personalized drills</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => window.location.href = WHOP_URLS.challenge}
              >
                Start Challenge
              </Button>
            </CardContent>
          </Card>

          {/* DIY Option */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">DIY Annual</CardTitle>
                  <CardDescription>Full platform access</CardDescription>
                </div>
                <Badge>Best Value</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-3xl font-black">$297/year</div>
                <div className="text-xs text-muted-foreground">or 4 payments of $74.25 with Klarna</div>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Unlimited swing analyses</li>
                <li>✓ Coach Rick AI (unlimited)</li>
                <li>✓ Progress tracking & history</li>
                <li>✓ Advanced biomechanics reports</li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = WHOP_URLS.diy}
              >
                Get DIY Annual
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  // Coach Rick AI is premium
  if (context === 'coach_rick') {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <TrendingUp className="h-8 w-8 text-primary" />
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardTitle className="text-2xl">Coach Rick AI is Premium</CardTitle>
          <CardDescription>
            Get unlimited AI coaching with DIY or Elite membership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">DIY Annual - $297/year</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => window.location.href = WHOP_URLS.diy}
              >
                Upgrade to DIY
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Elite Annual - $997/year</CardTitle>
              <CardDescription>Includes monthly 1-on-1 calls</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = WHOP_URLS.elite}
              >
                Upgrade to Elite
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  // 1-on-1 Coaching is Elite only
  if (context === 'book_call') {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <Star className="h-8 w-8 text-primary" />
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardTitle className="text-2xl">1-on-1 Coaching is Elite Only</CardTitle>
          <CardDescription>
            Get monthly video calls with Coach Rick
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Elite Annual - $997/year</CardTitle>
              <CardDescription className="text-xs">or 12 payments of $83 with Klarna</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Everything in DIY, PLUS:</li>
                <li>✓ Monthly 1-on-1 video calls</li>
                <li>✓ Custom 12-week training program</li>
                <li>✓ Priority support (24-hour response)</li>
                <li>✓ Equipment recommendations</li>
                <li>✓ Exclusive community access</li>
              </ul>
              <Button 
                className="w-full"
                onClick={() => window.location.href = WHOP_URLS.elite}
              >
                Upgrade to Elite
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  // Challenge expiring soon
  if (context === 'challenge_expiring' && tier === 'challenge' && daysRemaining && daysRemaining <= 2) {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Your Challenge is Ending Soon!</CardTitle>
          <CardDescription>
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upgrade now to keep your progress and continue improving
          </p>
          
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">DIY Annual - $297/year</CardTitle>
              <CardDescription>Most popular choice after challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => window.location.href = WHOP_URLS.diy}
              >
                Continue with DIY
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Elite Annual - $997/year</CardTitle>
              <CardDescription>Add monthly 1-on-1 coaching</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = WHOP_URLS.elite}
              >
                Upgrade to Elite
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  // Challenge expired
  if (context === 'challenge_expired' && tier === 'challenge' && isExpired) {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Your 7-Day Challenge Has Ended</CardTitle>
          <CardDescription>
            Upgrade to continue analyzing your swing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You've been reverted to the free tier (10 swings). Upgrade to unlock unlimited analyses and expert coaching.
          </p>
          
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">DIY Annual - $297/year</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => window.location.href = WHOP_URLS.diy}
              >
                Get DIY Annual
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Elite Annual - $997/year</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = WHOP_URLS.elite}
              >
                Get Elite Annual
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  return null;
}
