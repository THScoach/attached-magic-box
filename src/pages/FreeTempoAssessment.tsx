import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Upload, LineChart, Target } from "lucide-react";
import { HitsLogo } from "@/components/HitsLogo";
import { GHLTempoFormPlaceholder } from "@/components/GHLTempoFormPlaceholder";

export default function FreeTempoAssessment() {
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
              <Link to="/programs">Programs</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/train-in-person">Train In-Person</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link to="/auth">App Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Direct Promise */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,192,192,0.08)_0%,transparent_70%)]" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-block bg-primary text-black px-6 py-2 rounded-full text-sm font-black uppercase mb-6">
              100% Free • No Credit Card
            </div>
            <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-6xl">
              Get Your Tempo Score<br />
              In 48 Hours
            </h1>
            <p className="text-2xl font-bold text-gray-200">
              Upload one swing. Get your Load:Fire ratio. See exactly what's holding you back.
            </p>
          </div>
        </div>
      </section>

      {/* What You'll Get - Value Stack */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black uppercase mb-8 text-center">Here's What You Get (FREE)</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Your Tempo Score</h3>
                <p className="text-gray-400 text-sm">
                  Exact Load:Fire ratio vs. MLB standards
                </p>
                <p className="text-xs text-primary mt-2">Value: $150</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <LineChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Video Breakdown</h3>
                <p className="text-gray-400 text-sm">
                  Frame-by-frame sequence analysis
                </p>
                <p className="text-xs text-primary mt-2">Value: $200</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">2 Key Fixes</h3>
                <p className="text-gray-400 text-sm">
                  Specific actions to improve contact
                </p>
                <p className="text-xs text-primary mt-2">Value: $300</p>
              </div>
            </div>

            <div className="bg-black border border-white/20 rounded-lg p-6 text-center max-w-md mx-auto">
              <p className="text-gray-400 mb-2">Total Value: <span className="line-through">$650</span></p>
              <p className="text-5xl font-black text-primary">FREE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black uppercase mb-4">Get Started Now</h2>
              <p className="text-lg text-gray-300">
                Fill out the form below and we'll send you instructions to upload your swing video
              </p>
            </div>
            
            {/* GHL Form Placeholder */}
            <GHLTempoFormPlaceholder />

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400 mb-6">
                Not ready to sign up yet?{" "}
                <Link to="/programs" className="text-primary hover:underline">
                  Learn more about our programs
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Works - Mechanism */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black uppercase mb-8 text-center">Why Tempo Matters More Than Mechanics</h2>
            
            <div className="space-y-6 text-lg text-gray-300">
              <p>
                <strong className="text-white">Most hitting coaches focus on positions.</strong> Hands here. Elbow there. Back foot like this.
              </p>
              
              <p>
                <strong className="text-white">Elite hitters focus on timing.</strong> They don't just look good in freeze frames—they sequence movements in precise ratios.
              </p>
              
              <p>
                Our tempo analysis reveals if you're loading too fast, firing too slow, or missing the Anchor 6.2 timing point.
              </p>

              <p className="text-xl font-bold text-primary pt-4">
                One number explains why two swings that look similar get completely different results.
              </p>
            </div>

            <div className="bg-black border border-primary/30 rounded-lg p-6 mt-8">
              <h3 className="font-bold text-xl mb-3 text-primary">What Happens Next?</h3>
              <p className="text-sm text-gray-300">
                After your free assessment, you'll get a detailed breakdown with your Tempo Score and recommendations. 
                You can train solo with our DIY program ($49.97/mo), work directly with Coach Rick ($297/mo), 
                or book in-person training if you're local. Zero pressure. Just clear options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Urgency */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block bg-red-500 text-white px-6 py-2 rounded-full text-sm font-black uppercase mb-6">
              ⏰ Only 27 Spots Left This Month
            </div>
            <h2 className="text-3xl font-black uppercase mb-4">Stop Guessing. Start Measuring.</h2>
            <p className="text-lg text-gray-300 mb-8">
              Get your swing analyzed and know exactly where to focus your reps.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold text-lg px-12 py-6">
              <a href="#form">Get Your Free Assessment Now →</a>
            </Button>
            <p className="text-sm text-gray-400 mt-4">Takes 2 minutes. Results in 48 hours.</p>
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
