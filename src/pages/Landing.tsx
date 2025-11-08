import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Anchor, Zap, Settings, ChevronRight, FileText, ArrowRight } from "lucide-react";
import { HitsLogo, HitsMonogram } from "@/components/HitsLogo";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { useState } from "react";
import { toast } from "sonner";

export default function Landing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Please enter your name and email");
      return;
    }
    
    // Store in session storage for after auth
    sessionStorage.setItem('leadCapture', JSON.stringify({ name, email, honeypot }));
    
    // Redirect to auth with return URL
    navigate('/auth?returnTo=/demo-report');
  };
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
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/train-in-person">Train In-Person</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <a href="#system">How It Works</a>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/about">About</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - PROMISE + CTA */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,192,192,0.08)_0%,transparent_70%)]" />
        
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mb-6 text-6xl font-black uppercase leading-tight tracking-tight md:text-7xl lg:text-8xl">
              Simplify the Science.<br />
              Train the Sequence.
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-2xl font-bold text-gray-200 md:text-3xl">
              Remote and in-person hitting development built by a pro coach. Fix your swing tempo and sequence with a clear, measurable system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-8 text-xl font-black uppercase shadow-2xl shadow-primary/50">
                <Link to="/free-tempo-assessment">
                  Start Free Tempo Assessment
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black px-12 py-8 text-xl font-black uppercase">
                <Link to="/train-in-person">
                  Train In-Person
                </Link>
              </Button>
            </div>
            <p className="text-gray-400">No equipment needed. Results in 48 hours.</p>
          </div>
        </div>
      </section>

      {/* PROBLEM Section */}
      <section className="py-24 bg-zinc-950 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-8 text-4xl font-black uppercase md:text-5xl text-red-500">
              Most Hitters Are Guessing Their Mechanics
            </h2>
            <div className="space-y-6 text-xl text-gray-300">
              <p>You take 1,000 swings.</p>
              <p>You watch YouTube videos.</p>
              <p>You copy what "looks good."</p>
              <p className="text-2xl font-bold text-white pt-4">But you don't know if your timing is actually improving.</p>
              <p className="text-gray-400">Without data, you're flying blind. And blind reps don't make you elite.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MECHANISM Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="mb-6 text-4xl font-black uppercase md:text-5xl">
              The Hitting Sequence System
            </h2>
            <p className="text-2xl font-bold text-primary mb-4">
              We measure tempo and sequence so you train with precision, not guesswork.
            </p>
            <p className="text-xl text-gray-300 mb-6">
              No more hoping your swing "feels right." You'll see your Load:Fire ratio, kinetic chain efficiency, and contact quality—the same metrics MLB organizations use.
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Our tempo model is built on the same principles validated in Tour Tempo and independent research showing elite hitters and golfers share consistent load-to-fire rhythm patterns. We apply that science to baseball so your swing timing is trained, not guessed.
            </p>
          </div>
        </div>
      </section>

      {/* PROOF Section */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-black uppercase text-center mb-12">Real Hitters. Real Results.</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="bg-black border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-black text-primary mb-2">2.8→3.1</div>
                  <p className="text-sm text-gray-400">Load:Fire ratio improvement</p>
                  <p className="text-xs text-gray-500 mt-2">High school outfielder, 21 days</p>
                </CardContent>
              </Card>
              
              <Card className="bg-black border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-black text-primary mb-2">+8 MPH</div>
                  <p className="text-sm text-gray-400">Exit velocity increase</p>
                  <p className="text-xs text-gray-500 mt-2">College recruit, 30 days</p>
                </CardContent>
              </Card>
              
              <Card className="bg-black border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-black text-primary mb-2">87%</div>
                  <p className="text-sm text-gray-400">Improved contact consistency</p>
                  <p className="text-xs text-gray-500 mt-2">Travel ball athletes, 6 weeks</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center text-gray-300 mb-8">
              <p className="text-lg font-semibold mb-4">Trusted by:</p>
              <div className="flex flex-wrap justify-center gap-6 text-base">
                <span>Pete Crow-Armstrong</span>
                <span className="text-gray-600">•</span>
                <span>Cedric Mullins</span>
                <span className="text-gray-600">•</span>
                <span>Matt Adams</span>
                <span className="text-gray-600">•</span>
                <span>MLB Organizations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STACK - What You Get */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black uppercase text-center mb-4">Here's Everything You Get</h2>
            <p className="text-center text-xl text-primary font-bold mb-12">In Your Free Tempo Assessment</p>
            
            <div className="bg-zinc-950 border-2 border-primary/30 rounded-lg p-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-lg font-black text-black">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Your Personal Tempo Score</h3>
                    <p className="text-gray-400">See your exact Load:Fire ratio vs. elite standards (Value: $150)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-lg font-black text-black">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Video Breakdown</h3>
                    <p className="text-gray-400">Frame-by-frame analysis of your sequence timing (Value: $200)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-lg font-black text-black">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Top 2 Mechanical Fixes</h3>
                    <p className="text-gray-400">Specific corrections that will improve your contact quality immediately (Value: $300)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-lg font-black text-black">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">48-Hour Turnaround</h3>
                    <p className="text-gray-400">No waiting weeks. You get answers fast. (Priceless)</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 text-center">
                <p className="text-gray-400 mb-2">Total Value: <span className="line-through">$650</span></p>
                <p className="text-5xl font-black text-primary mb-4">FREE</p>
                <p className="text-sm text-gray-500">No credit card. No catch. Just your swing video.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* URGENCY Section */}
      <section className="py-16 bg-zinc-950 border-y-4 border-red-500">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-red-500 text-white px-6 py-2 rounded-full text-sm font-black uppercase mb-6">
              ⏰ Limited Availability
            </div>
            <h2 className="text-3xl font-black uppercase mb-4">
              Only 50 Free Assessments Available This Month
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Coach Rick personally reviews every assessment. When spots are gone, you'll join the waitlist.
            </p>
            <div className="bg-black border border-white/10 rounded-lg p-6 inline-block">
              <p className="text-sm text-gray-400 mb-2">Spots Remaining:</p>
              <p className="text-5xl font-black text-primary">27</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 4B System */}
      <section id="system" className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl mb-12 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              How It Works
            </p>
            <h2 className="mb-6 text-4xl font-black uppercase md:text-5xl">
              The 4B Hitting Intelligence Model
            </h2>
            <p className="text-xl text-gray-300">
              We don't just film swings. We measure how your Brain, Body, Bat, and Ball work together.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 border-2 border-blue-500/30">
                  <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-black uppercase text-blue-500">Brain</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-300 font-semibold mb-2">
                  S2 Cognition-style decision and reaction testing to understand how fast you see the game.
                </p>
                <p className="text-center text-sm text-gray-400">
                  We measure your reads, not just your reps.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/30">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-black uppercase text-green-500">Body</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-300 font-semibold mb-2">
                  Tempo and movement efficiency: how your body sequences.
                </p>
                <p className="text-center text-sm text-gray-400">
                  Video and 3D-style motion analysis to sync your load and launch.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/30">
                  <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-black uppercase text-red-500">Bat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-300 font-semibold mb-2">
                  Bat path, plane, and barrel control.
                </p>
                <p className="text-center text-sm text-gray-400">
                  Sensors and high-speed video to see how the barrel really moves.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 border-2 border-orange-500/30">
                  <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-black uppercase text-orange-500">Ball</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-300 font-semibold mb-2">
                  What the ball tells us: exit velocity, launch, spin, contact quality.
                </p>
                <p className="text-center text-sm text-gray-400">
                  Rapsodo / HitTrax / similar tools to confirm real impact.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-gray-300 font-bold">
              If the Brain, Body, Bat, and Ball agree, your swing plays in games. We build your plan around all four.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different - Results Focus */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl mb-12 text-center">
            <h2 className="mb-6 text-4xl font-black uppercase md:text-5xl">
              Why This Works When Everything Else Doesn't
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <div className="bg-black border border-white/10 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-3 text-primary">❌ Most Coaches</h3>
              <ul className="space-y-2 text-gray-400">
                <li>→ Focus on 30+ mechanical cues</li>
                <li>→ Tell you to "feel" the swing</li>
                <li>→ No measurable progress tracking</li>
                <li>→ Hope you figure it out over time</li>
              </ul>
            </div>

            <div className="bg-black border-2 border-primary rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-3 text-primary">✓ The Hitting Skool 4B System</h3>
              <ul className="space-y-2 text-white font-semibold">
                <li>→ Measure Brain, Body, Bat, Ball</li>
                <li>→ Give you exact frame-by-frame data</li>
                <li>→ Track improvement week over week</li>
                <li>→ Know if it's working in 30 days</li>
              </ul>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <p className="text-xl text-gray-300">
              <strong className="text-white">Bottom line:</strong> If you can't measure it, you can't manage it. 
              We measure your tempo. You manage your reps. Results follow.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-black uppercase text-center mb-12">
              What Hitters Are Saying
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-zinc-950 border-white/10">
                <CardContent className="p-6">
                  <div className="text-primary text-5xl mb-2">"</div>
                  <p className="text-gray-300 mb-4">
                    "I went from 2.2 tempo ratio to 3.4 in three weeks. My exit velo jumped 6 mph. Coach Rick knows what he's talking about."
                  </p>
                  <p className="text-sm text-gray-500">— Jake M., High School SS</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-950 border-white/10">
                <CardContent className="p-6">
                  <div className="text-primary text-5xl mb-2">"</div>
                  <p className="text-gray-300 mb-4">
                    "Finally found a coach who doesn't just say 'swing harder.' The data made everything click. Hit .380 this season."
                  </p>
                  <p className="text-sm text-gray-500">— Marcus T., College Recruit</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-950 border-white/10">
                <CardContent className="p-6">
                  <div className="text-primary text-5xl mb-2">"</div>
                  <p className="text-gray-300 mb-4">
                    "Best investment I made for my son's game. He's hitting balls he used to miss. Real results, not guesswork."
                  </p>
                  <p className="text-sm text-gray-500">— Sarah L., Parent</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-black uppercase">
                <Link to="/free-tempo-assessment">
                  Join Them — Start Free Assessment →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA STRIP */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-black uppercase mb-6">
              Stop Guessing. Start Measuring.
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get your free tempo assessment and see exactly what's holding your swing back.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-8 text-xl font-black uppercase shadow-2xl shadow-primary/50 mb-4">
              <Link to="/free-tempo-assessment">
                Start Free Tempo Assessment Now →
              </Link>
            </Button>
            <p className="text-sm text-gray-400">Upload takes 2 minutes. Results in 48 hours.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4">
          {/* Need Help Section */}
          <div className="mb-12 max-w-2xl mx-auto">
            <Card className="bg-zinc-900 border-white/10 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <CoachRickAvatar size="lg" />
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Need Help Getting Started?
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Coach Rick is here to guide you through your hitting journey
                    </p>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to="/book-call">Talk to Coach Rick</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <HitsMonogram className="h-8 w-8" />
              <div>
                <p className="text-sm text-gray-400">
                  © 2025 The Hitting Skool. All rights reserved.
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  All programs managed through GoHighLevel and Coachly platforms.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <Link to="/auth">App Login</Link>
              </Button>
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <Link to="/coach-auth">Coach Portal</Link>
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
