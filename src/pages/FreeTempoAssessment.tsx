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

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,192,192,0.08)_0%,transparent_70%)]" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-6xl">
              Free Tempo Assessment
            </h1>
            <p className="text-xl text-gray-300">
              Get your swing analyzed with our proprietary tempo scoring system. See what elite hitters already know.
            </p>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black uppercase mb-12 text-center">What You'll Get</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Upload Your Swing</h3>
                <p className="text-gray-400 text-sm">
                  Simple video upload from your phone. No special equipment needed.
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <LineChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Instant Tempo Score</h3>
                <p className="text-gray-400 text-sm">
                  Get your Load:Fire ratio and see where you rank against elite standards.
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Key Insights</h3>
                <p className="text-gray-400 text-sm">
                  Receive 1-2 actionable fixes to immediately improve your swing sequence.
                </p>
              </div>
            </div>

            <div className="bg-black border border-white/20 rounded-lg p-8">
              <h3 className="font-bold text-xl mb-6">Your Free Assessment Includes:</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Tempo Score analysis (Load:Fire ratio)</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Comparison to MLB standards</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Primary mechanical breakdown</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Top 2 areas for improvement</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Access to HITS system overview</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Invitation to full training programs</span>
                </div>
              </div>
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

      {/* Why This Works */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black uppercase mb-8 text-center">Why Tempo Matters</h2>
            
            <div className="space-y-6 text-gray-300">
              <p className="text-lg">
                Most hitting instruction focuses on <em>positions</em>. The HITS system focuses on <strong>timing</strong>.
              </p>
              
              <p>
                Elite hitters don't just look good in freeze frames—they sequence their movements in precise time ratios. 
                Our tempo analysis reveals if you're loading too fast, firing too slow, or missing the critical Anchor 6.2 timing point.
              </p>
              
              <p>
                A single tempo metric can explain why two swings that <em>look</em> similar produce completely different results. 
                This free assessment gives you that critical timing insight.
              </p>

              <div className="bg-black border border-primary/30 rounded-lg p-6 mt-8">
                <h3 className="font-bold text-xl mb-3 text-primary">What Happens After?</h3>
                <p className="text-sm text-gray-300">
                  After your free assessment, you'll receive a detailed email breakdown with your Tempo Score and recommendations. 
                  You can choose to continue training with our DIY membership ($49.97/mo), upgrade to Elite coaching with Coach Rick ($297/mo), 
                  or train in-person if you're local. No pressure—just clear options to keep improving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black uppercase mb-4">Ready to See Your Score?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Join hundreds of hitters who've already discovered their tempo baseline
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold text-lg px-8 py-6">
              <a href="#form">Get Your Free Assessment</a>
            </Button>
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
