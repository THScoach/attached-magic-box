// TODO: Replace placeholder Coachly URLs once finalized.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Video, MessageSquare, Target, Calendar } from "lucide-react";
import { HitsLogo } from "@/components/HitsLogo";

export default function RemoteTraining() {
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
              <Link to="/about">Programs</Link>
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
            Remote 4B Training
          </h1>
          <p className="text-2xl text-gray-300 mb-8 font-bold">
            If you can record your swing, I can coach you.
          </p>
          <p className="text-xl text-gray-400">
            Same 4B system. Same feedback. Delivered through Coachly.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How Remote Training Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-black border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">1. Submit Your Swing</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Upload your swing video through Coachly. Any angle, any device.
              </CardContent>
            </Card>

            <Card className="bg-black border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">2. Get Your 4B Report</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Receive a personalized analysis covering Brain, Body, Bat, and Ball.
              </CardContent>
            </Card>

            <Card className="bg-black border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">3. Get Feedback</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Tempo notes, drills, and direct feedback from Coach Rick.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Choose Your Plan</h2>
          <p className="text-center text-gray-400 mb-12">All plans delivered through Coachly + billed via GoHighLevel (Stripe)</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Single Review */}
            <Card className="bg-zinc-900 border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Single Review</CardTitle>
                <div className="text-4xl font-black text-primary">$99</div>
                <p className="text-sm text-gray-400">One-time analysis</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Complete 4B swing breakdown</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Tempo analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Personalized drill recommendations</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => {
                    // Replace with Coachly URL once provided
                    alert('Replace with Coachly single review link');
                  }}
                >
                  Get Single Review
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Plan - Popular */}
            <Card className="bg-zinc-900 border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full">
                <span className="text-sm font-bold text-white">MOST POPULAR</span>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl mb-2">Monthly Plan</CardTitle>
                <div className="text-4xl font-black text-primary">
                  $249<span className="text-lg text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-400">Ongoing coaching</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Unlimited swing submissions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Weekly check-ins with Coach Rick</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Access to Community Zoom calls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Full 4B App access</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => {
                    // Replace with Coachly URL once provided
                    alert('Replace with Coachly monthly plan link');
                  }}
                >
                  Start Monthly Plan
                </Button>
              </CardContent>
            </Card>

            {/* 3-Month Plan - Best Value */}
            <Card className="bg-zinc-900 border-white/20">
              <CardHeader className="text-center">
                <div className="mb-2">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                    BEST VALUE
                  </span>
                </div>
                <CardTitle className="text-2xl mb-2">3-Month Plan</CardTitle>
                <div className="text-4xl font-black text-primary">$699</div>
                <p className="text-sm text-gray-400">Save $48</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Everything in Monthly Plan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Priority response time</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Quarterly progress report</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Guaranteed measurable results</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => {
                    // Replace with Coachly URL once provided
                    alert('Replace with Coachly 3-month plan link');
                  }}
                >
                  Get 3-Month Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-gray-400 text-sm">
            <p>All plans include access to the weekly Community Zoom call (Mondays 7 PM CT)</p>
          </div>
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-black border-primary/50 p-8">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Join the Community
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                All monthly and 3-month plan members get access to our weekly Community Zoom calls every Monday at 7 PM CT.
              </p>
              <p className="text-gray-400 mb-8">
                Live film review, Q&A sessions, and weekly accountability with Coach Rick and other dedicated hitters.
              </p>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-black"
                asChild
              >
                <Link to="/community">Learn More About Community</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of hitters who are training smarter with the 4B System.
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-12 py-8 text-xl font-bold"
            onClick={() => {
              // Replace with Coachly URL once provided
              alert('Replace with Coachly signup link');
            }}
          >
            Start Remote Training Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            All programs managed securely through GoHighLevel and Coachly.
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <Link to="/terms" className="text-gray-400 hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-primary">
              Privacy Policy
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            © 2025 The Hitting Skool. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
