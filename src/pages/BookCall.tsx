import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Check, ArrowLeft, Calendar } from "lucide-react";
import { HitsLogo, HitsMonogram } from "@/components/HitsLogo";

export default function BookCall() {
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
              <Link to="/programs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Programs
              </Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link to="/auth">
                <HitsMonogram className="h-6 w-6 mr-2" />
                App Login
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="text-sm font-bold uppercase text-primary">Elite 90-Day Transformation</span>
          </div>
          <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-6xl">
            Schedule Your<br />
            Consultation Call
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Let's discuss your goals and see if the Elite program is right for you
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Program Details Column */}
            <div>
              <h2 className="text-3xl font-black uppercase mb-8">
                Elite Program Overview
              </h2>

              <Card className="border-primary/30 bg-gradient-to-br from-zinc-900 to-zinc-950 mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl font-black uppercase">What's Included</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Weekly 1-on-1 Video Reviews</p>
                      <p className="text-sm text-gray-400">Direct feedback from Coach Rick on your swing progression</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Custom 90-Day Periodization Plan</p>
                      <p className="text-sm text-gray-400">Structured training program designed specifically for you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Priority Support Access</p>
                      <p className="text-sm text-gray-400">24-hour response time for all questions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Bi-Weekly Check-Ins</p>
                      <p className="text-sm text-gray-400">Regular progress assessments and plan adjustments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Unlimited Swing Analysis</p>
                      <p className="text-sm text-gray-400">Full access to the HITS platform throughout your program</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-lg border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 mb-8">
                <h3 className="text-2xl font-black text-primary mb-3">
                  Performance Guarantee
                </h3>
                <p className="text-white text-lg font-bold mb-2">
                  +5 MPH Exit Velocity or Full Refund
                </p>
                <p className="text-gray-300 text-sm">
                  Complete the full 90-day program and follow the training protocol. If you don't gain at least 5 MPH on your exit velocity, we'll refund your entire investment.
                </p>
              </div>

              <div className="space-y-4 text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-white">Investment:</strong> $2,497 (payment plans available)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-white">Availability:</strong> Limited to 15 athletes per quarter</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-white">Requirements:</strong> Must be able to train 4-5x per week</span>
                </p>
              </div>
            </div>

            {/* Booking Column */}
            <div>
              <Card className="border-white/20 bg-zinc-900 sticky top-24">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-black uppercase mb-2">
                    Book Your Call
                  </CardTitle>
                  <p className="text-gray-400">
                    30-minute consultation to discuss your goals and the Elite program
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="aspect-video rounded-lg border-2 border-white/10 bg-zinc-800 overflow-hidden flex items-center justify-center">
                      <div className="text-center p-8">
                        <p className="text-lg font-bold text-gray-400 mb-2">Cal.com / Calendly Embed</p>
                        <p className="text-sm text-gray-500">Booking widget will be embedded here</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-zinc-800 border border-white/10">
                      <h4 className="font-bold text-white mb-3">What to Expect on the Call:</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">1.</span>
                          <span>Review your current hitting situation and goals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">2.</span>
                          <span>Discuss your training availability and commitment level</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">3.</span>
                          <span>Walk through the Elite program structure and timeline</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">4.</span>
                          <span>Determine if you're a good fit for the program</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">5.</span>
                          <span>Answer all your questions about the guarantee and process</span>
                        </li>
                      </ul>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        No pressure, no obligation. This call is to ensure we're the right fit for your goals.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400 mb-2">
                  Not ready to book yet?
                </p>
                <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Link to="/programs">Learn More About Our Programs</Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <HitsMonogram className="h-8 w-8" />
              <p className="text-sm text-gray-400">
                © 2025 The Hitting Skool. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <Link to="/auth">App Login</Link>
              </Button>
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <a href="mailto:support@thehittingskool.com">Support</a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
