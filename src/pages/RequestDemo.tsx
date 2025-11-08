import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { HitsLogo, HitsMonogram } from "@/components/HitsLogo";

export default function RequestDemo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    teamSize: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Demo request received! We'll contact you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        organization: "",
        role: "",
        teamSize: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/about">About</Link>
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,192,192,0.08)_0%,transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-6xl">
            Transform Your Team
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Custom HITS programs for coaches, teams, and training facilities
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Benefits Column */}
            <div>
              <h2 className="text-3xl font-black uppercase mb-8">
                What You Get
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Team-Wide Analytics Dashboard</h3>
                    <p className="text-gray-400">
                      Track every player's progress with comprehensive tempo scoring and sequencing metrics
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Custom Training Programs</h3>
                    <p className="text-gray-400">
                      Personalized drill progressions built around your team's specific needs and schedule
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Bulk Seat Licensing</h3>
                    <p className="text-gray-400">
                      Flexible pricing for teams of any size with unlimited analysis per player
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">On-Site Workshops</h3>
                    <p className="text-gray-400">
                      Optional in-person training sessions with Coach Rick and the HITS team
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Dedicated Support</h3>
                    <p className="text-gray-400">
                      Priority support with a dedicated account manager for your organization
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">White-Label Options</h3>
                    <p className="text-gray-400">
                      Available for academies and facilities who want branded experiences
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 rounded-lg border-2 border-primary/30 bg-primary/5">
                <p className="text-lg font-bold text-white mb-2">
                  Trusted by Elite Programs
                </p>
                <p className="text-gray-400">
                  High school, college, and professional organizations across the country use HITS to develop their hitters.
                </p>
              </div>
            </div>

            {/* Form Column */}
            <div>
              <Card className="border-white/20 bg-zinc-900">
                <CardHeader>
                  <CardTitle className="text-2xl font-black uppercase">Request a Demo</CardTitle>
                  <p className="text-gray-400">
                    Fill out the form below and we'll schedule a personalized demo for your organization
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-zinc-800 border-white/10"
                        placeholder="John Smith"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-zinc-800 border-white/10"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization Name *</Label>
                      <Input
                        id="organization"
                        name="organization"
                        type="text"
                        required
                        value={formData.organization}
                        onChange={handleChange}
                        className="bg-zinc-800 border-white/10"
                        placeholder="High School / College / Academy"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role *</Label>
                      <Input
                        id="role"
                        name="role"
                        type="text"
                        required
                        value={formData.role}
                        onChange={handleChange}
                        className="bg-zinc-800 border-white/10"
                        placeholder="Head Coach / Director / Owner"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Input
                        id="teamSize"
                        name="teamSize"
                        type="text"
                        required
                        value={formData.teamSize}
                        onChange={handleChange}
                        className="bg-zinc-800 border-white/10"
                        placeholder="15-20 players"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="bg-zinc-800 border-white/10 min-h-[100px]"
                        placeholder="Tell us about your needs, goals, or any questions..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase py-6 text-lg"
                    >
                      {isSubmitting ? "Submitting..." : "Request Demo"}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      We'll respond within 24 hours to schedule your personalized demo
                    </p>
                  </form>
                </CardContent>
              </Card>
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
              <div>
                <p className="text-sm text-gray-400">
                  © 2025 The Hitting Skool. All rights reserved.
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  All programs managed through GoHighLevel and Coachly platforms.
                </p>
              </div>
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
