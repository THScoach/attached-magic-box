import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Anchor, Zap, Settings, ChevronRight } from "lucide-react";
import { HitsLogo, HitsMonogram } from "@/components/HitsLogo";

export default function Landing() {
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
              <Link to="/programs">Programs</Link>
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
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,192,192,0.08)_0%,transparent_70%)]" />
        
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mb-6 text-6xl font-black uppercase leading-tight tracking-tight md:text-7xl lg:text-8xl">
              Simplify the Science.<br />
              Train the Sequence.
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-300 md:text-2xl">
              Master the tempo-based swing system that MLB organizations use to develop All-Stars.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-bold uppercase">
                <Link to="/auth">
                  Get Your Tempo Score Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg font-bold uppercase">
                <a href="#system">What's The HITS System?</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Pros Bar */}
      <section className="py-12 bg-zinc-950 border-y border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">
            Trusted By Professional Athletes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-300">
            <span className="text-lg font-bold">Pete Crow-Armstrong</span>
            <span className="text-2xl text-gray-600">•</span>
            <span className="text-lg font-bold">Cedric Mullins</span>
            <span className="text-2xl text-gray-600">•</span>
            <span className="text-lg font-bold">Matt Adams</span>
            <span className="text-2xl text-gray-600">•</span>
            <span className="text-lg font-bold">MLB Organizations</span>
          </div>
        </div>
      </section>

      {/* The HITS System - 3 Pillars */}
      <section id="system" className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl mb-16 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              The HITS System
            </p>
            <h2 className="mb-6 text-4xl font-black uppercase md:text-5xl">
              Three Pillars of Power
            </h2>
            <p className="text-xl text-gray-300">
              Elite swing mechanics broken down into three sequenced movements
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-12">
            <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/50 transition-all">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 border-2 border-blue-500/30">
                  <Anchor className="h-10 w-10 text-blue-500" />
                </div>
                <CardTitle className="text-2xl font-black uppercase text-blue-500">Anchor</CardTitle>
                <p className="text-gray-400 mt-2">Ground Force & Stability</p>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-300">
                  Rear leg stability and connection point timing — the foundation of all power generation
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent hover:border-red-500/50 transition-all">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/30">
                  <Settings className="h-10 w-10 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-black uppercase text-red-500">Engine</CardTitle>
                <p className="text-gray-400 mt-2">Rotational Power</p>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-300">
                  Pelvis-to-torso coil and rotation timing — where bat speed is created
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/50 transition-all">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 border-2 border-orange-500/30">
                  <Zap className="h-10 w-10 text-orange-500" />
                </div>
                <CardTitle className="text-2xl font-black uppercase text-orange-500">Whip</CardTitle>
                <p className="text-gray-400 mt-2">Kinetic Release</p>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-300">
                  Hand path release and lag acceleration — the final explosion through contact
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="aspect-video max-w-3xl mx-auto rounded-lg border-2 border-white/10 bg-zinc-900 overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-xl font-bold text-gray-400 mb-2">System Explainer Video</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes HITS Different */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl mb-16 text-center">
            <h2 className="mb-6 text-4xl font-black uppercase md:text-5xl">
              What Makes HITS Different
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Tempo-Based Swing Science</h3>
                <p className="text-gray-400">
                  We don't guess at mechanics — we measure precise timing sequences used by MLB organizations
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Anchored in Biomechanics</h3>
                <p className="text-gray-400">
                  Every recommendation is rooted in kinematic sequencing principles proven by sports science
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Built by a Pro Hitting Coach</h3>
                <p className="text-gray-400">
                  25+ years developing MLB All-Stars and first-round draft picks at the highest level
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Follow a Proven Plan</h3>
                <p className="text-gray-400">
                  Stop guessing what to work on — get a personalized roadmap based on YOUR swing data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="mb-16 text-center text-4xl font-black uppercase md:text-5xl">
            Trusted by Elite Hitters
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <Card className="border-primary/30 bg-zinc-900">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-4xl font-black text-primary mb-1">+7 MPH</p>
                  <p className="text-sm text-gray-400">Exit Velocity Gain</p>
                </div>
                <p className="text-lg italic text-gray-300 mb-4">
                  "The tempo breakdown showed me exactly what I was doing wrong. Fixed it in 3 weeks."
                </p>
                <p className="text-sm font-semibold text-white">
                  — Pete Crow-Armstrong
                </p>
                <p className="text-xs text-gray-500">Chicago Cubs</p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-zinc-900">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-4xl font-black text-primary mb-1">+5 MPH</p>
                  <p className="text-sm text-gray-400">Exit Velocity Gain</p>
                </div>
                <p className="text-lg italic text-gray-300 mb-4">
                  "Finally understood why my power wasn't showing up in games. The sequencing was off."
                </p>
                <p className="text-sm font-semibold text-white">
                  — Cedric Mullins
                </p>
                <p className="text-xs text-gray-500">Baltimore Orioles</p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-zinc-900">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-4xl font-black text-primary mb-1">Career</p>
                  <p className="text-sm text-gray-400">Changing Impact</p>
                </div>
                <p className="text-lg italic text-gray-300 mb-4">
                  "This is the swing coaching that helped me reach the big leagues and stay there."
                </p>
                <p className="text-sm font-semibold text-white">
                  — Matt Adams
                </p>
                <p className="text-xs text-gray-500">MLB Veteran</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-black uppercase md:text-5xl">
              Ready to Unlock Your Power?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Get your free Tempo Score in 60 seconds. No equipment needed. Just your phone.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-bold uppercase">
              <Link to="/auth">
                Analyze My Swing Free <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-gray-400">
              Join 2,847+ hitters improving their swing with HITS
            </p>
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
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <a href="/privacy">Privacy</a>
              </Button>
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <a href="/terms">Terms</a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
