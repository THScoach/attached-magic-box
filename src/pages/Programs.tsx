import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { ChevronRight, Check } from "lucide-react";
import hitsLogo from "@/assets/hits-logo-minimal.png";

export default function Programs() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/">
            <img 
              src={hitsLogo} 
              alt="H.I.T.S." 
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-white hover:text-yellow-500">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-yellow-500">
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_65%)]" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Choose the Path That<br />
            <span className="text-yellow-500">Fits Your Goals</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            From free analysis to elite 1-on-1 coaching — find the right level for where you are and where you want to be.
          </p>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {/* Tier 1 - FREE */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all relative">
              <CardHeader>
                <div className="mb-2">
                  <span className="text-4xl font-black text-green-500">FREE</span>
                </div>
                <CardTitle className="text-xl font-black uppercase">Tempo Score Starter</CardTitle>
                <CardDescription className="text-gray-400">See what's holding you back</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Instant Tempo Score (2.0:1 vs 1.5:1)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Basic Anchor-Engine-Whip breakdown</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Access to drill library</span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500 font-semibold">VALUE: $47</p>
                    <p className="text-xl font-black text-green-500">TODAY: $0</p>
                  </div>
                </div>
                <Button asChild className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold uppercase">
                  <Link to="/analyze">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tier 2 - 7-Day Challenge */}
            <Card className="border-yellow-500 bg-zinc-900 text-white hover:border-yellow-400 transition-all relative scale-105 shadow-2xl shadow-yellow-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase">
                🔥 Best Value
              </div>
              <CardHeader>
                <div className="mb-2">
                  <span className="text-4xl font-black text-yellow-500">$7</span>
                </div>
                <CardTitle className="text-xl font-black uppercase">7-Day Timing Challenge</CardTitle>
                <CardDescription className="text-gray-400">Prove it works in one week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300 font-semibold">Daily video analysis + feedback</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Personalized 7-day drill progression</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Coach Rick live Q&A access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300 font-bold">+3-5 MPH in 7 days (proven avg)</span>
                  </div>
                  <div className="pt-3 border-t border-yellow-500/30">
                    <p className="text-xl font-black text-yellow-500">Limited Time: $7</p>
                    <p className="text-xs text-gray-400 mt-1">Over 400 enrolled this month</p>
                  </div>
                </div>
                <Button asChild className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-black uppercase">
                  <a href="https://whop.com/the-hitting-skool/297-b6/" target="_blank" rel="noopener noreferrer">
                    Start Challenge
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Tier 3 - DIY Platform */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <div className="mb-2 space-y-1">
                  <div>
                    <span className="text-3xl font-black">$97</span>
                    <span className="text-lg text-gray-400">/mo</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    or <span className="font-bold text-white">$997/year</span> <span className="text-green-500">(save 15%)</span>
                  </div>
                </div>
                <CardTitle className="text-xl font-black uppercase">DIY Player Platform</CardTitle>
                <CardDescription className="text-gray-400">Independent training toolkit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Unlimited AI video reviews</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Full drill library (60+ exercises)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Tempo Tracker app access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Progress tracking dashboard</span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500">$24.75/month when paid annually</p>
                  </div>
                </div>
                <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                  <a href="https://whop.com/the-hitting-skool/hits-diy-platform/" target="_blank" rel="noopener noreferrer">
                    Start Training
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Tier 4 - Elite 90-Day */}
            <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader>
                <div className="mb-2">
                  <span className="text-2xl font-black text-yellow-500">Apply for Pricing</span>
                </div>
                <CardTitle className="text-xl font-black uppercase">Elite 90-Day Transformation</CardTitle>
                <CardDescription className="text-gray-400">Done-with-you coaching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300 font-semibold">Weekly 1-on-1 video reviews</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Custom 90-day periodization plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300">Priority support (24hr response)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-gray-300 font-bold">Performance guarantee</span>
                  </div>
                  <div className="pt-3 border-t border-yellow-500/30 bg-yellow-500/5 -mx-6 px-6 py-3">
                    <p className="text-sm font-black text-yellow-500">
                      +5 MPH Guarantee or Full Refund
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                  <a href="https://whop.com/the-hitting-skool/elite-90-day-transformation/" target="_blank" rel="noopener noreferrer">
                    Apply for Elite
                  </a>
                </Button>
                <p className="text-xs text-center text-gray-400 italic">
                  Pricing revealed after swing analysis
                </p>
                <p className="text-xs text-center text-gray-400 italic">
                  Limited to 15 athletes per quarter
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="rounded-lg border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 p-8">
              <h3 className="text-3xl font-black text-white mb-4">
                Our Guarantee
              </h3>
              <p className="text-xl text-gray-300">
                Improve timing & contact quality or you don't pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Offerings */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="mb-12 text-center text-3xl font-black uppercase md:text-4xl">
              Custom Solutions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl font-black uppercase">Winter Workshops</CardTitle>
                  <CardDescription className="text-gray-400">Intensive training camps & clinics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">
                    Multi-day immersive training experiences with hands-on coaching and small-group instruction.
                  </p>
                  <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                    <a href="mailto:contact@thehittingskool.com">
                      Contact Us
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-zinc-900 text-white hover:border-yellow-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl font-black uppercase">Teams & Academies</CardTitle>
                  <CardDescription className="text-gray-400">Custom programs for organizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">
                    Bulk licensing, custom training programs, and dedicated support for teams and training facilities.
                  </p>
                  <Button asChild className="w-full bg-white/10 text-white hover:bg-white/20 font-bold uppercase">
                    <a href="mailto:contact@thehittingskool.com">
                      Contact Us
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-12 text-center text-3xl font-black uppercase md:text-4xl">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-white/10 bg-zinc-900 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-bold text-white hover:text-yellow-500">
                  What if I'm not ready for paid coaching?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Start with the free Tempo Score analysis. You'll get instant feedback on your swing sequencing with zero risk. Most players see immediate value and choose to upgrade from there.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-white/10 bg-zinc-900 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-bold text-white hover:text-yellow-500">
                  Can I upgrade or downgrade my plan?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Yes! You can upgrade at any time. If you start with the 7-Day Challenge and want to continue, you can upgrade to the DIY Platform or Elite program.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-white/10 bg-zinc-900 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-bold text-white hover:text-yellow-500">
                  What's the difference between DIY Platform and Elite?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  DIY Platform gives you all the tools to train independently with AI feedback. Elite includes weekly 1-on-1 reviews with Coach Rick, custom programming, and our performance guarantee. Choose DIY if you're self-motivated; choose Elite if you want direct coaching.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-white/10 bg-zinc-900 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-bold text-white hover:text-yellow-500">
                  How does the +5 MPH guarantee work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Elite 90-Day members who complete the full program and follow the training protocol are guaranteed to improve exit velocity by at least 5 MPH or receive a full refund. We track your progress throughout and adjust the plan to ensure results.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-white/10 bg-zinc-900 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-bold text-white hover:text-yellow-500">
                  Do you offer team or group pricing?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Yes! We have custom packages for teams, travel organizations, and training facilities. Contact us for bulk pricing and dedicated support options.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-black py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-black uppercase leading-tight md:text-5xl">
            Ready to Unlock Your<br />
            <span className="text-yellow-500">Real Power?</span>
          </h2>
          <p className="mb-8 text-lg md:text-xl text-gray-400">
            Start with a free analysis. See your results in 60 seconds.
          </p>
          <Button asChild size="lg" className="bg-yellow-500 px-8 md:px-10 py-5 md:py-6 text-lg md:text-xl font-bold uppercase text-black hover:bg-yellow-400">
            <Link to="/analyze">
              Analyze My Swing <ChevronRight className="ml-2 h-5 md:h-6 w-5 md:w-6" />
            </Link>
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
