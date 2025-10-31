import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PillarCard } from "@/components/PillarCard";
import { TodaysProgramCard } from "@/components/TodaysProgramCard";
import { BottomNav } from "@/components/BottomNav";
import { GrindScoreCard } from "@/components/GrindScoreCard";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { LiveCoachingBanner } from "@/components/LiveCoachingBanner";
import { RedeemPromoCode } from "@/components/RedeemPromoCode";
import { NotificationCenter } from "@/components/NotificationCenter";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AssignedWork } from "@/components/dashboard/AssignedWork";
import { PerformanceTracking } from "@/components/dashboard/PerformanceTracking";
import { MessageCenter } from "@/components/dashboard/MessageCenter";
import { Camera, TrendingUp, Target, Play, Flame, Lock, Upload, MessageSquare, Calendar, BarChart3, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTierAccess } from "@/hooks/useTierAccess";

export default function Dashboard() {
  const navigate = useNavigate();
  const tierAccess = useTierAccess();
  const [todaysProgram, setTodaysProgram] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [showPromoRedeem, setShowPromoRedeem] = useState(false);
  const [gritData, setGritData] = useState({
    currentScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    totalAssigned: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load active program
    const { data: programs } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (programs && programs.length > 0) {
      const program = programs[0];
      const startDate = new Date(program.start_date);
      const today = new Date();
      const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Check if checked in today
      const todayStr = today.toISOString().split('T')[0];
      const { data: checkin } = await supabase
        .from('program_checkins')
        .select('drills_completed')
        .eq('program_id', program.id)
        .eq('checkin_date', todayStr)
        .single();

      // Get drills count
      const { data: drills } = await supabase
        .from('drills')
        .select('id')
        .eq('pillar', program.focus_pillar);

      setTodaysProgram({
        id: program.id,
        focus_pillar: program.focus_pillar,
        day_number: dayNumber,
        is_checked_in_today: !!checkin,
        drills_count: drills?.length || 5
      });
    }

    // Load GRIND score
    const { data: grind } = await supabase
      .from('grit_scores')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (grind) {
      setGritData({
        currentScore: grind.current_score || 0,
        currentStreak: grind.current_streak || 0,
        longestStreak: grind.longest_streak || 0,
        totalCompleted: grind.total_tasks_completed || 0,
        totalAssigned: grind.total_tasks_assigned || 0
      });
      setStreak(grind.current_streak || 0);
    }
  };

  // Mock user data
  const storedAthleteInfo = localStorage.getItem('athleteInfo');
  const athleteInfo = storedAthleteInfo ? JSON.parse(storedAthleteInfo) : null;
  const userName = athleteInfo?.name?.split(' ')[0] || "Athlete";
  const hitsScore = 75;
  const trend = 3;
  
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

  const programStatus = todaysProgram?.is_checked_in_today ? "active" : "needs_attention";
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CoachRickAvatar size="xs" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back, {userName}!</h1>
              <div className="flex items-center gap-2 mt-1">
                {programStatus === "active" ? (
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active Today
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Ready to Train
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <NotificationCenter />
        </div>
        
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

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Button 
            size="sm" 
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 bg-card/80 backdrop-blur"
            onClick={() => navigate('/analyze')}
          >
            <Upload className="h-4 w-4" />
            <span className="text-xs">Upload</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 bg-card/80 backdrop-blur"
            onClick={() => navigate('/drills')}
          >
            <Target className="h-4 w-4" />
            <span className="text-xs">Drills</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 bg-card/80 backdrop-blur"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">Coach</span>
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Promo Code Redemption */}
        {!tierAccess.isTeamMember && tierAccess.tier === "free" && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Have a team code?</p>
                <p className="text-sm text-muted-foreground">
                  Join your coach's roster with a promo code
                </p>
              </div>
              <Button size="sm" onClick={() => setShowPromoRedeem(!showPromoRedeem)}>
                {showPromoRedeem ? "Cancel" : "Redeem"}
              </Button>
            </div>
            {showPromoRedeem && (
              <div className="mt-4">
                <RedeemPromoCode />
              </div>
            )}
          </Card>
        )}

        {/* Live Coaching Banner */}
        {tierAccess.canViewReplay && <LiveCoachingBanner />}

        <p className="text-sm text-muted-foreground mb-6 italic">
          Upload today's swings to unlock your next power level.
        </p>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity">
              <TrendingUp className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="program">
              <Calendar className="h-4 w-4 mr-2" />
              Program
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Weekly Schedule */}
            {tierAccess.canUseScheduler ? (
              <WeeklySchedule />
            ) : (
              <Card className="p-6 bg-muted/50">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Weekly Schedule Locked</p>
                    <p className="text-sm">Upgrade to access your personalized training schedule</p>
                  </div>
                </div>
              </Card>
            )}

            {/* GRIND Score */}
            {tierAccess.canViewGrind ? (
              <GrindScoreCard />
            ) : (
              <Card className="p-6 bg-muted/50">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                  <div>
                    <p className="font-medium">GRIND Score Locked</p>
                    <p className="text-sm">Upgrade to track your consistency and streaks</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Performance Tracking */}
            <PerformanceTracking />

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
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed />
            
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
          </TabsContent>

          <TabsContent value="program" className="space-y-6">
            <TodaysProgramCard program={todaysProgram} />
            <AssignedWork />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <MessageCenter />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
