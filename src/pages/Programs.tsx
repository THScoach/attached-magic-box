// TODO: Replace placeholder GoHighLevel and Coachly URLs once finalized.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { HitsLogo } from "@/components/HitsLogo";
import appDashboardMockup from "@/assets/app-dashboard-mockup.jpg";
import swingTempoAnalysis from "@/assets/swing-tempo-analysis.jpg";
import coachAthleteTraining from "@/assets/coach-athlete-training.jpg";

export default function Programs() {
  const navigate = useNavigate();
  
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black to-zinc-900 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The 4B System
          </h1>
          <p className="text-2xl text-gray-300 mb-8 font-bold">
            Brain. Body. Bat. Ball.
          </p>
          <p className="text-xl text-gray-400 mb-12">
            We don't just film swings. We measure how your Brain, Body, Bat, and Ball work together to create elite hitting performance.
          </p>
          
          {/* Coach Rick Quote */}
          <div className="bg-zinc-950 border-l-4 border-primary p-8 rounded-lg max-w-3xl mx-auto">
            <p className="text-xl text-gray-200 italic mb-4">
              "Every player I train follows the same 4B process — Brain, Body, Bat, and Ball. That's how we make progress measurable."
            </p>
            <p className="text-primary font-bold">— Coach Rick</p>
          </div>
        </div>
      </section>

      {/* Video Background Placeholder - TODO: Replace with actual video loop */}
      <section className="relative h-96 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80 z-10" />
        {/* Placeholder for background video - will be replaced with actual training footage */}
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <div className="text-center z-20">
            <p className="text-primary text-sm font-bold mb-2">Coming Soon</p>
            <p className="text-white/60 text-xs">Background Training Video Loop</p>
          </div>
        </div>
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center max-w-3xl px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Train Like a Pro. Measure Like Science.
            </h2>
            <p className="text-xl text-gray-300">
              Choose your path to elite hitting performance
            </p>
          </div>
        </div>
      </section>

      {/* 4B Philosophy Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            The Four Pillars of Elite Hitting
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="bg-zinc-900 border-blue-500/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-black text-blue-500">Brain</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300">
                  Tempo, timing, and cognitive processing. We measure your decision speed and reaction time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-green-500/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-black text-green-500">Body</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300">
                  Sequencing, power, and movement quality. How your body chains together from the ground up.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-red-500/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-black text-red-500">Bat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300">
                  Speed, path, and swing mechanics. We track bat speed, plane, and barrel control.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-orange-500/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-black text-orange-500">Ball</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300">
                  Exit velocity, launch angle, and contact quality. The results of everything working together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Section 1: App Dashboard - Image Right */}
      <section className="py-20 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Track Every Metric That Matters
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                The 4B App gives you real-time insights into your swing. See your tempo scores, kinetic sequence efficiency, and contact quality—all in one dashboard.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Brain Metrics</h3>
                    <p className="text-gray-400">Decision speed, timing patterns, and cognitive load analysis</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Body Metrics</h3>
                    <p className="text-gray-400">Sequencing efficiency, power distribution, movement quality</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Bat & Ball Metrics</h3>
                    <p className="text-gray-400">Bat speed, path efficiency, exit velocity, launch angle</p>
                  </div>
                </li>
              </ul>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => navigate('/4b-app')}
              >
                Explore the 4B App
              </Button>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-orange-500/20 blur-3xl" />
              <img 
                src={appDashboardMockup} 
                alt="4B App Dashboard showing tempo analysis and metrics"
                className="relative rounded-lg shadow-2xl border border-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Swing Analysis - Image Left */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-primary/20 blur-3xl" />
              <img 
                src={swingTempoAnalysis} 
                alt="Swing tempo analysis with kinetic chain overlay"
                className="relative rounded-lg shadow-2xl border border-primary/20"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                See Your Kinetic Chain in Action
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Advanced motion analysis shows exactly how energy flows from your legs through your core to the bat. Fix inefficiencies before they become habits.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Load:Fire Ratio Analysis</h3>
                    <p className="text-gray-400">Measure your timing pattern against elite standards (3:1 optimal)</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Sequence Efficiency Score</h3>
                    <p className="text-gray-400">See how well your legs, core, and arms coordinate for maximum power</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Frame-by-Frame Breakdown</h3>
                    <p className="text-gray-400">Understand every phase of your swing with precision feedback</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Personal Coaching - Image Right */}
      <section className="py-20 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Coached by a Pro. Built on Science.
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Coach Rick brings over 15 years of professional hitting instruction and works with athletes from Little League to the MLB. Every program is personalized to your data.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Direct Feedback</h3>
                    <p className="text-gray-400">Get personalized notes on every swing you submit</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Custom Drill Plans</h3>
                    <p className="text-gray-400">Receive drill recommendations based on your specific metrics</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Weekly Progress Reviews</h3>
                    <p className="text-gray-400">Track improvement over time with detailed trend analysis</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-orange-500/20 blur-3xl" />
              <img 
                src={coachAthleteTraining} 
                alt="Coach instructing athlete with data analysis"
                className="relative rounded-lg shadow-2xl border border-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-black border-t border-primary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Every training program we offer is built on this foundation. Whether you train in-person or remotely, 
              you'll develop all four pillars in a systematic, measurable way.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-12 py-8 text-xl font-bold"
                onClick={() => navigate('/train-in-person')}
              >
                Train In-Person
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-black px-12 py-8 text-xl font-bold"
                onClick={() => navigate('/remote-training')}
              >
                Train Remotely
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-zinc-950 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-bold mb-4">The Hitting Skool</h3>
              <p className="text-sm text-gray-400 mb-3">
                Professional hitting instruction powered by tempo-based swing science
              </p>
              <p className="text-xs text-gray-500 italic">
                All programs managed through GoHighLevel and Coachly platforms.
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
                <Link to="/remote-training" className="block text-gray-400 hover:text-white transition-colors">
                  Remote Training
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
