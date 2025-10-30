import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Target, TrendingUp, Video, Zap, ChevronRight } from "lucide-react";
import hitsLogo from "@/assets/hits-logo-minimal.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <img 
            src={hitsLogo} 
            alt="H.I.T.S." 
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-white hover:text-yellow-500">
              <Link to="/programs">Programs</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-yellow-500">
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_65%)]" />
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-500">
              For Serious Hitters Only
            </p>
            <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-7xl lg:text-8xl">
              Add 5–7 MPH Exit Velo<br />
              in 45 Days —<br />
              <span className="text-yellow-500">Or You Don't Pay</span>
            </h1>
            <p className="mb-4 max-w-2xl text-xl text-gray-300 md:text-2xl font-bold">
              The tempo-based system MLB organizations use to develop All-Stars —<br />
              now available to any hitter with just a phone camera.
            </p>
            <p className="mb-6 text-lg text-gray-400">
              No expensive sensors. No guessing. Just upload your swing, get your exact timing breakdown, 
              and follow the personalized drills that fix YOUR specific sequence issues.
            </p>
            <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-zinc-900/50 rounded-lg border border-yellow-500/20">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-black text-yellow-500">+5.2 MPH</div>
                <div className="text-xs text-gray-400 uppercase">Avg EV Gain</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-black text-yellow-500">2,847</div>
                <div className="text-xs text-gray-400 uppercase">Swings Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-black text-yellow-500">38-Day</div>
                <div className="text-xs text-gray-400 uppercase">Average to Results</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-black text-yellow-500">94%</div>
                <div className="text-xs text-gray-400 uppercase">of Hitters Improve</div>
              </div>
            </div>
            <Button asChild size="lg" className="bg-yellow-500 px-8 py-6 text-lg font-bold uppercase text-black hover:bg-yellow-400">
              <Link to="/analyze">
                Analyze My Swing <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-3 text-sm text-gray-400">
              First analysis free. See your Tempo Score in 60 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Problem-Agitate Section */}
      <section className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-4xl font-black uppercase md:text-5xl">
              Here's Why Most Hitters <span className="text-red-500">Never Improve</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              <div className="rounded-lg border border-red-500/30 bg-zinc-900 p-6">
                <div className="mb-3 text-4xl">❌</div>
                <h3 className="mb-2 text-xl font-bold text-red-500">Generic Advice</h3>
                <p className="text-gray-400">
                  "Keep your hands back" and "stay through the ball" don't fix YOUR specific timing issues
                </p>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-zinc-900 p-6">
                <div className="mb-3 text-4xl">❌</div>
                <h3 className="mb-2 text-xl font-bold text-red-500">Expensive Equipment</h3>
                <p className="text-gray-400">
                  $10K+ sensor systems that still don't tell you WHAT to fix or HOW to fix it
                </p>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-zinc-900 p-6">
                <div className="mb-3 text-4xl">❌</div>
                <h3 className="mb-2 text-xl font-bold text-red-500">No Real Diagnosis</h3>
                <p className="text-gray-400">
                  You record your swing but have no idea whether you're early, late, or out of sequence
                </p>
              </div>
            </div>
            <div className="text-center space-y-4">
              <p className="text-xl text-gray-300 font-semibold">
                The result? You practice the same mistimed swing over and over.
              </p>
              <p className="text-lg text-gray-400">
                Meanwhile, the kid hitting bombs at your camp has a swing that looks WORSE than yours...
              </p>
              <p className="text-2xl text-yellow-500 font-black">
                But his TIMING is dialed in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution - Unique Mechanism Section */}
      <section className="bg-black py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-500">
                The Missing Piece
              </p>
              <h2 className="mb-6 text-4xl font-black uppercase md:text-5xl">
                It's Not Your Mechanics.<br />
                It's Your <span className="text-yellow-500">Sequence.</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                MLB teams spend millions studying one thing: <span className="font-bold text-yellow-500">kinematic sequencing</span>.
                <br />It's the difference between a swing that looks good and a swing that <span className="font-bold">produces power</span>.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6 text-center">
                <div className="mb-4 text-5xl font-black text-yellow-500">1</div>
                <h3 className="mb-2 text-lg font-bold">Anchor:</h3>
                <p className="text-sm text-gray-400">
                  Rear leg stability and connection point timing
                </p>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6 text-center">
                <div className="mb-4 text-5xl font-black text-yellow-500">2</div>
                <h3 className="mb-2 text-lg font-bold">Engine:</h3>
                <p className="text-sm text-gray-400">
                  Pelvis-to-torso coil and rotation timing
                </p>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6 text-center">
                <div className="mb-4 text-5xl font-black text-yellow-500">3</div>
                <h3 className="mb-2 text-lg font-bold">Whip:</h3>
                <p className="text-sm text-gray-400">
                  Hand path release and lag acceleration
                </p>
              </div>
            </div>

            <div className="rounded-lg border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 p-8 text-center">
              <p className="text-2xl md:text-3xl font-black text-white mb-4">
                Fix the sequence → Unlock instant power
              </p>
              <p className="text-lg text-gray-300">
                Your body already knows how to generate force. We just show you the exact millisecond 
                each part needs to fire for maximum bat speed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="mb-16 text-center text-4xl font-black uppercase md:text-5xl">
            How It Works
          </h2>
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-500 bg-black text-3xl font-black text-yellow-500">
                1
              </div>
              <h3 className="mb-3 text-xl font-bold uppercase">Record Your Swing</h3>
              <p className="text-gray-400">
                Any camera. Any cage. Any level.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-500 bg-black text-3xl font-black text-yellow-500">
                2
              </div>
              <h3 className="mb-3 text-xl font-bold uppercase">Get Your Sequence Score</h3>
              <p className="text-gray-400">
                Instant AI breakdown of your <span className="font-semibold text-yellow-500">Tempo</span> and <span className="font-semibold text-yellow-500">Anchor–Engine–Whip</span> mechanics.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-500 bg-black text-3xl font-black text-yellow-500">
                3
              </div>
              <h3 className="mb-3 text-xl font-bold uppercase">Train & Improve</h3>
              <p className="text-gray-400">
                Follow your personalized drills. Track gains. Build confidence that shows up in games.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-yellow-500 px-8 py-6 text-lg font-bold uppercase text-black hover:bg-yellow-400">
              <Link to="/analyze">
                Analyze My Swing <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Founder Credibility Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div className="order-2 md:order-1">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-500">
                  Built by a Big-League Hitting Coach
                </p>
                <h2 className="mb-6 text-3xl font-black uppercase md:text-4xl">
                  25+ Years of Player Development Excellence
                </h2>
                <div className="space-y-4 text-gray-400">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>Developed MLB All-Stars & First-Round Draft Picks</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>Trusted by top college programs and national teams</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>Pioneered tempo-based swing analysis methodology</span>
                  </div>
                </div>
                <p className="mt-6 text-lg text-gray-300 leading-relaxed">
                  I've spent decades studying what separates good hitters from <span className="font-bold text-yellow-500">elite performers</span>. 
                  The answer isn't more mechanics — it's <span className="font-bold text-yellow-500">better sequencing</span>.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-square rounded-lg border-2 border-yellow-500/30 bg-zinc-900 overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="mb-4 text-6xl font-black text-yellow-500">CR</div>
                    <p className="text-xl font-bold text-white">Coach Rick</p>
                    <p className="text-sm text-gray-400">MLB Hitting Development</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Identity Outcome Section */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-12 text-3xl font-black uppercase md:text-4xl">
              This Isn't Just About <span className="text-yellow-500">Swing Mechanics</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-yellow-500/20 bg-zinc-900 p-6">
                <div className="mb-3 text-4xl">🎯</div>
                <h3 className="mb-2 text-xl font-bold">Earn Your Spot</h3>
                <p className="text-gray-400">Move up in the lineup. Make coaches notice.</p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-zinc-900 p-6">
                <div className="mb-3 text-4xl">📈</div>
                <h3 className="mb-2 text-xl font-bold">Get Recruited</h3>
                <p className="text-gray-400">Stand out with measurable, verified gains.</p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-zinc-900 p-6">
                <div className="mb-3 text-4xl">💪</div>
                <h3 className="mb-2 text-xl font-bold">Build Unshakeable Confidence</h3>
                <p className="text-gray-400">Step in the box knowing your swing is elite.</p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-zinc-900 p-6">
                <div className="mb-3 text-4xl">🔥</div>
                <h3 className="mb-2 text-xl font-bold">Leave Last Year Behind</h3>
                <p className="text-gray-400">Become the version of yourself you know is possible.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black uppercase md:text-4xl">
            Trusted by Players on the Path to the Big Leagues
          </h2>
          <div className="mb-12 flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <span className="text-lg font-semibold">MLB</span>
            <span className="text-2xl">•</span>
            <span className="text-lg font-semibold">D1 Baseball</span>
            <span className="text-2xl">•</span>
            <span className="text-lg font-semibold">Team USA</span>
            <span className="text-2xl">•</span>
            <span className="text-lg font-semibold">ABCA</span>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6">
              <p className="mb-4 text-lg italic text-gray-300">
                "I didn't think my timing could improve that fast."
              </p>
              <p className="text-sm text-gray-400">
                — HS Sophomore, +5 MPH EV in 3 weeks
              </p>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6">
              <p className="mb-4 text-lg italic text-gray-300">
                "My son finally gets his swing."
              </p>
              <p className="text-sm text-gray-400">
                — Parent of 13U standout
              </p>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6">
              <p className="mb-4 text-lg italic text-gray-300">
                "The tempo breakdown changed everything."
              </p>
              <p className="text-sm text-gray-400">
                — College Freshman, .340 BA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Stack - Training Tiers Section */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black uppercase md:text-5xl">
              Choose Your <span className="text-yellow-500">Path to Elite Timing</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From free diagnostic to full transformation — the right program for your goals.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {/* Tier 1 - Tempo Score Starter */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all relative">
              <CardHeader>
                <CardTitle className="text-xl font-black uppercase">Tempo Score Starter</CardTitle>
                <CardDescription className="text-gray-400">See what's holding you back</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-300">Instant Tempo Score</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-300">Timing diagnosis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-300">Basic Anchor–Engine–Whip breakdown</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold uppercase">
                  <Link to="/analyze">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tier 2 - 7-Day Timing Challenge */}
            <Card className="border-yellow-500 bg-zinc-900 text-white hover:border-yellow-400 transition-all relative scale-105 shadow-2xl shadow-yellow-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase">
                🔥 Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-black uppercase">7-Day Timing Challenge</CardTitle>
                <CardDescription className="text-gray-400">Prove it works in one week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">✓</span>
                    <span className="text-gray-300">Daily drills + messaging support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">✓</span>
                    <span className="text-gray-300 font-bold">+3–5 MPH EV win week 1</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-black uppercase">
                  <Link to="/programs">Join Challenge</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tier 3 - DIY Player Platform */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-black uppercase">DIY Player Platform</CardTitle>
                <CardDescription className="text-gray-400">Independent training toolkit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-300">Monthly video reviews</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-300">Full drill library + AI feedback</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                  <Link to="/programs">Unlock Platform</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tier 4 - Elite 90-Day Transformation */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-black uppercase">Elite 90-Day Transformation</CardTitle>
                <CardDescription className="text-gray-400">Done-with-you coaching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">✓</span>
                    <span className="text-gray-300">Weekly 1:1 access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">✓</span>
                    <span className="text-gray-300 font-bold">Guaranteed results</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                  <Link to="/programs">Apply for Elite</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-zinc-950 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-black uppercase leading-tight md:text-5xl lg:text-6xl">
            Ready to Play with<br />
            <span className="text-yellow-500">Game-Breaking Confidence?</span>
          </h2>
          <p className="mb-8 text-lg md:text-xl text-gray-400">
            Join athletes who are unlocking their real power — and forcing coaches to take notice.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Button asChild size="lg" className="bg-yellow-500 px-8 md:px-10 py-5 md:py-6 text-lg md:text-xl font-bold uppercase text-black hover:bg-yellow-400">
              <Link to="/analyze">
                Analyze My Swing <ChevronRight className="ml-2 h-5 md:h-6 w-5 md:w-6" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 md:px-10 py-5 md:py-6 text-lg md:text-xl font-bold uppercase border-white/20 text-white hover:bg-white/10">
              <Link to="/analyze">
                Start Free
              </Link>
            </Button>
          </div>
          <p className="text-sm md:text-base text-gray-400 italic">
            Still wondering if this works?<br />
            Upload your swing — and you'll know in 60 seconds.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <img 
              src={hitsLogo} 
              alt="H.I.T.S." 
              className="h-8 w-auto"
            />
            <p className="text-sm text-gray-500">
              &copy; 2025 H.I.T.S. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
