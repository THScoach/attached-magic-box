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
              BIOHACK YOUR SWING MECHANICS
            </p>
            <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-7xl lg:text-8xl">
              The Hitting<br />
              <span className="text-yellow-500">Intelligence</span><br />
              Training System
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-gray-400 md:text-xl">
              AI-powered swing analysis. Personalized training programs. 
              Track your progress from amateur to elite.
            </p>
            <Button asChild size="lg" className="bg-yellow-500 px-8 py-6 text-lg font-bold uppercase text-black hover:bg-yellow-400">
              <a href="https://whop.com/the-hitting-skool/297-b6/" target="_blank" rel="noopener noreferrer">
                Get Started <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black uppercase md:text-5xl">
              Your Personal Trainer For <span className="text-yellow-500">Hitting Excellence</span>
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-lg border border-white/10 bg-zinc-900 p-8 transition-all hover:border-yellow-500/50">
              <Video className="mb-4 h-12 w-12 text-yellow-500" />
              <h3 className="mb-3 text-xl font-bold uppercase">AI Video Analysis</h3>
              <p className="text-gray-400">
                Upload your swing and receive instant biomechanical analysis across Anchor, Engine, and Whip metrics.
              </p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-zinc-900 p-8 transition-all hover:border-yellow-500/50">
              <Target className="mb-4 h-12 w-12 text-yellow-500" />
              <h3 className="mb-3 text-xl font-bold uppercase">Dynamic Training Programs</h3>
              <p className="text-gray-400">
                Customized programs that adapt to your progress. Powered by proven coaching methodologies.
              </p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-zinc-900 p-8 transition-all hover:border-yellow-500/50">
              <TrendingUp className="mb-4 h-12 w-12 text-yellow-500" />
              <h3 className="mb-3 text-xl font-bold uppercase">Track & Share Metrics</h3>
              <p className="text-gray-400">
                Monitor key performance indicators. Track progress over time. Share your gains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
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
                Capture your swing from the proper angle using your mobile device
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-500 bg-black text-3xl font-black text-yellow-500">
                2
              </div>
              <h3 className="mb-3 text-xl font-bold uppercase">Get AI Analysis</h3>
              <p className="text-gray-400">
                Receive instant biomechanical breakdown of your Anchor, Engine, and Whip
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-500 bg-black text-3xl font-black text-yellow-500">
                3
              </div>
              <h3 className="mb-3 text-xl font-bold uppercase">Train & Improve</h3>
              <p className="text-gray-400">
                Follow your dynamic program and track measurable improvements
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
              Choose Your <span className="text-yellow-500">Training Path</span>
            </h2>
            <p className="text-xl text-gray-400">
              Select the program that fits your goals
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {/* Free Tier */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">Free</CardTitle>
                <CardDescription className="text-gray-400">Get started with basics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">$0</span>
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
                Popular
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">7-Day Challenge</CardTitle>
                <CardDescription className="text-gray-400">Quick start intensive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-yellow-500">$7</span>
                  </div>
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
                <CardTitle className="text-2xl font-black uppercase">DIY Platform</CardTitle>
                <CardDescription className="text-gray-400">Self-guided training</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">$97</span>
                    <span className="text-gray-400">/mo</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                  <a href="https://whop.com/the-hitting-skool/hits-diy-platform/" target="_blank" rel="noopener noreferrer">
                    Go DIY
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Elite 90-Day */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">Elite 90-Day</CardTitle>
                <CardDescription className="text-gray-400">Complete transformation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">$297</span>
                  </div>
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
      <section className="relative overflow-hidden bg-zinc-950 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-black uppercase leading-tight md:text-6xl">
            Ready to Unlock<br />
            <span className="text-yellow-500">Your Full Potential?</span>
          </h2>
          <p className="mb-10 text-xl text-gray-400">
            Join elite athletes who are already transforming their game
          </p>
          <Button asChild size="lg" className="bg-yellow-500 px-10 py-6 text-xl font-bold uppercase text-black hover:bg-yellow-400">
            <a href="https://whop.com/the-hitting-skool/297-b6/" target="_blank" rel="noopener noreferrer">
              Start Training Now <ChevronRight className="ml-2 h-6 w-6" />
            </a>
          </Button>
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
