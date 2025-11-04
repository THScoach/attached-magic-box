import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PillarCard } from "@/components/PillarCard";
import { BottomNav } from "@/components/BottomNav";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { LiveCoachingBanner } from "@/components/LiveCoachingBanner";
import { RedeemPromoCode } from "@/components/RedeemPromoCode";
import { NotificationCenter } from "@/components/NotificationCenter";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { FocusTodayCard } from "@/components/dashboard/FocusTodayCard";
import { GrindScoreCard } from "@/components/GrindScoreCard";
import { CoachRickChatBubble } from "@/components/CoachRickChatBubble";
import { EquipmentOnboardingModal } from "@/components/EquipmentOnboardingModal";
import { FreeSwingCounter } from "@/components/FreeSwingCounter";
import { ProfileUpdatePrompt } from "@/components/ProfileUpdatePrompt";
import { User, TrendingUp, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTierAccess } from "@/hooks/useTierAccess";
import { useUserMembership } from "@/hooks/useUserMembership";
import { useUserRole } from "@/hooks/useUserRole";

export default function Dashboard() {
  const navigate = useNavigate();
  const tierAccess = useTierAccess();
  const { membership } = useUserMembership();
  const { isCoach, isAdmin } = useUserRole();
  const [todaysProgram, setTodaysProgram] = useState<any>(null);
  const [showPromoRedeem, setShowPromoRedeem] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastSwingDate, setLastSwingDate] = useState<string | null>(null);
  const [gritData, setGritData] = useState({
    currentScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    totalAssigned: 0
  });

  useEffect(() => {
    checkForOnboarding();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  const checkForOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hasOnboarded = user.user_metadata?.equipment_onboarded;
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  };

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
    }

    // Load last swing date
    const { data: lastAnalysis } = await supabase
      .from('swing_analyses')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastAnalysis) {
      setLastSwingDate(lastAnalysis.created_at);
    }
  };

  // Mock user data
  const storedAthleteInfo = localStorage.getItem('athleteInfo');
  const athleteInfo = storedAthleteInfo ? JSON.parse(storedAthleteInfo) : null;
  const userName = athleteInfo?.name?.split(' ')[0] || "Athlete";
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-7xl mx-auto p-4 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {userName}</h1>
            <p className="text-muted-foreground">Let's build on yesterday's work</p>
          </div>
          <div className="flex items-center gap-2">
            {!isCoach && !isAdmin && membership?.tier === 'free' && (
              <FreeSwingCounter 
                swingsUsed={membership.swingCount || 0}
                swingsLimit={10}
              />
            )}
            <NotificationCenter />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <GrindScoreCard userId={undefined} />
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Weekly Tasks</p>
            </div>
            <p className="text-3xl font-bold">
              {gritData.totalCompleted} / {gritData.totalAssigned}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <p className="text-3xl font-bold">{gritData.currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Last Swing</p>
            </div>
            <p className="text-2xl font-bold">
              {lastSwingDate
                ? new Date(lastSwingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : "None"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Upload date</p>
          </Card>
        </div>

        {/* Promo Code Redemption */}
        {!tierAccess.isTeamMember && tierAccess.tier === "free" && showPromoRedeem && (
          <RedeemPromoCode />
        )}

        {/* Focus Today Card */}
        <FocusTodayCard
          lastSwingDate={lastSwingDate || undefined}
          tasksCompleted={gritData.totalCompleted}
          tasksTotal={gritData.totalAssigned}
          hasActiveDrills={!!todaysProgram}
        />

        {/* Live Coaching Banner */}
        {tierAccess.canViewReplay && <LiveCoachingBanner />}

        {/* Progress Feed */}
        <DashboardTabs />

        {/* Weekly Schedule */}
        {tierAccess.canUseScheduler && <WeeklySchedule />}
      </div>

      <BottomNav />
      <CoachRickChatBubble />
      <ProfileUpdatePrompt />
      <EquipmentOnboardingModal
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
}
