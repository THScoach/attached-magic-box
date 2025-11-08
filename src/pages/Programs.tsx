import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload, Video, Calendar, Trophy, CheckCircle2 } from "lucide-react";
import { HitsLogo } from "@/components/HitsLogo";

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
              <Link to="/train-in-person">Train In-Person</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/#system">How It Works</Link>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,192,192,0.08)_0%,transparent_70%)]" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-6xl">
              Training Programs
            </h1>
            <p className="text-xl text-gray-300">
              Choose the path that fits your goals — from free tempo assessments to elite remote coaching
            </p>
          </div>

          {/* Remote Programs Section */}
          <div className="max-w-6xl mx-auto mb-20">
            <h2 className="text-3xl font-black uppercase mb-8 text-center">Remote Training</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Tempo Assessment */}
              <Card className="bg-black border-white/20 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Free Tempo Assessment</CardTitle>
                  <CardDescription className="text-gray-400">
                    Get started with the basics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-black text-primary">FREE</div>
                  
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Upload 1 swing video</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Instant Tempo Score analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>1-2 key mechanical insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>See what our system can do</span>
                    </li>
                  </ul>

                  <Button asChild className="w-full bg-primary hover:bg-primary/90 font-bold">
                    <Link to="/free-tempo-assessment">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* DIY Membership */}
              <Card className="bg-black border-primary/50 hover:border-primary transition-all relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase">
                  Popular
                </div>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">DIY Membership</CardTitle>
                  <CardDescription className="text-gray-400">
                    Self-guided training with AI tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-black text-primary">$49.97</div>
                    <div className="text-sm text-gray-400">per month</div>
                  </div>
                  
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Unlimited swing uploads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Full HITS analysis (Anchor, Engine, Whip)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>AI-powered drill recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Progress tracking dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Video comparison tools</span>
                    </li>
                  </ul>

                  <Button asChild className="w-full bg-primary hover:bg-primary/90 font-bold">
                    <Link to="/auth">Start DIY Training</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Elite Coaching */}
              <Card className="bg-gradient-to-br from-primary/10 to-black border-primary/30 hover:border-primary transition-all">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Elite Coaching</CardTitle>
                  <CardDescription className="text-gray-400">
                    Direct coaching from Coach Rick
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-black text-primary">$297</div>
                    <div className="text-sm text-gray-400">per month</div>
                  </div>
                  
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Everything in DIY</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Personal video reviews from Coach Rick</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Custom drill programming</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Weekly 1-on-1 check-ins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Priority support access</span>
                    </li>
                  </ul>

                  <Button asChild className="w-full bg-primary hover:bg-primary/90 font-bold">
                    <Link to="/auth">Get Elite Coaching</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* In-Person Training CTA */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-zinc-950 border-white/20">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-black uppercase mb-4">In-Person Training</h2>
                <p className="text-lg text-gray-300 mb-6">
                  Train live with Coach Rick at select locations. Private lessons, small groups, and clinics available.
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold">
                  <Link to="/train-in-person">View In-Person Options</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-zinc-950 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-bold mb-4">The Hitting Skool</h3>
              <p className="text-sm text-gray-400">
                Professional hitting instruction powered by tempo-based swing science
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to="/" className="block text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
                <Link to="/programs" className="block text-gray-400 hover:text-white transition-colors">
                  Programs
                </Link>
                <Link to="/train-in-person" className="block text-gray-400 hover:text-white transition-colors">
                  Train In-Person
                </Link>
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <div className="space-y-2 text-sm">
                <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} The Hitting Skool. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
