import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Check, ChevronRight, ArrowRight } from "lucide-react";
import { HitsLogo, HitsMonogram } from "@/components/HitsLogo";

export default function Programs() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <HitsLogo />
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/about">About</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link to="/auth">
                <HitsMonogram className="h-6 w-6 mr-2" />
                App Login
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,192,192,0.08)_0%,transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Choose Your Path
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            From free analysis to elite 1-on-1 coaching — pick the program that matches your commitment level
          </p>
        </div>
      </section>

      {/* Product Cards Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 max-w-6xl mx-auto">
            
            {/* FREE - HITS Tempo Score */}
            <Card className="border-2 border-green-500/30 bg-zinc-900 hover:border-green-500/50 transition-all">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="mb-2">
                      <span className="text-4xl font-black text-green-500">FREE</span>
                    </div>
                    <CardTitle className="text-2xl font-black uppercase mb-2">HITS Tempo Score</CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      Instant swing analysis with personalized tempo breakdown
                    </CardDescription>
                  </div>
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase whitespace-nowrap">
                    <Link to="/auth">
                      Start Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Instant Tempo Score (2.0:1 vs 1.5:1)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Basic Anchor-Engine-Whip breakdown</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Access to drill library</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* $9.97 - 7-Day Challenge */}
            <Card className="border-2 border-primary/50 bg-zinc-900 hover:border-primary transition-all shadow-lg shadow-primary/20">
              <div className="absolute -top-4 left-8 bg-red-500 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase">
                🔥 Best Value
              </div>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="mb-2">
                      <span className="text-4xl font-black text-primary">$9.97</span>
                    </div>
                    <CardTitle className="text-2xl font-black uppercase mb-2">HITS 7-Day Challenge</CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      Prove the system works with daily coaching and feedback
                    </CardDescription>
                  </div>
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase whitespace-nowrap">
                    <a href="https://whop.com/the-hitting-skool/297-b6/" target="_blank" rel="noopener noreferrer">
                      Start Challenge <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300 font-semibold">Daily video analysis + feedback</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300">Personalized 7-day drill progression</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300">Coach Rick live Q&A access</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    <span className="font-bold text-primary">+3-5 MPH average gain</span> in just 7 days • Over 400 enrolled this month
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* $29.97/mo - HITS Membership (DIY) */}
            <Card className="border-2 border-white/20 bg-zinc-900 hover:border-white/40 transition-all">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="mb-2 space-y-1">
                      <div>
                        <span className="text-4xl font-black text-white">$29.97</span>
                        <span className="text-xl text-gray-400">/mo</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black uppercase mb-2">HITS Membership</CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      Full platform access with unlimited AI-powered analysis
                    </CardDescription>
                  </div>
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase whitespace-nowrap">
                    <a href="https://whop.com/the-hitting-skool/hits-diy-platform/" target="_blank" rel="noopener noreferrer">
                      Join Now <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Unlimited AI video reviews</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Full drill library (60+ exercises)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Tempo Tracker dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Progress tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Weekly training schedules</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Community support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Elite - 90-Day Transformation */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-zinc-900 to-zinc-950 hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="mb-2">
                      <span className="text-3xl font-black text-primary">$2,497</span>
                    </div>
                    <CardTitle className="text-2xl font-black uppercase mb-2">
                      HITS 90-Day Transformation
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      Done-with-you elite coaching with performance guarantee
                    </CardDescription>
                  </div>
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase whitespace-nowrap">
                    <Link to="/book-call">
                      Book Call <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm mb-6">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300 font-semibold">Weekly 1-on-1 video reviews</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300">Custom 90-day periodization plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300">Priority support (24hr response)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300">Direct access to Coach Rick</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300">Bi-weekly progress check-ins</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-300 font-bold">Performance guarantee</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-base font-black text-primary text-center">
                    +5 MPH Exit Velo Guarantee or Full Refund
                  </p>
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Limited to 15 athletes per quarter • Requires consultation
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Coaches & Teams */}
            <Card className="border-2 border-white/20 bg-zinc-900 hover:border-white/40 transition-all">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black uppercase mb-2">
                      Coaches & Teams
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      Custom programs, bulk licensing, and dedicated support for organizations
                    </CardDescription>
                  </div>
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase whitespace-nowrap">
                    <Link to="/request-demo">
                      Request Demo <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Team-wide analytics dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Custom training programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Bulk seat licensing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">On-site workshop options</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Dedicated account manager</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">White-label options available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 text-4xl font-black uppercase md:text-5xl">
              Not Sure Where to Start?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Begin with a free Tempo Score analysis and discover what's holding your swing back
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-bold uppercase">
              <Link to="/auth">
                Get Free Analysis <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <HitsMonogram className="h-8 w-8" />
              <p className="text-sm text-gray-400">
                © 2025 The Hitting Skool. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <Link to="/auth">App Login</Link>
              </Button>
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <a href="mailto:support@thehittingskool.com">Support</a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
