// TODO: Replace placeholder GoHighLevel and Coachly URLs once finalized.

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Brain, Activity, Target, Zap, Users, Video } from "lucide-react";
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
      <section className="bg-gradient-to-b from-black to-zinc-900 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The 4B Hitting Intelligence System
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            Brain. Body. Bat. Ball.
          </p>
          <p className="text-lg text-gray-400">
            Elite hitters don't just swing harder. They sync better.
          </p>
        </div>
      </section>

      {/* 4B Pillars - Compact */}
      <section className="py-12 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-zinc-900 border border-blue-500/20">
              <Brain className="h-10 w-10 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-blue-500 mb-1">Brain</h3>
              <p className="text-gray-400 text-xs">Tempo & timing</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-zinc-900 border border-green-500/20">
              <Activity className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-green-500 mb-1">Body</h3>
              <p className="text-gray-400 text-xs">Sequencing & power</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-zinc-900 border border-red-500/20">
              <Target className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-red-500 mb-1">Bat</h3>
              <p className="text-gray-400 text-xs">Speed & mechanics</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-zinc-900 border border-orange-500/20">
              <Zap className="h-10 w-10 text-orange-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-orange-500 mb-1">Ball</h3>
              <p className="text-gray-400 text-xs">Exit velo & launch</p>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Training Path - MAIN CTA */}
      <section className="py-16 px-4 bg-zinc-950">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Choose Your Training Path
            </h2>
            <p className="text-xl text-gray-300">
              Same 4B system. Same science. Two ways to train.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* In-Person Training */}
            <Card className="bg-zinc-900 border-2 border-primary/50 hover:border-primary transition-all p-8">
              <CardContent className="space-y-6 p-0">
                <div className="text-center">
                  <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Train In-Person</h3>
                  <p className="text-gray-300 text-lg mb-6">
                    At The Hitting Skool Lab in Fenton, Missouri
                  </p>
                </div>

                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>4B Elite Swing Evaluation ($299)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>12-Week Pod Program ($900)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Professional-grade tech & equipment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Direct coaching with Coach Rick</span>
                  </li>
                </ul>

                <Button 
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                  asChild
                >
                  <Link to="/train-in-person">View In-Person Training</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Remote Training */}
            <Card className="bg-zinc-900 border-2 border-white/20 hover:border-primary/50 transition-all p-8">
              <CardContent className="space-y-6 p-0">
                <div className="text-center">
                  <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Train Remotely</h3>
                  <p className="text-gray-300 text-lg mb-6">
                    If you can record your swing, I can coach you
                  </p>
                </div>

                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Single Review ($99)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Monthly Plan ($249/mo)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>3-Month Plan ($699 - Best Value)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Weekly Community Zoom calls included</span>
                  </li>
                </ul>

                <Button 
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                  asChild
                >
                  <Link to="/remote-training">View Remote Training</Link>
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
                  In-Person Training
                </Link>
                <Link to="/remote-training" className="block text-gray-400 hover:text-white transition-colors">
                  Remote Training
                </Link>
                <Link to="/4b-app" className="block text-gray-400 hover:text-white transition-colors">
                  4B App
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <div className="text-sm text-gray-400 space-y-2">
                <p>2013 Hitzert Court</p>
                <p>Fenton, Missouri 63026</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>© 2025 The Hitting Skool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
