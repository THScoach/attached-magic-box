import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, TrendingUp, Star } from "lucide-react";
import { HitsLogo } from "@/components/HitsLogo";
import { Link } from "react-router-dom";

export default function Pricing() {
  const handleCheckout = (tier: 'challenge' | 'diy' | 'elite') => {
    // These URLs will be set in your .env file after creating Whop products
    const urls = {
      challenge: import.meta.env.VITE_WHOP_CHALLENGE_URL || 'https://whop.com/the-hitting-skool/challenge-997/',
      diy: import.meta.env.VITE_WHOP_DIY_URL || 'https://whop.com/the-hitting-skool/diy-annual-297/',
      elite: import.meta.env.VITE_WHOP_ELITE_URL || 'https://whop.com/the-hitting-skool/elite-annual-997/',
    };

    // Open Whop checkout in same tab
    window.location.href = urls[tier];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <HitsLogo />
          </Link>
          <Button asChild variant="ghost">
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Simple, Transparent Pricing</Badge>
            <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">
              Choose Your Path
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with 10 free swings, then unlock unlimited analysis and expert coaching
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Challenge Card */}
            <Card className="relative border-2 border-primary/50 hover:border-primary transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Zap className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-black uppercase">
                  7-Day Challenge
                </CardTitle>
                <CardDescription>Perfect for trying HITS</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-black">$9.97</div>
                  <div className="text-sm text-muted-foreground">one-time</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited swing analyses for 7 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Coach Rick AI chat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Personalized drill recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Progress tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Community access</span>
                  </li>
                </ul>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90 font-bold"
                  onClick={() => handleCheckout('challenge')}
                >
                  Start 7-Day Challenge
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Try HITS risk-free for a week
                </p>
              </CardContent>
            </Card>

            {/* DIY Card */}
            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-black uppercase flex items-center justify-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  DIY
                </CardTitle>
                <CardDescription>For self-motivated athletes</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-black">$297</div>
                  <div className="text-sm text-muted-foreground">/year</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    or 4 payments of $74.25 with Klarna
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited swing analyses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Coach Rick AI chat (unlimited)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Personalized drill plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Progress tracking & history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced biomechanics reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Priority email support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Community access</span>
                  </li>
                </ul>

                <Button 
                  className="w-full font-bold"
                  variant="outline"
                  onClick={() => handleCheckout('diy')}
                >
                  Join DIY Platform
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Annual billing • Cancel anytime
                </p>
              </CardContent>
            </Card>

            {/* Elite Card */}
            <Card className="relative border-2 border-primary/30 hover:border-primary/50 transition-all bg-gradient-to-br from-primary/5 to-background">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Best Value
                </Badge>
              </div>

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-black uppercase flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 text-primary" />
                  Elite
                </CardTitle>
                <CardDescription>Maximum transformation</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-black">$997</div>
                  <div className="text-sm text-muted-foreground">/year</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    or 12 payments of $83 with Klarna
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-sm font-semibold text-center text-primary mb-2">
                  Everything in DIY, PLUS:
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Monthly 1-on-1 video call with Coach Rick</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Custom 12-week training program</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Priority support (24hr response)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Equipment recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Exclusive community access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Direct messaging with Coach Rick</span>
                  </li>
                </ul>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90 font-bold"
                  onClick={() => handleCheckout('elite')}
                >
                  Join Elite Program
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Annual billing • Premium support
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Free Tier Notice */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Button asChild variant="link" className="text-primary p-0">
                <Link to="/auth">Sign in to get 10 free swings</Link>
              </Button>
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">What's included in the free tier?</h3>
                <p className="text-sm text-muted-foreground">
                  New users get 10 free swing analyses to try the HITS system. After that, upgrade to continue improving.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! DIY and Elite are annual subscriptions that you can cancel at any time. The 7-Day Challenge is a one-time purchase.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What is Klarna financing?</h3>
                <p className="text-sm text-muted-foreground">
                  Klarna lets you split your payment into 4 interest-free payments (DIY) or 12 monthly payments (Elite). No credit check required.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I upgrade from Challenge to DIY or Elite?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutely! Your 7-Day Challenge gives you a taste of the platform. Upgrade anytime during or after your trial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
