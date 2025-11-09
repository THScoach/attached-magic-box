import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, Upload, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { RebootProgressionTracker } from "./RebootProgressionTracker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface RebootData {
  kinematicSequence?: {
    pelvis: { peakVelocity: number; timing: number };
    torso: { peakVelocity: number; timing: number };
    leadArm: { peakVelocity: number; timing: number };
    bat: { peakVelocity: number; timing: number };
  };
  centerOfMass?: {
    maxForward: number;
    maxLateral: number;
    maxVertical: number;
  };
  swingPosture?: {
    frontalTilt: number;
    sideTilt: number;
  };
  xFactor?: {
    separation: number;
    maxCoil: number;
  };
  timestamp?: string;
}

interface RebootDataRecord {
  id: string;
  created_at: string;
  data: RebootData;
}

interface FourBMotionAnalysisProps {
  rebootData?: RebootData;
  playerId?: string;
  onUpload?: () => void;
}

export function FourBMotionAnalysis({ rebootData, playerId, onUpload }: FourBMotionAnalysisProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [allRebootData, setAllRebootData] = useState<RebootDataRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentData, setCurrentData] = useState<RebootData | undefined>(rebootData);

  // Load all Reboot data for this player
  useEffect(() => {
    if (playerId) {
      loadAllRebootData();
    }
  }, [playerId]);

  // Update current data when rebootData prop changes or selected date changes
  useEffect(() => {
    if (selectedDate && allRebootData.length > 0) {
      const selected = allRebootData.find(r => r.id === selectedDate);
      if (selected) {
        setCurrentData(selected.data);
      }
    } else if (rebootData) {
      setCurrentData(rebootData);
    }
  }, [rebootData, selectedDate, allRebootData]);

  const loadAllRebootData = async () => {
    if (!playerId) return;

    try {
      const { data, error } = await supabase
        .from('external_session_data')
        .select('id, created_at, extracted_metrics')
        .eq('player_id', playerId)
        .eq('data_source', 'reboot_motion')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const records: RebootDataRecord[] = (data || []).map(record => ({
        id: record.id,
        created_at: record.created_at,
        data: record.extracted_metrics as RebootData
      }));

      setAllRebootData(records);

      // Auto-select the most recent if not already selected
      if (records.length > 0 && !selectedDate) {
        setSelectedDate(records[0].id);
      }
    } catch (error) {
      console.error('Error loading Reboot data:', error);
    }
  };

  // No data state
  if (!currentData && allRebootData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardHeader>
          <CardTitle>4B Motion Analysis</CardTitle>
          <CardDescription>Upload your Reboot Motion file to unlock 4B Motion Analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onUpload} className="mt-4">
            <Upload className="h-4 w-4 mr-2" />
            Upload Reboot Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall quality
  const getOverallQuality = (): { label: string; emoji: string; color: string; description: string } => {
    if (!currentData) return { label: "No Data", emoji: "⚪", color: "text-muted-foreground", description: "Upload data to see analysis" };
    const { kinematicSequence, centerOfMass } = currentData;
    
    // Check sequence order
    const sequenceCorrect = kinematicSequence && 
      kinematicSequence.pelvis.timing < kinematicSequence.torso.timing &&
      kinematicSequence.torso.timing < kinematicSequence.leadArm.timing &&
      kinematicSequence.leadArm.timing < kinematicSequence.bat.timing;
    
    // Check COM
    const comGood = centerOfMass && 
      centerOfMass.maxForward >= 50 && 
      centerOfMass.maxForward <= 70;

    if (sequenceCorrect && comGood) {
      return {
        label: "Good",
        emoji: "🟢",
        color: "text-green-600",
        description: "Your lower-half sequencing is efficient with good weight transfer."
      };
    } else if (!sequenceCorrect && comGood) {
      return {
        label: "Fair",
        emoji: "🟡",
        color: "text-yellow-600",
        description: "Your lower-half sequencing has timing leaks. COM movement is solid."
      };
    } else {
      return {
        label: "Needs Work",
        emoji: "🔴",
        color: "text-red-600",
        description: "Focus on hip-torso sequencing and weight transfer."
      };
    }
  };

  // Sequence analysis
  const getSequenceAnalysis = () => {
    if (!currentData) return null;
    const { kinematicSequence } = currentData;
    if (!kinematicSequence) return null;

    const parts = [
      { name: "Hips", timing: kinematicSequence.pelvis.timing, velocity: kinematicSequence.pelvis.peakVelocity },
      { name: "Torso", timing: kinematicSequence.torso.timing, velocity: kinematicSequence.torso.peakVelocity },
      { name: "Arms", timing: kinematicSequence.leadArm.timing, velocity: kinematicSequence.leadArm.peakVelocity },
      { name: "Bat", timing: kinematicSequence.bat.timing, velocity: kinematicSequence.bat.peakVelocity }
    ];

    const sorted = [...parts].sort((a, b) => a.timing - b.timing);
    const correct = JSON.stringify(sorted) === JSON.stringify(parts);

    return { parts, correct, sorted };
  };

  // COM analysis
  const getCOMAnalysis = () => {
    if (!currentData) return null;
    const { centerOfMass } = currentData;
    if (!centerOfMass) return null;

    const forward = centerOfMass.maxForward;
    let status: "good" | "warning" | "poor" = "good";
    let message = "In target range";

    if (forward < 45 || forward > 75) {
      status = "poor";
      message = forward < 45 ? "Too little weight transfer" : "Excessive weight shift";
    } else if (forward < 50 || forward > 70) {
      status = "warning";
      message = "Slightly outside optimal range";
    }

    return { forward, status, message };
  };

  // Posture analysis
  const getPostureAnalysis = () => {
    if (!currentData) return null;
    const { swingPosture } = currentData;
    if (!swingPosture) return null;

    const frontalStatus = Math.abs(swingPosture.frontalTilt) < 45 ? "Stable" : "Monitor";
    const sideStatus = Math.abs(swingPosture.sideTilt) < 15 ? "Stable" : "Slight lean, monitor";

    return {
      frontal: { value: swingPosture.frontalTilt, status: frontalStatus },
      side: { value: swingPosture.sideTilt, status: sideStatus }
    };
  };

  const quality = getOverallQuality();
  const sequence = getSequenceAnalysis();
  const com = getCOMAnalysis();
  const posture = getPostureAnalysis();
  const xFactor = currentData?.xFactor;
  const timestamp = currentData?.timestamp;

  return (
    <div className="space-y-6">
      {/* 1. 4B Motion Summary */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>4B Motion Analysis</CardTitle>
                <CardDescription>
                  Source: Reboot Motion
                </CardDescription>
              </div>
              <Badge variant="outline">4B Pillar: Body</Badge>
            </div>
            
            {/* Date Selector */}
            {allRebootData.length > 0 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {allRebootData.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {format(new Date(record.created_at), 'MMM dd, yyyy h:mm a')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onUpload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              Overall Motion Quality: <span className={quality.color}>{quality.emoji} {quality.label}</span>
            </p>
            <p className="text-muted-foreground">{quality.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Body Sequence - Energy Transfer */}
      {sequence && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Body Sequence (Energy Transfer)</CardTitle>
              <Badge variant="outline">4B Pillar: Body</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sequence Visual */}
            <div className="flex items-center gap-2">
              {sequence.parts.map((part, idx) => (
                <div key={part.name} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-muted-foreground">→</span>}
                  <div
                    className={`px-3 py-2 rounded-lg font-medium ${
                      sequence.correct
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {part.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <Alert className={sequence.correct ? "bg-green-50 dark:bg-green-900/10" : "bg-yellow-50 dark:bg-yellow-900/10"}>
              <AlertDescription>
                {sequence.correct ? (
                  <>
                    <strong>Order: Correct (Hips → Torso → Arms → Bat) ✅</strong>
                    <p className="mt-1 text-sm">Energy is flowing efficiently through your kinetic chain.</p>
                  </>
                ) : (
                  <>
                    <strong>Sequence Issue Detected ❌</strong>
                    <p className="mt-1 text-sm">
                      Actual order: {sequence.sorted.map(p => p.name).join(" → ")} — losing power.
                    </p>
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* Coaching Tip */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">💡 Coaching Tip:</p>
              <p className="text-sm text-muted-foreground">
                {sequence.correct
                  ? "Maintain this sequencing. Focus on increasing velocity through each segment."
                  : "Drill: Step-behind hip fire to feel hips start first. Load and explode from the ground up."}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">Data Source: Reboot Motion</p>
          </CardContent>
        </Card>
      )}

      {/* 3. Body Control - COM & Posture */}
      {(com || posture || xFactor) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Body Control (Balance & Coil)</CardTitle>
              <Badge variant="outline">4B Pillar: Body</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* COM Bar */}
              {com && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Center of Mass (Weight Transfer)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Max Forward Move</span>
                      <span className="font-medium">{com.forward.toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          com.status === "good"
                            ? "bg-green-500"
                            : com.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(com.forward, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{com.message}</p>
                  </div>
                </div>
              )}

              {/* Posture Tiles */}
              {posture && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Posture Angles</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Frontal Tilt</p>
                      <p className="text-lg font-bold">{posture.frontal.value.toFixed(1)}°</p>
                      <p className="text-xs">{posture.frontal.status}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Side Tilt</p>
                      <p className="text-lg font-bold">{posture.side.value.toFixed(1)}°</p>
                      <p className="text-xs">{posture.side.status}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* X-Factor */}
            {xFactor && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Hip-Shoulder Separation (X-Factor)</h4>
                <p className="text-sm">
                  <strong>Separation: {xFactor.separation.toFixed(1)}°</strong>
                  {xFactor.separation < 30 && (
                    <span className="text-muted-foreground"> – Room to build more stretch for power.</span>
                  )}
                  {xFactor.separation >= 30 && xFactor.separation < 45 && (
                    <span className="text-muted-foreground"> – Good separation range.</span>
                  )}
                  {xFactor.separation >= 45 && (
                    <span className="text-muted-foreground"> – Excellent coil and stretch.</span>
                  )}
                </p>
              </div>
            )}

            {/* Coaching Tip */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">💡 Coaching Tip:</p>
              <p className="text-sm text-muted-foreground">
                {xFactor && xFactor.separation < 30
                  ? "Drill: Coil and hold to increase hip-shoulder separation. Feel the stretch before firing."
                  : "Maintain balance through contact. Practice slow-motion swings to feel optimal posture."}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">Data Source: Reboot Motion</p>
          </CardContent>
        </Card>
      )}

      {/* Progress Over Time */}
      {playerId && currentData && (
        <RebootProgressionTracker playerId={playerId} currentData={currentData} />
      )}

      {/* 4. Advanced Coach View */}
      {sequence && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">📈 Advanced Coach View (Coaches Only)</CardTitle>
                  <ChevronDown className={`h-5 w-5 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Detailed biomechanical data for coaching analysis. Players can focus on the simplified sections above.
                  </AlertDescription>
                </Alert>

                {/* Angular Velocity Data */}
                <div>
                  <h4 className="font-semibold mb-2">Angular Velocity (deg/sec)</h4>
                  <div className="space-y-2">
                    {sequence.parts.map((part) => (
                      <div key={part.name} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm font-medium">{part.name}</span>
                        <div className="text-right">
                          <p className="text-sm font-mono">{part.velocity.toFixed(1)}°/s</p>
                          <p className="text-xs text-muted-foreground">
                            @ {(part.timing * 1000).toFixed(0)}ms
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MLB Comparison */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">MLB / Elite Comparison</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>• Pelvis Peak Velocity: 500-700°/s (Elite)</p>
                    <p>• Torso Peak Velocity: 800-1100°/s (Elite)</p>
                    <p>• X-Factor Separation: 40-60° (Elite)</p>
                    <p>• COM Forward: 50-70% (Optimal)</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">Data Source: Reboot Motion</p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
