import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DrillCard } from "@/components/DrillCard";
import { BottomNav } from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { PracticeJournal } from "@/components/PracticeJournal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Trophy, Flame, Target, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Training() {
  const navigate = useNavigate();
  const [program, setProgram] = useState<any>(null);
  const [drills, setDrills] = useState<any[]>([]);
  const [checkedDrills, setCheckedDrills] = useState<string[]>([]);
  const [gamification, setGamification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    // Load active program
    const { data: programs } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!programs || programs.length === 0) {
      setLoading(false);
      toast.info("Complete an analysis to get your training program!");
      return;
    }

    const activeProgram = programs[0];
    setProgram(activeProgram);

    // Load recommended drills based on focus pillar
    const { data: drillsData } = await supabase
      .from('drills')
      .select('*')
      .eq('pillar', activeProgram.focus_pillar)
      .order('difficulty', { ascending: true })
      .limit(5);

    setDrills(drillsData || []);

    // Load today's check-in
    const today = new Date().toISOString().split('T')[0];
    const { data: checkin } = await supabase
      .from('program_checkins')
      .select('*')
      .eq('program_id', activeProgram.id)
      .eq('checkin_date', today)
      .single();

    if (checkin) {
      setCheckedDrills(checkin.drills_completed || []);
    }

    // Load gamification stats
    const { data: gamData } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setGamification(gamData);
    setLoading(false);
  };

  const handleDrillToggle = (drillId: string) => {
    setCheckedDrills(prev => 
      prev.includes(drillId) 
        ? prev.filter(id => id !== drillId)
        : [...prev, drillId]
    );
  };

  const handleCheckIn = async () => {
    if (checkedDrills.length === 0) {
      toast.error("Complete at least one drill to check in!");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !program) return;

    const today = new Date().toISOString().split('T')[0];

    // Upsert check-in
    const { error: checkinError } = await supabase
      .from('program_checkins')
      .upsert({
        program_id: program.id,
        user_id: user.id,
        checkin_date: today,
        drills_completed: checkedDrills
      }, {
        onConflict: 'program_id,checkin_date'
      });

    if (checkinError) {
      toast.error("Failed to save check-in");
      return;
    }

    // Update gamification
    const { data: gamData } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const lastCheckin = gamData?.last_checkin_date ? new Date(gamData.last_checkin_date) : null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastCheckin && lastCheckin.toISOString().split('T')[0] === yesterdayStr) {
      newStreak = (gamData?.current_streak || 0) + 1;
    }

    await supabase
      .from('user_gamification')
      .upsert({
        user_id: user.id,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, gamData?.longest_streak || 0),
        total_checkins: (gamData?.total_checkins || 0) + 1,
        last_checkin_date: today
      }, {
        onConflict: 'user_id'
      });

    toast.success(`Great job! ${newStreak} day streak! 🔥`);
    loadTrainingData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading training program...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
          <h1 className="text-2xl font-bold mb-2">Training Program</h1>
        </div>
        <div className="px-6 py-6">
          <Card className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">No Active Program</h2>
            <p className="text-muted-foreground mb-4">
              Complete a swing analysis to get your personalized 4-week training program!
            </p>
            <Button onClick={() => navigate('/reboot-analysis')}>
              Start Analysis
            </Button>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  const startDate = new Date(program.start_date);
  const endDate = new Date(program.end_date);
  const today = new Date();
  const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const progress = (dayNumber / 28) * 100;
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">4-Week Training Program</h1>
        <p className="text-muted-foreground">Focus: {program.focus_pillar}</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Progress Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Program Progress</h3>
                <p className="text-sm text-muted-foreground">Day {dayNumber} of 28</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-xs text-muted-foreground">{daysRemaining} days left</div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>

        {/* Gamification Stats */}
        {gamification && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{gamification.current_streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </Card>
            <Card className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{gamification.longest_streak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </Card>
            <Card className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{gamification.total_checkins}</div>
              <div className="text-xs text-muted-foreground">Total Days</div>
            </Card>
          </div>
        )}

        {/* Today's Drills */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Today's Drills</h2>
            <span className="text-sm text-muted-foreground">
              {checkedDrills.length} / {drills.length} completed
            </span>
          </div>
          
          <div className="space-y-4">
            {drills.map(drill => (
              <Card key={drill.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={checkedDrills.includes(drill.id)}
                    onCheckedChange={() => handleDrillToggle(drill.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{drill.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {drill.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Difficulty: {"⭐".repeat(drill.difficulty)}</span>
                      <span>{drill.duration} min</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Check In Button */}
        <Button 
          size="lg" 
          className="w-full"
          onClick={handleCheckIn}
          disabled={checkedDrills.length === 0}
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Complete Today's Training
        </Button>

        {/* Program End Warning */}
        {daysRemaining <= 7 && (
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ Your program ends in {daysRemaining} days. Schedule a new analysis to continue your progress!
            </p>
          </Card>
        )}

        {/* Practice Journal */}
        <PracticeJournal />
      </div>

      <BottomNav />
    </div>
  );
}
