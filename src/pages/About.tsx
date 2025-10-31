import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HitsLogo } from "@/components/HitsLogo";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/coach-rick-hero.jpeg";
import chrisWelchImage from "@/assets/chris-welch.webp";
import drKwonImage from "@/assets/dr-kwon.jpeg";
import gavinMcMillanImage from "@/assets/gavin-mcmillan.jpeg";
import rebootMotionLogo from "@/assets/logos/reboot-motion.png";
import zenolinkLogo from "@/assets/logos/zenolink.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/">
            <HitsLogo variant="compact" />
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/programs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Programs
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground">
              About
            </Link>
            <Button asChild size="sm">
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight">
              Built in Pro Baseball.
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-chrome-light bg-clip-text text-transparent">
                Designed for Every Hitter.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Rick Strickland — Creator of HITS™
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="text-base font-semibold">
                <Link to="/book-call">Work With Rick</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Hero Image */}
        <div className="container mt-12">
          <div className="relative aspect-[21/9] max-w-6xl mx-auto rounded-2xl overflow-hidden border border-border shadow-2xl">
            <img 
              src={heroImage} 
              alt="Coach Rick Strickland coaching players" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Who is Coach Rick Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-black uppercase tracking-tight">
                  Who is Coach Rick Strickland?
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Current</strong> Texas Rangers AA Hitting Coach</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">Former</strong> Chicago Cubs Hitting Coach</span>
                    </p>
                    <div className="ml-7 space-y-1 text-sm">
                      <p>• AA Hitting Coach — Tennessee (2022–23)</p>
                      <p>• AAA Hitting Coach — Iowa (2024–25)</p>
                    </div>
                  </div>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Former Consultant</strong> — St. Louis Cardinals (2017–18) & Texas Rangers (2019)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Former Scout</strong> — Tampa Bay Rays & New York Mets</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Founder</strong> — St. Louis Pirates Player Development Program</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">25+ Years</strong> in Elite Baseball Training + Player Development</span>
                  </p>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <CoachRickAvatar size="xl" className="h-80 w-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Story Behind HITS Section */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tight text-center">
              The Story Behind HITS™
            </h2>
            <div className="prose prose-lg prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                "Back in 2009, I met Chris Welch of Zenolink — and that single relationship changed everything.
                While everyone else was studying swing cues, I was studying movement, biomechanics, and timing… 
                not just in baseball, but in golf.
              </p>
              <p className="text-lg leading-relaxed">
                Over time, I realized something simple:<br />
                The best hitters don't guess.<br />
                They move better.<br />
                They sequence better.<br />
                They time better.
              </p>
              <p className="text-lg leading-relaxed">
                So I took what I learned from golf biomechanics, sports science, and pro development — and built HITS™: 
                The Hitting Intelligence Training System…
                A system based on measurable movement, not opinions."
              </p>
              <blockquote className="border-l-4 border-primary pl-6 italic text-xl text-foreground mt-12">
                "I don't teach swings. I build hitters."
                <footer className="text-sm text-muted-foreground mt-2 not-italic">— Coach Rick</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Movement Science & Innovation */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto space-y-12">
            <h2 className="text-4xl font-black uppercase tracking-tight text-center">
              Movement Science & Innovation
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 space-y-4 bg-card/50 border-border hover:border-primary/50 transition-all">
                <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted/10">
                  <img 
                    src={drKwonImage} 
                    alt="Dr. Young-Hoo Kwon teaching biomechanics" 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <h3 className="text-2xl font-bold">Dr. Young-Hoo Kwon</h3>
                <p className="text-muted-foreground">
                  Golf biomechanics pioneer whose research on kinematic sequences informed the foundation of movement-based hitting development.
                </p>
              </Card>

              <Card className="p-8 space-y-4 bg-card/50 border-border hover:border-primary/50 transition-all">
                <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted/10">
                  <img 
                    src={gavinMcMillanImage} 
                    alt="Gavin McMillan at sports event" 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <h3 className="text-2xl font-bold">Gavin McMillan</h3>
                <p className="text-muted-foreground">
                  Sports Science Lab — Met back in 2016, Gavin fundamentally changed how Rick approached training athletes. His applied biomechanics and sports performance research bridges lab testing with real-world field application, transforming how elite athletes are developed.
                </p>
              </Card>

              <Card className="p-8 space-y-4 bg-card/50 border-border hover:border-primary/50 transition-all">
                <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted/10">
                  <img 
                    src={chrisWelchImage} 
                    alt="Chris Welch of Zenolink" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <h3 className="text-2xl font-bold">Chris Welch — Zenolink</h3>
                <p className="text-muted-foreground">
                  Skill-based biomechanics methodology that changed how Rick understood motor learning and movement efficiency in baseball.
                </p>
              </Card>
            </div>

            {/* Technology Partner Logos */}
            <div className="pt-12 space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-center text-muted-foreground">
                Technology Partners
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="group relative flex items-center justify-center rounded-lg border border-border bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/50">
                  <img 
                    src={rebootMotionLogo} 
                    alt="Reboot Motion" 
                    className="h-8 w-auto object-contain brightness-90 group-hover:brightness-100 transition-all"
                  />
                </div>
                <div className="group relative flex items-center justify-center rounded-lg border border-border bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/50">
                  <img 
                    src={zenolinkLogo} 
                    alt="Zenolink" 
                    className="h-8 w-auto object-contain brightness-90 group-hover:brightness-100 transition-all"
                  />
                </div>
                {[
                  "Blast Motion",
                  "Diamond Kinetics",
                  "Rapsodo",
                  "HitTrax",
                  "Uplift Labs",
                  "Sports Science Lab"
                ].map((tech) => (
                  <div 
                    key={tech} 
                    className="group relative flex items-center justify-center rounded-lg border border-border bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/50"
                  >
                    <span className="text-center text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      {tech}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Player Development Credibility */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-6xl mx-auto space-y-12">
            <h2 className="text-4xl font-black uppercase tracking-tight text-center">
              Players Trained & Developed
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { name: "Chicago Cubs", abbr: "CHC" },
                { name: "Texas Rangers", abbr: "TEX" },
                { name: "New York Mets", abbr: "NYM" },
                { name: "Tampa Bay Rays", abbr: "TB" },
                { name: "St. Louis Cardinals", abbr: "STL" }
              ].map((team) => (
                <div 
                  key={team.abbr}
                  className="group flex flex-col items-center gap-3 transition-all"
                >
                  <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-sm transition-all group-hover:border-primary/50 group-hover:from-card/60 group-hover:to-card/40">
                    <span className="text-3xl font-black text-muted-foreground group-hover:text-foreground transition-colors">
                      {team.abbr}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    {team.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Ready to train smarter?
            </h2>
            <Button asChild size="lg" className="text-base font-semibold">
              <Link to="/programs">Start My HITS Training</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <HitsLogo variant="compact" />
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} HITS™. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/programs" className="text-muted-foreground hover:text-foreground transition-colors">
                Programs
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/request-demo" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
