import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateGrade, LetterGrade } from "@/lib/gradingSystem";

interface BatMetrics {
  batSpeed: number;
  attackAngle: number;
  timeInZone: number;
  batSpeedGrade: LetterGrade;
  attackAngleGrade: LetterGrade;
  timeInZoneGrade: LetterGrade;
  personalBest?: number;
  level: string;
}

interface BodyMetrics {
  legsPeakVelocity: number;
  corePeakVelocity: number;
  armsPeakVelocity: number;
  batPeakVelocity: number;
  sequenceEfficiency: number;
  sequenceGrade: LetterGrade;
  legsPower: number;
  corePower: number;
  armsPower: number;
  powerGrade: LetterGrade;
  loadTime: number;
  launchTime: number;
  tempoRatio: number;
  tempoGrade: LetterGrade;
  isCorrectSequence: boolean;
}

interface BallMetrics {
  exitVelocity: number;
  exitVelocityGrade: LetterGrade;
  flyBallPercentage: number;
  lineDrivePercentage: number;
  groundBallPercentage: number;
  launchAngleGrade: LetterGrade;
  hardHitPercentage: number;
  hardHitCount: number;
  totalSwings: number;
  hardHitGrade: LetterGrade;
  level: string;
}

interface BrainMetrics {
  reactionTime: number;
  reactionTimeGrade: LetterGrade;
  goodSwingsPercentage: number;
  goodTakesPercentage: number;
  chaseRate: number;
  swingDecisionGrade: LetterGrade;
  totalPitches: number;
  focusScore: number;
  focusGrade: LetterGrade;
  consistencyRating: number;
}

interface ProgressStats {
  totalSwings: number;
  avgHitsScore: number;
  improvement: number;
  bestPillar: string;
  focusArea: string;
}

interface ProgressData {
  date: string;
  hits: number;
  anchor: number;
  engine: number;
  whip: number;
}

export function useProgressMetrics(playerId?: string) {
  const [batMetrics, setBatMetrics] = useState<BatMetrics | null>(null);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics | null>(null);
  const [ballMetrics, setBallMetrics] = useState<BallMetrics | null>(null);
  const [brainMetrics, setBrainMetrics] = useState<BrainMetrics | null>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [playerId]);

  const loadMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch latest BAT metrics
      const { data: batData } = await supabase
        .from("bat_metrics")
        .select("*")
        .eq("user_id", user.id)
        .eq(playerId ? "player_id" : "player_id", playerId || null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (batData) {
        setBatMetrics({
          batSpeed: Number(batData.bat_speed),
          attackAngle: Number(batData.attack_angle),
          timeInZone: Number(batData.time_in_zone),
          batSpeedGrade: calculateGrade(Number(batData.bat_speed_grade || 0)),
          attackAngleGrade: calculateGrade(Number(batData.attack_angle_grade || 0)),
          timeInZoneGrade: calculateGrade(Number(batData.time_in_zone_grade || 0)),
          personalBest: batData.personal_best ? Number(batData.personal_best) : undefined,
          level: batData.level || 'highSchool',
        });
      }

      // Fetch latest BODY metrics
      const { data: bodyData } = await supabase
        .from("body_metrics")
        .select("*")
        .eq("user_id", user.id)
        .eq(playerId ? "player_id" : "player_id", playerId || null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bodyData) {
        setBodyMetrics({
          legsPeakVelocity: Number(bodyData.legs_peak_velocity),
          corePeakVelocity: Number(bodyData.core_peak_velocity),
          armsPeakVelocity: Number(bodyData.arms_peak_velocity),
          batPeakVelocity: Number(bodyData.bat_peak_velocity),
          sequenceEfficiency: Number(bodyData.sequence_efficiency),
          sequenceGrade: calculateGrade(Number(bodyData.sequence_grade || 0)),
          legsPower: Number(bodyData.legs_power),
          corePower: Number(bodyData.core_power),
          armsPower: Number(bodyData.arms_power),
          powerGrade: calculateGrade(Number(bodyData.power_grade || 0)),
          loadTime: Number(bodyData.load_time),
          launchTime: Number(bodyData.launch_time),
          tempoRatio: Number(bodyData.tempo_ratio),
          tempoGrade: calculateGrade(Number(bodyData.tempo_grade || 0)),
          isCorrectSequence: bodyData.is_correct_sequence !== false,
        });
      }

      // Fetch latest BALL metrics
      const { data: ballData } = await supabase
        .from("ball_metrics")
        .select("*")
        .eq("user_id", user.id)
        .eq(playerId ? "player_id" : "player_id", playerId || null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ballData) {
        setBallMetrics({
          exitVelocity: Number(ballData.exit_velocity),
          exitVelocityGrade: calculateGrade(Number(ballData.exit_velocity_grade || 0)),
          flyBallPercentage: Number(ballData.fly_ball_percentage || 0),
          lineDrivePercentage: Number(ballData.line_drive_percentage || 0),
          groundBallPercentage: Number(ballData.ground_ball_percentage || 0),
          launchAngleGrade: calculateGrade(Number(ballData.launch_angle_grade || 0)),
          hardHitPercentage: Number(ballData.hard_hit_percentage || 0),
          hardHitCount: ballData.hard_hit_count || 0,
          totalSwings: ballData.total_swings || 0,
          hardHitGrade: calculateGrade(Number(ballData.hard_hit_grade || 0)),
          level: ballData.level || 'highSchool',
        });
      }

      // Fetch latest BRAIN metrics
      const { data: brainData } = await supabase
        .from("brain_metrics")
        .select("*")
        .eq("user_id", user.id)
        .eq(playerId ? "player_id" : "player_id", playerId || null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (brainData) {
        setBrainMetrics({
          reactionTime: Number(brainData.reaction_time),
          reactionTimeGrade: calculateGrade(Number(brainData.reaction_time_grade || 0)),
          goodSwingsPercentage: Number(brainData.good_swings_percentage || 0),
          goodTakesPercentage: Number(brainData.good_takes_percentage || 0),
          chaseRate: Number(brainData.chase_rate || 0),
          swingDecisionGrade: calculateGrade(Number(brainData.swing_decision_grade || 0)),
          totalPitches: brainData.total_pitches || 0,
          focusScore: Number(brainData.focus_score || 0),
          focusGrade: calculateGrade(Number(brainData.focus_grade || 0)),
          consistencyRating: Number(brainData.consistency_rating || 0),
        });
      }

      // Fetch progress trends from swing_analyses
      const { data: swingData } = await supabase
        .from("swing_analyses")
        .select("overall_score, anchor_score, engine_score, whip_score, created_at")
        .eq("user_id", user.id)
        .eq(playerId ? "player_id" : "player_id", playerId || null)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true });

      if (swingData && swingData.length > 0) {
        // Group by date and calculate averages
        const dateMap = new Map<string, { hits: number[], anchor: number[], engine: number[], whip: number[] }>();
        
        swingData.forEach((swing) => {
          const date = new Date(swing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!dateMap.has(date)) {
            dateMap.set(date, { hits: [], anchor: [], engine: [], whip: [] });
          }
          const data = dateMap.get(date)!;
          data.hits.push(Number(swing.overall_score));
          data.anchor.push(Number(swing.anchor_score));
          data.engine.push(Number(swing.engine_score));
          data.whip.push(Number(swing.whip_score));
        });

        const trends = Array.from(dateMap.entries()).map(([date, scores]) => ({
          date,
          hits: Math.round(scores.hits.reduce((a, b) => a + b, 0) / scores.hits.length),
          anchor: Math.round(scores.anchor.reduce((a, b) => a + b, 0) / scores.anchor.length),
          engine: Math.round(scores.engine.reduce((a, b) => a + b, 0) / scores.engine.length),
          whip: Math.round(scores.whip.reduce((a, b) => a + b, 0) / scores.whip.length),
        }));

        setProgressData(trends);

        // Calculate stats
        const totalSwings = swingData.length;
        const avgHitsScore = Math.round(swingData.reduce((sum, s) => sum + Number(s.overall_score), 0) / totalSwings);
        const firstScore = Number(swingData[0].overall_score);
        const lastScore = Number(swingData[swingData.length - 1].overall_score);
        const improvement = lastScore - firstScore;

        // Determine best pillar and focus area
        const avgAnchor = swingData.reduce((sum, s) => sum + Number(s.anchor_score), 0) / totalSwings;
        const avgEngine = swingData.reduce((sum, s) => sum + Number(s.engine_score), 0) / totalSwings;
        const avgWhip = swingData.reduce((sum, s) => sum + Number(s.whip_score), 0) / totalSwings;

        const pillars = { ANCHOR: avgAnchor, ENGINE: avgEngine, WHIP: avgWhip };
        const bestPillar = Object.entries(pillars).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        const focusArea = Object.entries(pillars).reduce((a, b) => a[1] < b[1] ? a : b)[0];

        setStats({
          totalSwings,
          avgHitsScore,
          improvement,
          bestPillar,
          focusArea,
        });
      }
    } catch (error) {
      console.error("Error loading progress metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    batMetrics,
    bodyMetrics,
    ballMetrics,
    brainMetrics,
    stats,
    progressData,
    loading,
    refetch: loadMetrics,
  };
}
