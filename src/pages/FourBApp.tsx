// TODO: Replace placeholder GoHighLevel links for Free Tempo Analyzer and DIY Challenge.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HitsLogo } from "@/components/HitsLogo";
import { Brain, Activity, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import appDashboardMockup from "@/assets/app-dashboard-mockup.jpg";
import swingTempoAnalysis from "@/assets/swing-tempo-analysis.jpg";
import coachAthleteTraining from "@/assets/coach-athlete-training.jpg";

export default function FourBApp() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="inline-block">
              <HitsLogo className="h-12" />
            </Link>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="text-white hover:text-primary">
                <Link to="/">Home</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:text-primary">
                <Link to="/train-in-person">In-Person Training</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:text-primary">
                <Link to="/remote-training">Remote Training</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:text-primary">
                <Link to="/4b-app">The 4B App</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:text-primary">
                <Link to="/community">Community</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:text-primary">
                <Link to="/about">About</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                <Link to="/auth">Login</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Background Video Loop Placeholder */}
      <section className="relative h-[40vh] min-h-[400px] overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background z-10" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
          <div className="text-center">
            <p className="text-primary text-sm font-semibold mb-2">[ Background Video Loop Placeholder ]</p>
            <p className="text-muted-foreground text-xs">3-5 second loop of training footage or app interface</p>
          </div>
        </div>
      </section>

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

      {/* Visual Feature Sections - Alternating Layout */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-24">
          {/* Section 1: App Dashboard - Image Right */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Track Your Progress in Real-Time</h2>
              <p className="text-lg text-muted-foreground mb-4">
                The 4B App gives you instant feedback on every swing. Monitor your tempo, sequencing, bat speed, and contact quality—all in one intuitive dashboard.
              </p>
              <p className="text-muted-foreground">
                No more guessing. See exactly what's working and what needs attention, backed by the same metrics used by elite programs.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-lg blur-xl" />
              <img 
                src={appDashboardMockup} 
                alt="4B App Dashboard Mockup" 
                className="relative rounded-lg shadow-2xl border border-primary/30"
              />
            </div>
          </div>

          {/* Section 2: Swing Analysis - Image Left */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-lg blur-xl" />
              <img 
                src={swingTempoAnalysis} 
                alt="Swing Tempo Analysis" 
                className="relative rounded-lg shadow-2xl border border-primary/30"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Visualize Your Kinetic Chain</h2>
              <p className="text-lg text-muted-foreground mb-4">
                See your swing broken down frame-by-frame with tempo graphs and kinetic sequencing overlays. Understand how energy flows from your lower body through contact.
              </p>
              <p className="text-muted-foreground">
                The same biomechanical insights used by pro hitters, now available on your phone.
              </p>
            </div>
          </div>

          {/* Section 3: Coach Instruction - Image Right */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Expert Coaching, Personalized Feedback</h2>
              <p className="text-lg text-muted-foreground mb-4">
                When you join a 4B program, you get direct access to Coach Rick's proven training system. Every metric is tied to actionable drills and personalized coaching cues.
              </p>
              <p className="text-muted-foreground">
                The app measures. The coaching applies. Together, they transform your swing.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-lg blur-xl" />
              <img 
                src={coachAthleteTraining} 
                alt="Coach Rick instructing athlete" 
                className="relative rounded-lg shadow-2xl border border-primary/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Offer Tiers */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">
            Start free. Upgrade when you're ready.
          </h2>
          <p className="text-center text-muted-foreground mb-8 text-lg">
            Three tiers. One proven system.
          </p>

          <div className="space-y-6">
            {/* Tier 1: Free Tempo Analyzer */}
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Free 4B Tempo Analyzer</CardTitle>
                    <div className="text-lg font-bold text-primary mt-1">$0</div>
                  </div>
                </div>
                <CardDescription className="text-base mt-2">
                  Find your rhythm and discover your personal Load:Fire tempo ratio in seconds.
                </CardDescription>
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

            {/* Tier 2: 7-Day Challenge */}
            <Card className="border-primary/30 hover:border-primary/50 transition-all shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl">7-Day 4B Challenge</CardTitle>
                      <span className="text-xl font-bold text-primary">$9.97 One-Time</span>
                    </div>
                    <CardDescription className="text-base mt-2">
                      Learn the 4B System through a focused 7-day progression. Each day unlocks one key pillar — Brain, Body, Bat, or Ball — so you can train with clarity and confidence.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button size="lg" variant="default" className="w-full sm:w-auto" asChild>
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    // TODO: Replace placeholder GoHighLevel checkout link for 7-Day Challenge (tag: THS_7DAY)
                    alert('Replace with GoHighLevel checkout link');
                  }}>
                    Start the 7-Day Challenge
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Tier 3: DIY Full Access */}
            <Card className="border-primary/40 hover:border-primary/60 transition-all shadow-xl bg-card/80">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl">DIY 4B Full Access</CardTitle>
                      <span className="text-xl font-bold text-primary">$297 One-Time</span>
                    </div>
                    <CardDescription className="text-base mt-2">
                      Unlock full access to the 4B App and train like a pro. Track your Brain, Body, Bat, and Ball metrics, analyze tempo over time, and receive AI-powered feedback.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    // TODO: Replace placeholder GoHighLevel checkout link for DIY Full Access (tag: THS_DIY_FULL)
                    alert('Replace with GoHighLevel checkout link');
                  }}>
                    Upgrade to Full 4B Access
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            All 4B App tiers are one-time payments. No subscriptions. Payments managed through GoHighLevel + Stripe.
          </p>
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
