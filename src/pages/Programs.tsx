import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { HitsLogo } from "@/components/HitsLogo";

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
      <section className="bg-gradient-to-b from-black to-zinc-900 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Training Programs
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Choose the path that fits your goals. Every program is built on tempo, sequence, and the 4B Hitting Intelligence System.
          </p>
        </div>
      </section>

      {/* 4B Elite Evaluation */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              4B Elite Swing Evaluation – $299
            </h2>
            <p className="text-xl text-gray-300">
              The most complete hitting assessment in the country.
            </p>
          </div>

          <Card className="bg-black border-primary/50">
            <CardContent className="p-8">
              <p className="text-lg text-gray-300 mb-6">
                In 90 minutes we measure your <span className="text-primary font-bold">Brain, Body, Bat, and Ball</span> using advanced tech to build your personalized hitting blueprint.
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Includes:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>S2 Cognition Test</strong> (Brain)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>3D Biomechanical & Tempo Analysis</strong> (Body)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Bat Speed & Barrel Efficiency Testing</strong> (Bat)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Exit Speed & Launch Angle Assessment</strong> (Ball)</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Deliverables:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Personalized 4B Report</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Video Summary</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Next-Step Plan</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8 p-4 bg-zinc-900 rounded-lg">
                <p className="text-gray-300">
                  <strong className="text-white">Location:</strong><br />
                  2013 Hitzert Court, Fenton, MO 63026
                </p>
              </div>

              <Button 
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  // Replace with GHL checkout link once provided
                  window.location.href = '#ghl-evaluation-checkout';
                }}
              >
                Book Your 4B Evaluation
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 12-Week Pod Training Program */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Train in Pods – Affordable. Data-Driven. Consistent.
            </h2>
            <p className="text-xl text-gray-300">
              Small-group pods that train like pros. Each pod runs for 12 weeks.
            </p>
          </div>

          <Card className="bg-zinc-900 border-white/20">
            <CardContent className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Program Details:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>9 total players per 100-minute pod (3 new players start every 20 minutes)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Each player receives ~40 minutes of focused work</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Includes weekly tempo & sequencing feedback</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8 p-6 bg-black rounded-lg border border-primary/30">
                <h3 className="text-xl font-bold text-white mb-4">Commitment:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>12-week minimum</strong> (program, not lessons)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>1 pod per week</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>$75</strong> per player per session</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Billed monthly: <strong>$300/month for 3 months</strong> ($900 total per player)</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Class Format – The 4B Solution in Action</h3>
                <p className="text-gray-300 mb-6">
                  Each 90-minute pod class is built on the 4B System — every player trains all four pillars in a single session.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 text-white font-bold">Phase</th>
                        <th className="text-left py-3 px-4 text-white font-bold">Focus</th>
                        <th className="text-left py-3 px-4 text-white font-bold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/10">
                        <td className="py-4 px-4 text-gray-300">Stack Protocol (30 min)</td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-primary">Bat + Body</span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          AI-powered bat-speed & strength phase using The Stack System. Players build rotational power and tempo awareness.
                        </td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-4 px-4 text-gray-300">Movement & Sequencing (30 min)</td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-primary">Body + Brain</span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          Stability and timing work that connects movement efficiency with mental rhythm and sequencing.
                        </td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-4 px-4 text-gray-300">Live Hitting & Feedback (30 min)</td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-primary">Ball + Bat</span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          Measured results using HitTrax / Rapsodo / constraint drills. Immediate feedback on contact, launch, and exit speed.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-gray-300 mt-6">
                  Each class reinforces the Brain, Body, Bat, and Ball pillars — so hitters develop complete, game-transferable skill sets instead of isolated mechanics.
                </p>
              </div>

              <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-primary">Note:</strong> This is a <strong>program-based model</strong>, not single lessons. You're committing to a 12-week development cycle designed to build lasting results.
                </p>
              </div>

              <Button 
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  // Replace with GHL checkout link once provided
                  window.location.href = '#ghl-pod-checkout';
                }}
              >
                Join a Pod Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Remote Training Program */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Remote 4B Training – Get Coached from Anywhere
            </h2>
            <p className="text-xl text-gray-300">
              Same system. Same feedback. Delivered through Coachly.
            </p>
          </div>

          <Card className="bg-black border-white/20 mb-12">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">How It Works:</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                    1
                  </div>
                  <p className="text-gray-300 pt-1">Submit your swing video through Coachly.</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                    2
                  </div>
                  <p className="text-gray-300 pt-1">Receive a personalized 4B Report (Brain, Body, Bat, Ball).</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                    3
                  </div>
                  <p className="text-gray-300 pt-1">Get tempo notes, drills, and direct feedback from Coach Rick.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-zinc-900 rounded-lg border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-2">Single Swing Review</h4>
                  <div className="text-3xl font-bold text-primary mb-4">$99</div>
                  <p className="text-gray-400 text-sm">One-time analysis</p>
                </div>

                <div className="p-6 bg-zinc-900 rounded-lg border border-primary/50 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-white">POPULAR</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Monthly Plan</h4>
                  <div className="text-3xl font-bold text-primary mb-4">$249<span className="text-lg text-gray-400">/mo</span></div>
                  <p className="text-gray-400 text-sm">Ongoing coaching</p>
                </div>

                <div className="p-6 bg-zinc-900 rounded-lg border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-2">3-Month Plan</h4>
                  <div className="text-3xl font-bold text-primary mb-4">$699</div>
                  <p className="text-gray-400 text-sm mb-2">Save $48</p>
                  <p className="text-green-400 text-xs font-semibold">Best Value</p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-zinc-900 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Delivery:</strong> All training delivered through Coachly.<br />
                  <strong className="text-white">Billing:</strong> Handled through GoHighLevel checkout (Stripe / financing available).
                </p>
              </div>

              <Button 
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  // Replace with Coachly URL once provided
                  window.location.href = '#coachly-remote-training';
                }}
              >
                Start Remote Training
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Community Call */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              The Hitting Skool Community Call
            </h2>
            <p className="text-xl text-gray-300">
              You're not just buying lessons. You're joining a program.
            </p>
          </div>

          <Card className="bg-zinc-900 border-primary/50">
            <CardContent className="p-8">
              <p className="text-lg text-gray-300 mb-8">
                All active THS athletes gain access to our live <strong className="text-white">Zoom Community Call every Monday at 7:00 PM (Central)</strong>. Hosted by Coach Rick, this is where we talk hitting approach, mindset, tempo, and review film together.
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Access Included With:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Active Pod Program athletes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Remote Training athletes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>4B Evaluation athletes (for 30 days after their eval)</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Features:</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Weekly live call on Zoom</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Q&A and live analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Player and parent discussions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>Replays available via athlete portal</span>
                  </li>
                </ul>
              </div>

              <Button 
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  // Replace with GHL checkout link once provided
                  window.location.href = '#ghl-community-checkout';
                }}
              >
                Join the Community
              </Button>
            </CardContent>
          </Card>
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
