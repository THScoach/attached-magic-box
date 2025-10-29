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
              Tempo Never Lies
            </p>
            <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-7xl lg:text-8xl">
              Train Your Sequence.<br />
              Fix Your Timing.<br />
              <span className="text-yellow-500">Become the Hitter<br />Pitchers Hate Seeing.</span>
            </h1>
            <p className="mb-4 max-w-2xl text-lg text-gray-300 md:text-xl">
              Big-league biomechanics — simplified.<br />
              Unlock more barrels, higher exit speed, and game-ready confidence through the <span className="font-bold text-yellow-500">Anchor → Engine → Whip</span> system.
            </p>
            <div className="mb-8 flex flex-wrap gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">Built by an MLB Hitting Coach</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">Trusted by Top College & HS Recruits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">+3–7 MPH Exit Velo in 30–60 Days</span>
              </div>
            </div>
            <Button asChild size="lg" className="bg-yellow-500 px-8 py-6 text-lg font-bold uppercase text-black hover:bg-yellow-400">
              <a href="https://whop.com/the-hitting-skool/297-b6/" target="_blank" rel="noopener noreferrer">
                Show Me My Tempo <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <p className="mt-3 text-sm text-gray-400">
              Your swing → Instant Tempo Score → First drill
            </p>
            <p className="mt-6 text-xs text-gray-500">
              No sensors. Just your swing. Your phone. Your breakthrough.
            </p>
            
            {/* Social Proof Bar */}
            <div className="mt-12 space-y-4 rounded-lg border border-yellow-500/20 bg-zinc-900/50 p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="mb-1 text-2xl font-black text-yellow-500">2,000+</div>
                  <div className="text-xs text-gray-400 uppercase">Video Analyses Delivered</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-2xl font-black text-yellow-500">+4.8 MPH</div>
                  <div className="text-xs text-gray-400 uppercase">Avg Exit Velo Gain (45 Days)</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-2xl font-black text-yellow-500">MLB</div>
                  <div className="text-xs text-gray-400 uppercase">Players & D1 Recruits</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-2xl font-black text-yellow-500">ABCA</div>
                  <div className="text-xs text-gray-400 uppercase">Featured Network</div>
                </div>
              </div>
              <div className="mt-6 border-t border-yellow-500/20 pt-4">
                <p className="text-center text-sm italic text-gray-300">
                  "Coach Rick unlocked timing I never knew I had."
                </p>
                <p className="mt-2 text-center text-xs text-gray-500">
                  — 2025 D1 Commit, +6 MPH EV
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="bg-zinc-900 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="relative aspect-video rounded-lg border-2 border-yellow-500/30 bg-black/50 overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Zap className="mb-4 h-16 w-16 text-yellow-500" />
                <p className="text-lg font-bold text-gray-300 uppercase">45-Second Swing Analysis Demo</p>
                <p className="mt-2 text-sm text-gray-400">See how the system works</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Mechanism Section */}
      <section className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-black uppercase md:text-5xl">
              The <span className="text-yellow-500">Tempo-Based</span> Training System
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <p className="text-xl text-gray-300 md:text-2xl font-semibold">
              Most hitters chase mechanics and lose timing.<br />
              Your swing isn't broken — it's <span className="text-yellow-500">mistimed</span>.
            </p>
            <p className="text-lg text-gray-300">
              <span className="font-bold text-yellow-500">MLB-tested system. Game-changing results.</span><br />
              Designed for the hitter you're becoming.
            </p>
            <p className="text-lg text-gray-400">
              Our system measures what actually creates power:
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 py-8">
              <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6">
                <p className="text-lg font-bold text-yellow-500">Tempo</p>
                <p className="text-sm text-gray-400">Load → Fire ratio</p>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6">
                <p className="text-lg font-bold text-yellow-500">Rear Anchor</p>
                <p className="text-sm text-gray-400">Stability</p>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6">
                <p className="text-lg font-bold text-yellow-500">Engine</p>
                <p className="text-sm text-gray-400">Coil & posture strength</p>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-zinc-900 p-6">
                <p className="text-lg font-bold text-yellow-500">Whip & Lag</p>
                <p className="text-sm text-gray-400">Release</p>
              </div>
            </div>
            <p className="text-lg text-gray-300">
              If the sequence flows…<br />
              the barrel flies.
            </p>
            <blockquote className="border-l-4 border-yellow-500 pl-6 text-xl italic text-yellow-500 md:text-2xl">
              Sequence beats style.<br />
              Every. Single. Time.
            </blockquote>
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
              <a href="https://whop.com/the-hitting-skool/297-b6/" target="_blank" rel="noopener noreferrer">
                Analyze My Swing <ChevronRight className="ml-2 h-5 w-5" />
              </a>
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

      {/* Pricing Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black uppercase md:text-5xl">
              Choose Your Path to <span className="text-yellow-500">Better Sequencing</span>
            </h2>
            <p className="text-xl text-gray-400">
              Whether you're just starting or chasing scholarships —<br />
              we train your swing like a pro.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {/* Free Tier */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">Tempo Score Starter</CardTitle>
                <CardDescription className="text-gray-400">Get your Swing Identity Profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-green-500">$0</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Instant Tempo Score</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Basic swing breakdown</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Access to drill library</span>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                  <a href="https://whop.com/the-hitting-skool/hits-free/" target="_blank" rel="noopener noreferrer">
                    Start Free
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* 7-Day Challenge */}
            <Card className="border-yellow-500/50 bg-zinc-900 text-white hover:border-yellow-500 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">The 7-Day Timing Challenge</CardTitle>
                <CardDescription className="text-gray-400">Beat your pitcher's timing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-yellow-500">$7</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    +3–5 MPH contact improvement in one week
                  </p>
                </div>
                <Button asChild className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold uppercase">
                  <a href="https://whop.com/the-hitting-skool/297-b6/" target="_blank" rel="noopener noreferrer">
                    Start Challenge
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* DIY Platform */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">DIY Player Platform</CardTitle>
                <CardDescription className="text-gray-400">Self-guided training — pro-level tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">$97</span>
                    <span className="text-gray-400">/mo</span>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>2 Video Reviews / month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Drill Library + AI feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Tempo Tracker app access</span>
                    </li>
                  </ul>
                </div>
                <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                  <a href="https://whop.com/the-hitting-skool/hits-diy-platform/" target="_blank" rel="noopener noreferrer">
                    Get Started
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Elite 90-Day */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">Elite 90-Day Transformation</CardTitle>
                <CardDescription className="text-gray-400">Become the #1 hitter on your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">$297</span>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Weekly breakdowns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Custom plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Guaranteed performance upgrade</span>
                    </li>
                  </ul>
                  <p className="text-xs italic text-yellow-500 pt-2">
                    If we don't improve your timing and contact quality, you don't pay.
                  </p>
                </div>
                <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                  <a href="https://whop.com/the-hitting-skool/elite-90-day-transformation/" target="_blank" rel="noopener noreferrer">
                    Go Elite
                  </a>
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
              <a href="https://whop.com/the-hitting-skool/297-b6/" target="_blank" rel="noopener noreferrer">
                Analyze My Swing <ChevronRight className="ml-2 h-5 md:h-6 w-5 md:w-6" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 md:px-10 py-5 md:py-6 text-lg md:text-xl font-bold uppercase border-white/20 text-white hover:bg-white/10">
              <a href="https://whop.com/the-hitting-skool/hits-free/" target="_blank" rel="noopener noreferrer">
                Start Free
              </a>
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
