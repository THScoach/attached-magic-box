import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PillarCard } from "@/components/PillarCard";
import { BottomNav } from "@/components/BottomNav";
import { SequenceScoreCard } from "@/components/SequenceScoreCard";
import { TempoScoreCard } from "@/components/TempoScoreCard";
import { ConsistencyScoreCard } from "@/components/ConsistencyScoreCard";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { LiveCoachingBanner } from "@/components/LiveCoachingBanner";
import { RedeemPromoCode } from "@/components/RedeemPromoCode";
import { NotificationCenter } from "@/components/NotificationCenter";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { User, Bell, Upload, CheckCircle2, AlertCircle } from "lucide-react";
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
      <div className="container max-w-7xl mx-auto p-4 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome Back, {userName}!</h1>
            <p className="text-muted-foreground">
              Upload today's swings to unlock your next power level
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={programStatus === "active" ? "default" : "secondary"} className="flex items-center gap-2">
              {programStatus === "active" ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Ready to Train
                </>
              )}
            </Badge>
            <NotificationCenter />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Promo Code Redemption */}
        {!tierAccess.isTeamMember && tierAccess.tier === "free" && showPromoRedeem && (
          <RedeemPromoCode />
        )}

        {/* Live Coaching Banner */}
        {tierAccess.canViewReplay && <LiveCoachingBanner />}

        {/* Score Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <SequenceScoreCard />
          <TempoScoreCard />
          <ConsistencyScoreCard />
        </div>

        {/* Main CTA */}
        <Button 
          size="lg"
          className="w-full h-16 text-lg font-semibold"
          onClick={() => navigate("/analyze")}
        >
          <Upload className="mr-2 h-6 w-6" />
          Analyze My Swing
        </Button>

        {/* 3-Tab Carousel */}
        <DashboardTabs />

        {/* Pillar Scores */}
        <div>
          <h2 className="text-xl font-bold mb-4">Pillar Performance</h2>
          <div className="grid gap-4 md:grid-cols-3">
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
        </div>

        {/* Weekly Schedule */}
        {tierAccess.canUseScheduler && <WeeklySchedule />}
      </div>

      <BottomNav />
    </div>
  );
}
