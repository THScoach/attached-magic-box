import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, TrendingUp, TrendingDown, Download, Zap, Target, Clock, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { FourBMotionAnalysis } from "@/components/FourBMotionAnalysis";
import { KinematicSequenceBarChart } from "@/components/KinematicSequenceBarChart";
import { KeyBiomechanics } from "@/components/KeyBiomechanics";
import { MomentumAnalysis } from "@/components/MomentumAnalysis";
import { PowerGeneration } from "@/components/PowerGeneration";
import { RebootComparisonView } from "@/components/RebootComparisonView";
import { CoachRickInsightCard } from "@/components/CoachRickInsightCard";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RebootReport {
  id: string;
  label: string;
  uploadDate: Date;
  reportDate: Date;
  metrics: {
    negativeMoveTime: number;
    maxPelvisTurnTime: number;
    maxShoulderTurnTime: number;
    maxXFactorTime: number;
    loadDuration: number;
    fireDuration: number;
    tempoRatio: number;
    kinematicSequenceGap: number;
    // Core biomechanics
    peakPelvisRotVel?: number;
    peakShoulderRotVel?: number;
    peakArmRotVel?: number;
    peakBatSpeed?: number;
    xFactor?: number;
    attackAngle?: number;
    // Consistency metrics
    peakPelvisRotVelStdDev?: number;
    peakShoulderRotVelStdDev?: number;
    peakArmRotVelStdDev?: number;
    pelvisConsistency?: number;
    shoulderConsistency?: number;
    armConsistency?: number;
    overallConsistency?: number;
    // Rotation progression
    pelvisDirectionStance?: number;
    pelvisDirectionNegMove?: number;
    pelvisDirectionMaxPelvis?: number;
    pelvisDirectionImpact?: number;
    shoulderDirectionStance?: number;
    shoulderDirectionNegMove?: number;
    shoulderDirectionMaxShoulder?: number;
    shoulderDirectionImpact?: number;
    totalPelvisRotation?: number;
    totalShoulderRotation?: number;
    // X-Factor progression
    xFactorStance?: number;
    xFactorNegMove?: number;
    xFactorMaxPelvis?: number;
    xFactorImpact?: number;
    // MLB comparison
    mlbAvgPelvisRotVel?: number;
    mlbAvgShoulderRotVel?: number;
    mlbAvgArmRotVel?: number;
    mlbAvgMaxPelvisTurn?: number;
    mlbAvgMaxShoulderTurn?: number;
    mlbAvgXFactor?: number;
    // Posture
    frontalTiltFootDown?: number;
    frontalTiltMaxHandVelo?: number;
    lateralTiltFootDown?: number;
    lateralTiltMaxHandVelo?: number;
    // COM position
    comDistNegMove?: number;
    comDistFootDown?: number;
    comDistMaxForward?: number;
    strideLengthMeters?: number;
    strideLengthPctHeight?: number;
    weightShift?: number;
    // COM velocity
    peakCOMVelocity?: number;
    minCOMVelocity?: number;
    comAvgAccelRate?: number;
    comAvgDecelRate?: number;
    bracingEfficiency?: number;
    // Player physical
    height?: number;
    weight?: number;
    bodyMass?: number;
    // Power
    rotationalPower?: number;
    linearPower?: number;
    totalPower?: number;
    // Legacy fields
    hipShoulderSeparation?: number;
    verticalBatAngle?: number;
    connectionAtImpact?: number;
    postureAngle?: number;
    earlyConnection?: number;
    momentumDirectionAngle?: number;
    forwardMomentumPct?: number;
    transferEfficiency?: number;
    energyTransferEfficiency?: number;
  };
  scores: {
    fireDurationScore: number;
    tempoRatioScore: number;
    bodyScore: number;
    archetype: string;
  };
}

export default function RebootAnalysis() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<RebootReport[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<[string | null, string | null]>([null, null]);
  const [coachRickInsights, setCoachRickInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Load reports from database on mount
  useEffect(() => {
    loadReports();
  }, []);

  // Generate Coach Rick insights when latest report changes
  useEffect(() => {
    if (reports.length > 0 && !loadingInsights && !coachRickInsights) {
      const latest = reports[reports.length - 1];
      generateCoachRickInsights(latest);
    }
  }, [reports]);

  const loadReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reboot_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('report_date', { ascending: false });

      if (error) throw error;

      const loadedReports: RebootReport[] = (data || []).map((row: any) => ({
        id: row.id,
        label: row.label,
        uploadDate: new Date(row.upload_date),
        reportDate: new Date(row.report_date),
        metrics: {
          // Use calculated values from edge function where available
          negativeMoveTime: row.negative_move_time,
          maxPelvisTurnTime: row.max_pelvis_turn_time,
          maxShoulderTurnTime: row.max_shoulder_turn_time,
          maxXFactorTime: row.max_x_factor_time,
          loadDuration: row.load_duration,
          fireDuration: row.fire_duration,
          tempoRatio: row.tempo_ratio,
          kinematicSequenceGap: row.kinematic_sequence_gap ?? row.pelvis_shoulder_gap,
          // Core biomechanics
          xFactor: row.x_factor_angle ?? row.x_factor,
          peakPelvisRotVel: row.peak_pelvis_rot_vel,
          peakShoulderRotVel: row.peak_shoulder_rot_vel,
          peakArmRotVel: row.peak_arm_rot_vel,
          peakBatSpeed: row.peak_bat_speed,
          attackAngle: row.attack_angle,
          // Consistency
          peakPelvisRotVelStdDev: row.peak_pelvis_rot_vel_std_dev,
          peakShoulderRotVelStdDev: row.peak_shoulder_rot_vel_std_dev,
          peakArmRotVelStdDev: row.peak_arm_rot_vel_std_dev,
          pelvisConsistency: row.pelvis_consistency,
          shoulderConsistency: row.shoulder_consistency,
          armConsistency: row.arm_consistency,
          overallConsistency: row.overall_consistency,
          // Rotation progression
          pelvisDirectionStance: row.pelvis_direction_stance,
          pelvisDirectionNegMove: row.pelvis_direction_neg_move,
          pelvisDirectionMaxPelvis: row.pelvis_direction_max_pelvis,
          pelvisDirectionImpact: row.pelvis_direction_impact,
          shoulderDirectionStance: row.shoulder_direction_stance,
          shoulderDirectionNegMove: row.shoulder_direction_neg_move,
          shoulderDirectionMaxShoulder: row.shoulder_direction_max_shoulder,
          shoulderDirectionImpact: row.shoulder_direction_impact,
          totalPelvisRotation: row.total_pelvis_rotation,
          totalShoulderRotation: row.total_shoulder_rotation,
          // X-Factor progression
          xFactorStance: row.x_factor_stance,
          xFactorNegMove: row.x_factor_neg_move,
          xFactorMaxPelvis: row.x_factor_max_pelvis,
          xFactorImpact: row.x_factor_impact,
          // MLB comparison
          mlbAvgPelvisRotVel: row.mlb_avg_pelvis_rot_vel,
          mlbAvgShoulderRotVel: row.mlb_avg_shoulder_rot_vel,
          mlbAvgArmRotVel: row.mlb_avg_arm_rot_vel,
          mlbAvgMaxPelvisTurn: row.mlb_avg_max_pelvis_turn,
          mlbAvgMaxShoulderTurn: row.mlb_avg_max_shoulder_turn,
          mlbAvgXFactor: row.mlb_avg_x_factor,
          // Posture
          frontalTiltFootDown: row.frontal_tilt_foot_down,
          frontalTiltMaxHandVelo: row.frontal_tilt_max_hand_velo,
          lateralTiltFootDown: row.lateral_tilt_foot_down,
          lateralTiltMaxHandVelo: row.lateral_tilt_max_hand_velo,
          // COM position
          comDistNegMove: row.com_dist_neg_move,
          comDistFootDown: row.com_dist_foot_down,
          comDistMaxForward: row.com_dist_max_forward,
          strideLengthMeters: row.stride_length_meters,
          strideLengthPctHeight: row.stride_length_pct_height,
          weightShift: row.weight_shift,
          // COM velocity
          peakCOMVelocity: row.peak_com_velocity,
          minCOMVelocity: row.min_com_velocity,
          comAvgAccelRate: row.com_avg_accel_rate,
          comAvgDecelRate: row.com_avg_decel_rate,
          bracingEfficiency: row.bracing_efficiency,
          // Player physical
          height: row.player_height ?? row.height,
          weight: row.player_weight ?? row.weight,
          bodyMass: row.body_mass,
          // Power
          rotationalPower: row.rotational_power,
          linearPower: row.linear_power,
          totalPower: row.total_power,
          // Legacy fields
          hipShoulderSeparation: row.hip_shoulder_separation,
          verticalBatAngle: row.vertical_bat_angle,
          connectionAtImpact: row.connection_at_impact,
          postureAngle: row.posture_angle,
          earlyConnection: row.early_connection,
          momentumDirectionAngle: row.momentum_direction_angle,
          forwardMomentumPct: row.forward_momentum_pct,
          transferEfficiency: row.transfer_efficiency,
          energyTransferEfficiency: row.energy_transfer_efficiency,
        },
        scores: {
          fireDurationScore: row.fire_duration_score,
          tempoRatioScore: row.tempo_ratio_score,
          bodyScore: row.body_score,
          archetype: row.archetype,
        }
      }));

      setReports(loadedReports);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reboot_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report deleted successfully');
      setCoachRickInsights(null); // Clear insights when report deleted
      await loadReports();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const generateCoachRickInsights = async (report: RebootReport) => {
    if (!report) return;
    
    setLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('coach-rick-analysis', {
        body: {
          reportData: {
            loadDuration: report.metrics.loadDuration,
            fireDuration: report.metrics.fireDuration,
            tempoRatio: report.metrics.tempoRatio,
            pelvisShoulderGap: report.metrics.kinematicSequenceGap,
            peakPelvisRotVel: report.metrics.peakPelvisRotVel,
            peakShoulderRotVel: report.metrics.peakShoulderRotVel,
            peakArmRotVel: report.metrics.peakArmRotVel,
            xFactor: report.metrics.xFactor,
            totalPelvisRotation: report.metrics.totalPelvisRotation,
            totalShoulderRotation: report.metrics.totalShoulderRotation,
            comAvgDecelRate: report.metrics.comAvgDecelRate,
            comAvgAccelRate: report.metrics.comAvgAccelRate,
            bracingEfficiency: report.metrics.bracingEfficiency,
            weightShift: report.metrics.weightShift,
            comDistNegMove: report.metrics.comDistNegMove,
            comDistFootDown: report.metrics.comDistFootDown,
            comDistMaxForward: report.metrics.comDistMaxForward,
            peakCOMVelocity: report.metrics.peakCOMVelocity,
            overallConsistency: report.metrics.overallConsistency,
            pelvisConsistency: report.metrics.pelvisConsistency,
            shoulderConsistency: report.metrics.shoulderConsistency,
            armConsistency: report.metrics.armConsistency,
            mlbAvgPelvisRotVel: report.metrics.mlbAvgPelvisRotVel,
            mlbAvgShoulderRotVel: report.metrics.mlbAvgShoulderRotVel,
            mlbAvgArmRotVel: report.metrics.mlbAvgArmRotVel,
          },
          context: 'Reboot Analysis - Latest Report'
        }
      });

      if (error) throw error;
      
      if (data?.insights) {
        setCoachRickInsights(data.insights);
      }
    } catch (error: any) {
      console.error('Error generating Coach Rick insights:', error);
      // Don't show error toast, just silently fail
    } finally {
      setLoadingInsights(false);
    }
  };

  const calculateMetrics = (data: {
    negativeMoveTime: number;
    maxPelvisTurnTime: number;
    maxShoulderTurnTime: number;
    maxXFactorTime: number;
  }) => {
    // Load Duration (ms) = (Negative Move Time - Max Pelvis Turn Time) × 1000
    const loadDuration = (data.negativeMoveTime - data.maxPelvisTurnTime) * 1000;
    
    // Fire Duration (ms) = Max Pelvis Turn Time × 1000
    const fireDuration = data.maxPelvisTurnTime * 1000;
    
    // Tempo Ratio = Load Duration ÷ Fire Duration
    const tempoRatio = loadDuration / fireDuration;
    
    // Kinematic Sequence Gap = Max Pelvis Turn Time - Max Shoulder Turn Time
    const kinematicSequenceGap = (data.maxPelvisTurnTime - data.maxShoulderTurnTime) * 1000;

    return {
      loadDuration: Math.round(loadDuration),
      fireDuration: Math.round(fireDuration),
      tempoRatio: Math.round(tempoRatio * 100) / 100,
      kinematicSequenceGap: Math.round(kinematicSequenceGap)
    };
  };

  const calculateScores = (metrics: ReturnType<typeof calculateMetrics>) => {
    // Fire Duration Scoring
    let fireDurationScore = 0;
    if (metrics.fireDuration >= 130 && metrics.fireDuration <= 150) {
      fireDurationScore = 100; // Excellent
    } else if (metrics.fireDuration > 150 && metrics.fireDuration <= 200) {
      fireDurationScore = 85; // Good
    } else if (metrics.fireDuration > 200 && metrics.fireDuration <= 250) {
      fireDurationScore = 70; // Developing
    } else {
      fireDurationScore = 50; // Needs Work
    }

    // Tempo Ratio Scoring
    let tempoRatioScore = 0;
    if (metrics.tempoRatio >= 2.0 && metrics.tempoRatio <= 2.6) {
      tempoRatioScore = 100; // Optimal
    } else if (metrics.tempoRatio > 2.6 && metrics.tempoRatio <= 3.5) {
      tempoRatioScore = 95; // Elite
    } else if (metrics.tempoRatio < 2.0) {
      tempoRatioScore = 60; // Rushed
    } else {
      tempoRatioScore = 70; // Over-whip
    }

    // Body Score (average of both)
    const bodyScore = Math.round((fireDurationScore + tempoRatioScore) / 2);

    // Archetype Classification
    let archetype = "";
    if (metrics.tempoRatio > 2.6 && metrics.fireDuration < 200) {
      archetype = "Elite Whipper";
    } else if (metrics.tempoRatio >= 2.0 && metrics.tempoRatio <= 2.6 && metrics.fireDuration >= 150 && metrics.fireDuration <= 200) {
      archetype = "Spinner";
    } else if (metrics.tempoRatio < 2.0) {
      archetype = "Rushed";
    } else if (metrics.tempoRatio > 3.5) {
      archetype = "Over-whip";
    } else {
      archetype = "Developing";
    }

    return {
      fireDurationScore,
      tempoRatioScore,
      bodyScore,
      archetype
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);
    toast.loading('Processing Reboot Motion report...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload PDF to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/reboot-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Parse PDF to extract metrics
      const filePath = `swing-videos/${fileName}`;
      
      const { data: parsedData, error: parseError } = await supabase.functions
        .invoke('parse-reboot-pdf', {
          body: { filePath, extractTiming: true }
        });

      if (parseError) throw parseError;

      // Get player profile for height/weight
      const { data: players } = await supabase
        .from('players')
        .select('height, weight')
        .eq('user_id', user.id)
        .limit(1);
      
      const playerData = players?.[0];
      
      // Use player data from system only
      const playerHeight = playerData?.height ?? null;
      const playerWeight = playerData?.weight ?? null;
      const bodyMass = playerWeight ? playerWeight * 0.453592 : null;
      
      // Notify user if height/weight is missing
      if (!playerHeight || !playerWeight) {
        toast.warning('Player height/weight not found. Please update in your profile for accurate analysis.');
      }

      // Process extracted data
      const timingData = parsedData?.timing || {};
      const biomechanicsData = parsedData?.biomechanics || {};
      const consistencyData = parsedData?.consistency || {};
      const rotationData = parsedData?.rotation || {};
      const xFactorProgressionData = parsedData?.xFactorProgression || {};
      const mlbComparisonData = parsedData?.mlbComparison || {};
      const postureData = parsedData?.posture || {};
      const comPositionData = parsedData?.comPosition || {};
      const comVelocityData = parsedData?.comVelocity || {};
      const powerData = parsedData?.power || {};

      // Get the report date from the PDF or use today as fallback
      const reportDateStr = parsedData?.reportDate || new Date().toISOString().split('T')[0];
      const reportDate = new Date(reportDateStr);

      const metrics = calculateMetrics(timingData);
      const scores = calculateScores(metrics);

      // Get storage URL for the PDF
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Save to database with ALL extracted data
      const { data: savedReport, error: saveError } = await supabase
        .from('reboot_reports')
        .insert({
          user_id: user.id,
          pdf_url: publicUrl,
          label: `Report ${reports.length + 1}`,
          report_date: reportDate.toISOString().split('T')[0],
          // Timing data
          negative_move_time: timingData.negativeMoveTime ?? null,
          max_pelvis_turn_time: timingData.maxPelvisTurnTime ?? null,
          max_shoulder_turn_time: timingData.maxShoulderTurnTime ?? null,
          max_x_factor_time: timingData.maxXFactorTime ?? null,
          load_duration: timingData.loadDuration ?? metrics.loadDuration,
          fire_duration: timingData.fireDuration ?? metrics.fireDuration,
          tempo_ratio: timingData.tempoRatio ?? metrics.tempoRatio,
          kinematic_sequence_gap: metrics.kinematicSequenceGap,
          pelvis_shoulder_gap: timingData.pelvisShoulderGap ?? null,
          // Core biomechanics
          x_factor_angle: biomechanicsData.xFactorAngle ?? null,
          peak_pelvis_rot_vel: biomechanicsData.peakPelvisRotVel ?? null,
          peak_shoulder_rot_vel: biomechanicsData.peakShoulderRotVel ?? null,
          peak_arm_rot_vel: biomechanicsData.peakArmRotVel ?? null,
          peak_bat_speed: biomechanicsData.peakBatSpeed ?? null,
          attack_angle: biomechanicsData.attackAngle ?? null,
          // Consistency metrics
          peak_pelvis_rot_vel_std_dev: consistencyData.peakPelvisRotVelStdDev ?? null,
          peak_shoulder_rot_vel_std_dev: consistencyData.peakShoulderRotVelStdDev ?? null,
          peak_arm_rot_vel_std_dev: consistencyData.peakArmRotVelStdDev ?? null,
          pelvis_consistency: consistencyData.pelvisConsistency ?? null,
          shoulder_consistency: consistencyData.shoulderConsistency ?? null,
          arm_consistency: consistencyData.armConsistency ?? null,
          overall_consistency: consistencyData.overallConsistency ?? null,
          // Rotation progression
          pelvis_direction_stance: rotationData.pelvisDirectionStance ?? null,
          pelvis_direction_neg_move: rotationData.pelvisDirectionNegMove ?? null,
          pelvis_direction_max_pelvis: rotationData.pelvisDirectionMaxPelvis ?? null,
          pelvis_direction_impact: rotationData.pelvisDirectionImpact ?? null,
          shoulder_direction_stance: rotationData.shoulderDirectionStance ?? null,
          shoulder_direction_neg_move: rotationData.shoulderDirectionNegMove ?? null,
          shoulder_direction_max_shoulder: rotationData.shoulderDirectionMaxShoulder ?? null,
          shoulder_direction_impact: rotationData.shoulderDirectionImpact ?? null,
          total_pelvis_rotation: rotationData.totalPelvisRotation ?? null,
          total_shoulder_rotation: rotationData.totalShoulderRotation ?? null,
          // X-Factor progression
          x_factor_stance: xFactorProgressionData.xFactorStance ?? null,
          x_factor_neg_move: xFactorProgressionData.xFactorNegMove ?? null,
          x_factor_max_pelvis: xFactorProgressionData.xFactorMaxPelvis ?? null,
          x_factor_impact: xFactorProgressionData.xFactorImpact ?? null,
          // MLB comparison
          mlb_avg_pelvis_rot_vel: mlbComparisonData.mlbAvgPelvisRotVel ?? null,
          mlb_avg_shoulder_rot_vel: mlbComparisonData.mlbAvgShoulderRotVel ?? null,
          mlb_avg_arm_rot_vel: mlbComparisonData.mlbAvgArmRotVel ?? null,
          mlb_avg_max_pelvis_turn: mlbComparisonData.mlbAvgMaxPelvisTurn ?? null,
          mlb_avg_max_shoulder_turn: mlbComparisonData.mlbAvgMaxShoulderTurn ?? null,
          mlb_avg_x_factor: mlbComparisonData.mlbAvgXFactor ?? null,
          // Posture
          frontal_tilt_foot_down: postureData.frontalTiltFootDown ?? null,
          frontal_tilt_max_hand_velo: postureData.frontalTiltMaxHandVelo ?? null,
          lateral_tilt_foot_down: postureData.lateralTiltFootDown ?? null,
          lateral_tilt_max_hand_velo: postureData.lateralTiltMaxHandVelo ?? null,
          // COM position
          com_dist_neg_move: comPositionData.comDistNegMove ?? null,
          com_dist_foot_down: comPositionData.comDistFootDown ?? null,
          com_dist_max_forward: comPositionData.comDistMaxForward ?? null,
          stride_length_meters: comPositionData.strideLengthMeters ?? null,
          stride_length_pct_height: comPositionData.strideLengthPctHeight ?? null,
          weight_shift: comPositionData.weightShift ?? null,
          // COM velocity
          peak_com_velocity: comVelocityData.peakCOMVelocity ?? null,
          min_com_velocity: comVelocityData.minCOMVelocity ?? null,
          com_avg_accel_rate: comVelocityData.comAvgAccelRate ?? null,
          com_avg_decel_rate: comVelocityData.comAvgDecelRate ?? null,
          bracing_efficiency: comVelocityData.bracingEfficiency ?? null,
          // Player physical data (from PDF or player profile)
          player_height: playerHeight,
          player_weight: playerWeight,
          body_mass: bodyMass,
          // Legacy player fields
          height: playerHeight,
          weight: playerWeight,
          // Power
          rotational_power: powerData.rotationalPower ?? null,
          linear_power: powerData.linearPower ?? null,
          total_power: powerData.totalPower ?? null,
          // Scores
          fire_duration_score: scores.fireDurationScore,
          tempo_ratio_score: scores.tempoRatioScore,
          body_score: scores.bodyScore,
          archetype: scores.archetype,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Reload reports from database
      await loadReports();
      
      // Generate Coach Rick insights for the new report
      const latestReport = reports[reports.length - 1];
      if (latestReport) {
        generateCoachRickInsights(latestReport);
      }
      
      toast.dismiss();
      toast.success('Report processed and saved successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to process report');
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getArchetypeColor = (archetype: string) => {
    if (archetype === "Elite Whipper") return "bg-green-500/10 text-green-600 border-green-500";
    if (archetype === "Spinner") return "bg-blue-500/10 text-blue-600 border-blue-500";
    if (archetype === "Rushed") return "bg-orange-500/10 text-orange-600 border-orange-500";
    if (archetype === "Over-whip") return "bg-purple-500/10 text-purple-600 border-purple-500";
    return "bg-gray-500/10 text-gray-600 border-gray-500";
  };

  const compareReports = () => {
    const [beforeId, afterId] = selectedReportIds;
    if (!beforeId || !afterId) return null;

    const before = reports.find(r => r.id === beforeId);
    const after = reports.find(r => r.id === afterId);
    if (!before || !after) return null;

    return {
      before,
      after,
      deltas: {
        loadDuration: after.metrics.loadDuration - before.metrics.loadDuration,
        fireDuration: after.metrics.fireDuration - before.metrics.fireDuration,
        tempoRatio: after.metrics.tempoRatio - before.metrics.tempoRatio,
        bodyScore: after.scores.bodyScore - before.scores.bodyScore
      }
    };
  };

  const comparison = compareReports();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background px-6 pt-8 pb-6 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">4B Motion Analysis</h1>
            <p className="text-muted-foreground">
              Reboot Motion 3D Tempo Calculator & Progress Tracker
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            📊 Powered by Reboot Motion
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload & Calculate</TabsTrigger>
            <TabsTrigger value="compare">Compare Reports</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-muted-foreground">Loading reports...</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Reboot Motion Report</CardTitle>
                <CardDescription>
                  Upload your Reboot Motion PDF report to automatically extract timing data and calculate tempo metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="reboot-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="reboot-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">
                        {uploading ? 'Processing...' : 'Click to upload PDF'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to select
                      </p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Latest Report */}
            {reports.length > 0 && (() => {
              const latest = reports[reports.length - 1];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Latest Analysis</h2>
                    <div className="text-sm text-muted-foreground">
                      Report Date: <span className="font-semibold">{latest.reportDate.toLocaleDateString()}</span>
                      {latest.uploadDate.toDateString() !== latest.reportDate.toDateString() && (
                        <span className="ml-2 text-xs">
                          (Uploaded: {latest.uploadDate.toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Metrics Overview */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">Load</Badge>
                            <InfoTooltip content="Load Duration is the time from initial movement to maximum pelvis rotation. Optimal range: 400-700ms. This represents the energy storage phase of the swing." />
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{latest.metrics.loadDuration}ms</div>
                        <p className="text-sm text-muted-foreground">Load Duration</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Zap className="h-5 w-5 text-orange-500" />
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">Fire</Badge>
                            <InfoTooltip content="Fire Duration is the time from maximum pelvis rotation to contact. Elite range: 130-150ms. This is the explosive energy release phase where power is transferred through the kinetic chain." />
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{latest.metrics.fireDuration}ms</div>
                        <p className="text-sm text-muted-foreground">Fire Duration</p>
                        <div className="mt-2">
                          <Progress value={latest.scores.fireDurationScore} className="h-2" />
                          <p className={`text-xs mt-1 font-semibold ${getScoreColor(latest.scores.fireDurationScore)}`}>
                            {latest.scores.fireDurationScore >= 90 ? 'Excellent' : 
                             latest.scores.fireDurationScore >= 75 ? 'Good' : 'Developing'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="h-5 w-5 text-green-500" />
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">Ratio</Badge>
                            <InfoTooltip content="Tempo Ratio = Load Duration ÷ Fire Duration. Optimal: 2.0-2.6:1, Elite: 2.6-3.5:1. This ratio indicates timing efficiency and power accumulation. Too low = rushed, too high = over-whip." />
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{latest.metrics.tempoRatio}:1</div>
                        <p className="text-sm text-muted-foreground">Tempo Ratio</p>
                        <div className="mt-2">
                          <Progress value={latest.scores.tempoRatioScore} className="h-2" />
                          <p className={`text-xs mt-1 font-semibold ${getScoreColor(latest.scores.tempoRatioScore)}`}>
                            {latest.metrics.tempoRatio >= 2.0 && latest.metrics.tempoRatio <= 2.6 ? 'Optimal' :
                             latest.metrics.tempoRatio > 2.6 && latest.metrics.tempoRatio <= 3.5 ? 'Elite' : 
                             latest.metrics.tempoRatio < 2.0 ? 'Rushed' : 'Over-whip'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">4B</Badge>
                            <InfoTooltip content="Body Score is calculated from Fire Duration and Tempo Ratio scores. This composite metric reflects overall swing efficiency and timing quality in the BODY pillar of the 4 B's framework." />
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{latest.scores.bodyScore}</div>
                        <p className="text-sm text-muted-foreground">Body Score</p>
                        <Badge className={`mt-2 ${getArchetypeColor(latest.scores.archetype)}`}>
                          {latest.scores.archetype}
                        </Badge>
                      </CardContent>
                     </Card>
                   </div>

                   {/* Coach Rick Insights */}
                   <CoachRickInsightCard 
                     insights={coachRickInsights || {
                       mainMessage: "Analyzing your latest swing...",
                     }}
                     loading={loadingInsights}
                   />

                   {/* Kinematic Sequence Bar Chart */}
                   <KinematicSequenceBarChart metrics={latest.metrics} />

                  {/* Key Biomechanics */}
                  <KeyBiomechanics metrics={latest.metrics} />

                  {/* Momentum Analysis */}
                  <MomentumAnalysis metrics={latest.metrics} />

                  {/* Power Generation */}
                  <PowerGeneration 
                    metrics={{
                      rotationalPower: latest.metrics.rotationalPower,
                      linearPower: latest.metrics.linearPower,
                      totalPower: latest.metrics.totalPower,
                    }} 
                  />

                  {/* Detailed Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-semibold mb-2">Extracted Timing Data</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Negative Move:</span>
                              <span className="font-medium">{latest.metrics.negativeMoveTime.toFixed(3)}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Pelvis Turn:</span>
                              <span className="font-medium">{latest.metrics.maxPelvisTurnTime.toFixed(3)}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Shoulder Turn:</span>
                              <span className="font-medium">{latest.metrics.maxShoulderTurnTime.toFixed(3)}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max X Factor:</span>
                              <span className="font-medium">{latest.metrics.maxXFactorTime.toFixed(3)}s</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Calculated Metrics</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Load Duration:</span>
                              <span className="font-medium">{latest.metrics.loadDuration}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fire Duration:</span>
                              <span className="font-medium">{latest.metrics.fireDuration}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tempo Ratio:</span>
                              <span className="font-medium">{latest.metrics.tempoRatio}:1</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sequence Gap:</span>
                              <span className="font-medium">{latest.metrics.kinematicSequenceGap}ms</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coaching Recommendations */}
                      <Alert>
                        <AlertDescription>
                          <h4 className="font-semibold mb-2">💡 Coaching Recommendations:</h4>
                          {latest.scores.archetype === "Elite Whipper" && (
                            <p>Excellent tempo! Your fire duration is explosive ({latest.metrics.fireDuration}ms) and tempo ratio is optimal. Focus on maintaining this elite timing pattern.</p>
                          )}
                          {latest.scores.archetype === "Spinner" && (
                            <p>Good balanced approach. Your tempo ratio ({latest.metrics.tempoRatio}:1) is in the optimal range. Work on reducing fire duration to break into elite territory.</p>
                          )}
                          {latest.scores.archetype === "Rushed" && (
                            <p>Your tempo ratio is below optimal ({latest.metrics.tempoRatio}:1). Focus on extending your load phase to build more energy before firing.</p>
                          )}
                          {latest.scores.archetype === "Over-whip" && (
                            <p>Your load phase may be too long ({latest.metrics.loadDuration}ms). Work on more explosive hip rotation to reduce your tempo ratio.</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Comparison View - Only if multiple reports */}
                  {reports.length >= 2 && (
                    <RebootComparisonView reports={reports} />
                  )}
                </div>
              );
            })()}
              </>
            )}
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            {reports.length < 2 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Upload at least 2 reports to compare progress</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Report Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Reports to Compare</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Before (Baseline)</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedReportIds[0] || ''}
                        onChange={(e) => setSelectedReportIds([e.target.value, selectedReportIds[1]])}
                      >
                        <option value="">Select report...</option>
                        {reports.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.label} - {r.uploadDate.toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">After (Current)</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedReportIds[1] || ''}
                        onChange={(e) => setSelectedReportIds([selectedReportIds[0], e.target.value])}
                      >
                        <option value="">Select report...</option>
                        {reports.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.label} - {r.reportDate.toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison Results */}
                {comparison && (
                  <div className="space-y-4">
                    {/* Progress Summary */}
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription>
                        <h4 className="font-semibold mb-2">📊 Progress Summary</h4>
                        <p>
                          Body Score: {comparison.after.scores.bodyScore}/100 
                          {comparison.deltas.bodyScore > 0 ? (
                            <span className="text-green-600 ml-2">↑ {comparison.deltas.bodyScore} points</span>
                          ) : comparison.deltas.bodyScore < 0 ? (
                            <span className="text-red-600 ml-2">↓ {Math.abs(comparison.deltas.bodyScore)} points</span>
                          ) : (
                            <span className="text-gray-600 ml-2">→ No change</span>
                          )}
                        </p>
                        <p className="mt-1">
                          Archetype: {comparison.before.scores.archetype} → {comparison.after.scores.archetype}
                          {comparison.before.scores.archetype !== comparison.after.scores.archetype && " ⭐"}
                        </p>
                      </AlertDescription>
                    </Alert>

                    {/* Side-by-Side Comparison */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Before */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Before</CardTitle>
                          <CardDescription>{comparison.before.reportDate.toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Load Duration:</span>
                            <span className="font-medium">{comparison.before.metrics.loadDuration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Fire Duration:</span>
                            <span className="font-medium">{comparison.before.metrics.fireDuration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tempo Ratio:</span>
                            <span className="font-medium">{comparison.before.metrics.tempoRatio}:1</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Body Score:</span>
                            <span className="font-medium">{comparison.before.scores.bodyScore}/100</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* After */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">After</CardTitle>
                          <CardDescription>{comparison.after.reportDate.toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Load Duration:</span>
                            <span className="font-medium">
                              {comparison.after.metrics.loadDuration}ms
                              {comparison.deltas.loadDuration !== 0 && (
                                <span className={`ml-2 text-xs ${comparison.deltas.loadDuration > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparison.deltas.loadDuration > 0 ? '↑' : '↓'} {Math.abs(comparison.deltas.loadDuration)}ms
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Fire Duration:</span>
                            <span className="font-medium">
                              {comparison.after.metrics.fireDuration}ms
                              {comparison.deltas.fireDuration !== 0 && (
                                <span className={`ml-2 text-xs ${comparison.deltas.fireDuration < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparison.deltas.fireDuration > 0 ? '↑' : '↓'} {Math.abs(comparison.deltas.fireDuration)}ms
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tempo Ratio:</span>
                            <span className="font-medium">
                              {comparison.after.metrics.tempoRatio}:1
                              {comparison.deltas.tempoRatio !== 0 && (
                                <span className={`ml-2 text-xs ${comparison.deltas.tempoRatio > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                  {comparison.deltas.tempoRatio > 0 ? '↑' : '↓'} {Math.abs(comparison.deltas.tempoRatio).toFixed(2)}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Body Score:</span>
                            <span className="font-medium">
                              {comparison.after.scores.bodyScore}/100
                              {comparison.deltas.bodyScore !== 0 && (
                                <span className={`ml-2 text-xs ${comparison.deltas.bodyScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparison.deltas.bodyScore > 0 ? '↑' : '↓'} {Math.abs(comparison.deltas.bodyScore)} pts
                                </span>
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <FourBMotionAnalysis playerId={undefined} />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}