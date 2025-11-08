// TODO: Replace placeholder GoHighLevel URLs once finalized.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Calendar, Users, Video } from "lucide-react";
import { HitsLogo } from "@/components/HitsLogo";

export default function Community() {
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
            The Hitting Skool Community
          </h1>
          <p className="text-2xl text-gray-300 mb-4 font-bold">
            You're not just buying lessons. You're joining a program.
          </p>
          <p className="text-xl text-gray-400">
            Every Monday at 7:00 PM CT — Live Zoom calls with Coach Rick
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Happens on Community Calls</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-black border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Live Film Review</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Coach Rick breaks down swing videos from community members in real-time.
              </CardContent>
            </Card>

            <Card className="bg-black border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Q&A Sessions</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Ask questions about tempo, mechanics, mental approach, and training plans.
              </CardContent>
            </Card>

            <Card className="bg-black border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Weekly Accountability</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Stay consistent with your training. We review progress and set weekly goals.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Gets Access */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Access Included With All Training Programs
          </h2>

          <Card className="bg-zinc-900 border-primary/50">
            <CardContent className="p-8">
              <p className="text-xl text-gray-300 mb-8 text-center">
                All active THS athletes get access to the weekly Community Call. This includes:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">In-Person Athletes:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>4B Elite Evaluation customers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Pod Program members</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Remote Athletes:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Monthly Remote Training plan</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>3-Month Remote Training plan</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-gray-300">
                  <strong className="text-primary">Note:</strong> Single swing review purchases do not include Community Call access. 
                  To join, upgrade to a monthly or 3-month plan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Join the Community */}
      <section className="py-20 px-4 bg-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Choose any training program to get instant access to our weekly Zoom calls.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
              asChild
            >
              <Link to="/programs">View All Programs</Link>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black"
              onClick={() => {
                // Replace with GHL community form link once provided
                alert('Replace with GoHighLevel community interest form (tag: THS_COMMUNITY)');
              }}
            >
              Request Community Access
            </Button>
          </div>
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
