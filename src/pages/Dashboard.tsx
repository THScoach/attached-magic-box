import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PillarCard } from "@/components/PillarCard";
import { BottomNav } from "@/components/BottomNav";
import { Camera, TrendingUp, Target, Play, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if onboarding is needed
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete) {
      navigate('/onboarding');
    }
  }, [navigate]);

  // Mock user data
  const storedAthleteInfo = localStorage.getItem('athleteInfo');
  const athleteInfo = storedAthleteInfo ? JSON.parse(storedAthleteInfo) : null;
  const userName = athleteInfo?.name?.split(' ')[0] || "Athlete";
  const hitsScore = 75;
  const trend = 3;
  const streak = 5;
  
  const latestSwing = {
    date: "Oct 28, 2025",
    hitsScore: 75,
    tempoRatio: 2.4,
    videoUrl: "#"
  };

  const pillarScores = {
    anchor: 85,
    engine: 72,
    whip: 68
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
        
        <div className="flex items-center gap-4">
          <Card className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur">
            <div className="text-2xl font-bold text-primary">{hitsScore}</div>
            <div>
              <div className="text-xs text-muted-foreground">H.I.T.S. Score</div>
              <div className="text-xs text-green-500">↗️ +{trend}</div>
            </div>
          </Card>
          
          <Card className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <div className="text-lg font-bold">{streak}</div>
              <div className="text-xs text-muted-foreground">day streak</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Latest Swing */}
        <section>
          <h2 className="text-lg font-bold mb-3">Latest Swing</h2>
          <Card className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center relative group cursor-pointer"
                 onClick={() => navigate('/result/latest')}>
              <Play className="h-16 w-16 text-primary opacity-80 group-hover:scale-110 transition-transform" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="text-white text-sm">{latestSwing.date}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-sm text-muted-foreground">H.I.T.S. Score</div>
                  <div className="text-2xl font-bold text-primary">{latestSwing.hitsScore}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tempo Ratio</div>
                  <div className="text-xl font-bold">{latestSwing.tempoRatio}:1</div>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate('/result/latest')}>
                View Full Analysis
              </Button>
            </div>
          </Card>
        </section>

        {/* Pillar Progress */}
        <section>
          <h2 className="text-lg font-bold mb-3">Your Pillars</h2>
          <div className="grid gap-3">
            <PillarCard 
              pillar="ANCHOR" 
              score={pillarScores.anchor}
              subtitle="Stability & Ground Force"
            />
            <PillarCard 
              pillar="ENGINE" 
              score={pillarScores.engine}
              subtitle="Tempo & Sequence"
            />
            <PillarCard 
              pillar="WHIP" 
              score={pillarScores.whip}
              subtitle="Release & Acceleration"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
          <div className="grid gap-3">
            <Button 
              size="lg" 
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/analyze')}
            >
              <Camera className="h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Record New Swing</div>
                <div className="text-xs opacity-80">Upload or record a video</div>
              </div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/progress')}
            >
              <TrendingUp className="h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">View Progress</div>
                <div className="text-xs opacity-80">Track your improvement</div>
              </div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/drills')}
            >
              <Target className="h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Browse Drills</div>
                <div className="text-xs opacity-80">Targeted training exercises</div>
              </div>
            </Button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
