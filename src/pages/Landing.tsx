import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Target, TrendingUp, Video, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <img 
              src="/hits-logo-modern.png" 
              alt="H.I.T.S. Logo" 
              className="mx-auto mb-8 h-24 w-auto"
            />
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Transform Your Swing with
              <span className="block text-primary">AI-Powered Analysis</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Professional swing analysis, personalized training programs, and expert coaching 
              to take your hitting to the next level.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Why Choose H.I.T.S.?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Video className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Video Analysis</CardTitle>
                <CardDescription>
                  Upload your swing videos and get instant AI-powered feedback on your mechanics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Personalized Programs</CardTitle>
                <CardDescription>
                  Custom training programs tailored to your weaknesses and goals
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your improvement over time with detailed metrics and insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Expert Coaching</CardTitle>
                <CardDescription>
                  Access professional drills and coaching from Rick Strickland
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Record Your Swing</h3>
              <p className="text-muted-foreground">
                Use your phone to capture your swing from the right angle
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Get Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your mechanics across Anchor, Engine, and Whip
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Train Smarter</h3>
              <p className="text-muted-foreground">
                Follow your personalized program and track your progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-3xl border-primary/20 bg-gradient-to-br from-primary/10 to-background">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl">
                Ready to Transform Your Swing?
              </CardTitle>
              <CardDescription className="text-lg">
                Join hundreds of athletes already improving their game
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link to="/auth">Start Your Journey</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 H.I.T.S. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
