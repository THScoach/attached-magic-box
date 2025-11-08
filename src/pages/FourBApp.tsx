import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HitsLogo } from "@/components/HitsLogo";
import { Brain, Activity, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function FourBApp() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-block">
            <HitsLogo className="h-12" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            The 4B App — Train Smarter. Measure Everything.
          </h1>
          <p className="text-xl text-muted-foreground">
            Start with the Free 4B Tempo Analyzer, level up with the DIY Challenge, and unlock full access when you join a 4B Program.
          </p>
        </div>
      </section>

      {/* Offer Tiers */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl space-y-6">
          {/* Tier 1: Free Tempo Analyzer */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Free 4B Tempo Analyzer</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Find your rhythm. Upload a swing and see your tempo score in seconds.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  // TODO: Replace placeholder GoHighLevel link for Free Tempo Analyzer (tag: THS_TEMPO_LEAD)
                  alert('Replace with GoHighLevel form link');
                }}>
                  Get Your Free Tempo Score
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Tier 2: DIY Challenge */}
          <Card className="border-primary/30 hover:border-primary/50 transition-all shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">DIY 4B Challenge</CardTitle>
                    <span className="text-xl font-bold text-primary">One-Time $99</span>
                  </div>
                  <CardDescription className="text-base mt-1">
                    Run the same drills and tempo checks we use with elite hitters.<br />
                    Self-paced. No coaching calls. Just results.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button size="lg" variant="default" className="w-full sm:w-auto" asChild>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  // TODO: Replace placeholder GoHighLevel checkout link for DIY Challenge (tag: THS_DIY)
                  alert('Replace with GoHighLevel checkout link');
                }}>
                  Join the DIY Challenge
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Tier 3: Full App Access */}
          <Card className="border-primary/40 hover:border-primary/60 transition-all shadow-xl bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Full 4B App Access</CardTitle>
                  <CardDescription className="text-base mt-1 font-medium">
                    Included with Coaching
                  </CardDescription>
                  <CardDescription className="text-base mt-2">
                    Every Pod, Remote, and Private athlete gets full 4B App access to track Brain, Body, Bat, and Ball metrics.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                <Link to="/programs#programs">
                  Join a 4B Program
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4B Pillars Overview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Track All Four Pillars</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Brain</h3>
              <p className="text-sm text-muted-foreground">Tempo, timing, and cognitive processing</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Body</h3>
              <p className="text-sm text-muted-foreground">Sequencing, power, and movement quality</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Bat</h3>
              <p className="text-sm text-muted-foreground">Speed, path, and swing mechanics</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Ball</h3>
              <p className="text-sm text-muted-foreground">Exit velocity, launch angle, and contact quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>All 4B App offers and payments are managed through GoHighLevel + Stripe.</p>
          <p className="mt-4">© 2025 HITS Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
