import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MapPin, Clock, Users, Trophy, CheckCircle2 } from "lucide-react";
import { HitsLogo } from "@/components/HitsLogo";
import { GHLBookingEmbedPlaceholder } from "@/components/GHLBookingEmbedPlaceholder";

export default function TrainInPerson() {
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
              Train Live with Coach Rick
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              1-on-1 and small group sessions with the same sequencing system we use in our remote app
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold text-lg px-8 py-6">
              <a href="#booking">Book Your Session</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Locations & Availability */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black uppercase mb-8 text-center">Locations & Availability</h2>
            
            <Card className="bg-black border-white/20 mb-8">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex gap-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Training Locations</h3>
                      <p className="text-gray-400 text-sm">
                        Sessions available at select facilities in the [LOCATION AREA]. Specific location provided upon booking confirmation.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Schedule</h3>
                      <p className="text-gray-400 text-sm">
                        Available [DAYS] between [TIME RANGE]. Book at least 48 hours in advance for best availability.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 text-center">
              <p className="text-gray-400 text-sm">
                <strong className="text-white">Note:</strong> In-person training spots are limited. 
                Remote training is available nationwide for those outside the local area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Session Types & Pricing */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black uppercase mb-12 text-center">Session Types & Pricing</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Initial Evaluation */}
              <Card className="bg-zinc-950 border-white/20 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Initial Evaluation</CardTitle>
                  <CardDescription className="text-gray-400">
                    60 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-black text-primary">$150</div>
                  
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Complete swing assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>HITS tempo analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Custom training plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Video analysis report</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Private Lesson */}
              <Card className="bg-zinc-950 border-primary/50 hover:border-primary transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Private Lesson</CardTitle>
                  <CardDescription className="text-gray-400">
                    60 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-black text-primary">$125</div>
                  
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>1-on-1 coaching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Drill work & feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Video review</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Ongoing support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Small Group */}
              <Card className="bg-zinc-950 border-white/20 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">Small Group</CardTitle>
                  <CardDescription className="text-gray-400">
                    90 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-black text-primary">$75</div>
                  <div className="text-xs text-gray-400">per athlete (2-4 players)</div>
                  
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Semi-private setting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Individual attention</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Peer learning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Cost-effective</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Clinics */}
              <Card className="bg-zinc-950 border-white/20 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">Clinics</CardTitle>
                  <CardDescription className="text-gray-400">
                    2-3 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-black text-primary">$50</div>
                  <div className="text-xs text-gray-400">per athlete (5-12 players)</div>
                  
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Special topic focus</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Group instruction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Team building</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Great value</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Package deals and monthly memberships available. Contact for team rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black uppercase mb-4">Book Your Session</h2>
              <p className="text-lg text-gray-300">
                Select your preferred session type and available time below
              </p>
            </div>
            
            {/* GHL Booking Placeholder */}
            <GHLBookingEmbedPlaceholder />

            <div className="mt-8 bg-zinc-900 border border-white/10 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">What to Bring:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Your own bat (or use facility equipment)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Athletic wear and turf shoes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Water bottle</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Positive attitude and willingness to learn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black uppercase mb-4">Can't Train In-Person?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Get the same HITS system coaching remotely from anywhere in the country
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold">
              <Link to="/programs">View Remote Programs</Link>
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
