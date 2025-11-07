import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PillarCard } from "@/components/PillarCard";
import { BottomNav } from "@/components/BottomNav";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { LiveCoachingBanner } from "@/components/LiveCoachingBanner";
import { RedeemPromoCode } from "@/components/RedeemPromoCode";
import { RealtimeNotificationCenter } from "@/components/RealtimeNotificationCenter";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { FocusTodayCard } from "@/components/dashboard/FocusTodayCard";
import { GrindScoreCard } from "@/components/GrindScoreCard";
import { CoachRickChatBubble } from "@/components/CoachRickChatBubble";
import { EquipmentOnboardingModal } from "@/components/EquipmentOnboardingModal";
import { FreeSwingCounter } from "@/components/FreeSwingCounter";
import { ProfileUpdatePrompt } from "@/components/ProfileUpdatePrompt";
import { FourBsScorecard } from "@/components/FourBsScorecard";
import { TeamChallenges } from "@/components/TeamChallenges";
import { WhopSubscriptionCard } from "@/components/WhopSubscriptionCard";
import { calculateBatGrade, calculateBodyGrade, calculateBallGrade, calculateBrainGrade, calculateOverallGrade } from "@/lib/gradingSystem";
import { getBenchmarksForLevel } from "@/lib/benchmarks";
import { useQuery } from "@tanstack/react-query";
import { User, TrendingUp, Target, Zap, Trophy, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWhopTierAccess } from "@/hooks/useWhopTierAccess";
import { useWhopMembership } from "@/hooks/useWhopMembership";
import { useUserRole } from "@/hooks/useUserRole";

export default function Dashboard() {
  const navigate = useNavigate();
  const tierAccess = useWhopTierAccess();
  const { membership } = useWhopMembership();
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

  // Fetch user profile for experience level
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('experience_level, current_level')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });
  
  // Fetch latest swing analysis
  const { data: latestAnalysis } = useQuery({
    queryKey: ['latest-analysis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      return data;
    },
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

  // Calculate 4 B's grades from latest analysis
  const calculateScores = () => {
    if (!latestAnalysis) return null;
    
    const level = profile?.experience_level || 'highSchool';
    const benchmarks = getBenchmarksForLevel(level);
    
    // Extract metrics from the database safely
    const metricsData = latestAnalysis.metrics as any || {};
    const biomechanicsData = metricsData.biomechanicsMetrics || {};
    
    const metrics = {
      batSpeed: biomechanicsData.batSpeed || biomechanicsData.peakBatSpeed || 72,
      attackAngle: latestAnalysis.attack_angle || 12,
      timeInZone: metricsData.timeInZone || 0.15,
      pelvisPeakVelocity: biomechanicsData.peakPelvisVelocity || 700,
      torsoPeakVelocity: biomechanicsData.peakTorsoVelocity || 900,
      sequenceEfficiency: biomechanicsData.sequencingEfficiency || latestAnalysis.engine_score,
      tempoRatio: metricsData.tempoRatio || 1.8,
      exitVelocity: metricsData.exitVelocity || 85,
      launchAngle: metricsData.launchAngle || 15,
      hardHitPercentage: metricsData.hardHitPercentage || 65,
      reactionTime: metricsData.reactionTime || 0.42,
      decisionAccuracy: metricsData.decisionAccuracy || 85,
    };
    
    const batGrade = calculateBatGrade(metrics, level, { [level]: benchmarks });
    const bodyGrade = calculateBodyGrade(metrics, level, { [level]: benchmarks });
    const ballGrade = calculateBallGrade(metrics, level, { [level]: benchmarks });
    const brainGrade = calculateBrainGrade(metrics, level, { [level]: benchmarks });
    
    const tier = membership?.tier || 'free';
    const overallGrade = calculateOverallGrade(ballGrade, batGrade, bodyGrade, brainGrade, tier);
    
    return {
      overall: overallGrade.grade,
      ball: {
        grade: ballGrade.grade,
        percentage: ballGrade.percentage,
        metrics: [
          { label: 'Exit Velocity', value: `${metrics.exitVelocity || '--'} mph`, status: (metrics.exitVelocity || 0) > 85 ? 'good' : 'warning' as 'good' | 'warning' },
          { label: 'Launch Angle', value: `${metrics.launchAngle ? `+${metrics.launchAngle}°` : '--'}`, status: 'good' as 'good' },
          { label: 'Hard Hit %', value: `${metrics.hardHitPercentage || '--'}%`, status: 'good' as 'good' },
        ],
      },
      bat: {
        grade: batGrade.grade,
        percentage: batGrade.percentage,
        metrics: [
          { label: 'Bat Speed', value: `${metrics.batSpeed || '--'} mph`, status: (metrics.batSpeed || 0) > 70 ? 'good' : 'warning' as 'good' | 'warning' },
          { label: 'Attack Angle', value: `${metrics.attackAngle ? `+${metrics.attackAngle}°` : '--'}`, status: 'good' as 'good' },
          { label: 'Time in Zone', value: `${metrics.timeInZone.toFixed(2)}s`, status: 'good' as 'good' },
        ],
      },
      body: {
        grade: bodyGrade.grade,
        percentage: bodyGrade.percentage,
        metrics: [
          { label: 'Sequence', value: `${Math.round(metrics.sequenceEfficiency || 0)}%`, status: (metrics.sequenceEfficiency || 0) > 80 ? 'good' : 'warning' as 'good' | 'warning' },
          { label: 'Tempo', value: `${(metrics.tempoRatio || 0).toFixed(1)}:1`, status: 'good' as 'good' },
          { label: 'Power Source', value: 'Legs 65%', status: 'good' as 'good' },
        ],
      },
      brain: {
        grade: brainGrade.grade,
        percentage: brainGrade.percentage,
        metrics: [
          { label: 'Reaction Time', value: `${(metrics.reactionTime || 0).toFixed(2)}s`, status: 'good' as 'good' },
          { label: 'Decision Rate', value: `${metrics.decisionAccuracy || '--'}%`, status: 'good' as 'good' },
          { label: 'Focus Score', value: 'Coming soon', status: 'warning' as 'warning' },
        ],
      },
    };
  };
  
  const scores = calculateScores();

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
            <p className="text-muted-foreground">Track your progress with the 4 B's framework</p>
          </div>
          <div className="flex items-center gap-2">
            {!isCoach && !isAdmin && membership?.tier === 'free' && (
              <FreeSwingCounter 
                swingsUsed={membership.swingCount || 0}
                swingsLimit={10}
              />
            )}
            <RealtimeNotificationCenter />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions - Upload First */}
        {!latestAnalysis && (
          <Card className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2 border-primary/30">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-primary/20 rounded-full">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Upload Your First Swing!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get your comprehensive 4 B's analysis (BRAIN • BODY • BAT • BALL)
                </p>
              </div>
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => navigate('/analyze')}
              >
                <Camera className="h-5 w-5" />
                Analyze Your Swing
              </Button>
            </div>
          </Card>
        )}

        {/* 4 B's Scorecard */}
        {latestAnalysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your 4 B's Scorecard</h2>
                <p className="text-sm text-muted-foreground">
                  BRAIN makes the decision → BODY executes → BAT delivers → BALL creates results
                </p>
              </div>
              <Button 
                onClick={() => navigate('/analyze')}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                New Analysis
              </Button>
            </div>
            
            <FourBsScorecard
              userTier={(membership?.tier || 'free') as any}
              metrics={{
                // Extract metrics from analysis
                kinematic_sequence: latestAnalysis.engine_score || 0,
                tempo_ratio: (latestAnalysis.metrics as any)?.tempoRatio || 0,
                hip_shoulder_separation: ((latestAnalysis.metrics as any)?.biomechanicsMetrics?.peakPelvisVelocity || 700) / 10,
                weight_transfer: 12,
                bat_speed: (latestAnalysis.metrics as any)?.biomechanicsMetrics?.batSpeed || (latestAnalysis.metrics as any)?.batMaxVelocity || 72,
                attack_angle: latestAnalysis.attack_angle || 12,
                ideal_attack_angle_rate: 60,
                swing_path_tilt: 32,
                time_in_zone: ((latestAnalysis.metrics as any)?.timeInZone || 0.15) * 1000,
                exit_velocity: (latestAnalysis.metrics as any)?.exitVelocity || 85,
                launch_angle: (latestAnalysis.metrics as any)?.launchAngle || 15,
                barrel_rate: 8,
                hard_hit_rate: (latestAnalysis.metrics as any)?.hardHitPercentage || 65,
                swing_decision_rate: (latestAnalysis.metrics as any)?.decisionAccuracy || 85,
                chase_rate: 25,
                timing_consistency: 80,
              }}
              analysisId={latestAnalysis.id}
              compact={false}
            />
          </div>
        )}

        {/* Key Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {!isCoach && !isAdmin && <WhopSubscriptionCard />}
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

          <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/goals')}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">My Goals</p>
            </div>
            <p className="text-3xl font-bold text-primary">--</p>
            <p className="text-xs text-muted-foreground mt-1">Set & track goals</p>
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

        {/* Team Challenges */}
        <TeamChallenges />
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
