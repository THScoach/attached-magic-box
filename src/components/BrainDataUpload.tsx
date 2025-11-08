import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileJson, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BrainDataUploadProps {
  playerId: string;
  onDataUploaded: () => void;
}

interface ParsedBrainMetrics {
  reactionTime: number;
  decisionAccuracy: number;
  visualRecognition: number;
  processingSpeed: number;
  focusScore: number;
  source: "s2" | "endres" | "manual";
}

export function BrainDataUpload({ playerId, onDataUploaded }: BrainDataUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [testDate, setTestDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const parseS2Report = async (text: string): Promise<ParsedBrainMetrics | null> => {
    // S2 Cognition report parsing logic
    const reactionTimeMatch = text.match(/reaction time[:\s]+(\d+\.?\d*)\s*ms/i);
    const decisionMatch = text.match(/decision accuracy[:\s]+(\d+\.?\d*)%/i);
    const visualMatch = text.match(/visual recognition[:\s]+(\d+\.?\d*)/i);
    const processingMatch = text.match(/processing speed[:\s]+(\d+\.?\d*)/i);
    const focusMatch = text.match(/focus score[:\s]+(\d+\.?\d*)/i);

    if (reactionTimeMatch) {
      return {
        reactionTime: parseFloat(reactionTimeMatch[1]),
        decisionAccuracy: decisionMatch ? parseFloat(decisionMatch[1]) : 0,
        visualRecognition: visualMatch ? parseFloat(visualMatch[1]) : 0,
        processingSpeed: processingMatch ? parseFloat(processingMatch[1]) : 0,
        focusScore: focusMatch ? parseFloat(focusMatch[1]) : 0,
        source: "s2"
      };
    }
    return null;
  };

  const parseEndresReport = async (text: string): Promise<ParsedBrainMetrics | null> => {
    // Endres testing format parsing logic
    const reactionMatch = text.match(/RT[:\s]+(\d+\.?\d*)/i);
    const accuracyMatch = text.match(/ACC[:\s]+(\d+\.?\d*)%/i);
    
    if (reactionMatch) {
      return {
        reactionTime: parseFloat(reactionMatch[1]),
        decisionAccuracy: accuracyMatch ? parseFloat(accuracyMatch[1]) : 0,
        visualRecognition: 0,
        processingSpeed: 0,
        focusScore: 0,
        source: "endres"
      };
    }
    return null;
  };

  const parseJSON = async (json: any): Promise<ParsedBrainMetrics | null> => {
    // Generic JSON parsing
    if (json.reactionTime || json.reaction_time) {
      return {
        reactionTime: json.reactionTime || json.reaction_time,
        decisionAccuracy: json.decisionAccuracy || json.decision_accuracy || 0,
        visualRecognition: json.visualRecognition || json.visual_recognition || 0,
        processingSpeed: json.processingSpeed || json.processing_speed || 0,
        focusScore: json.focusScore || json.focus_score || 0,
        source: json.source === "endres" ? "endres" : "s2"
      };
    }
    return null;
  };

  const handleFileUpload = async () => {
    if (!file || !playerId) {
      toast({
        title: "Missing Information",
        description: "Please select a file and ensure player is selected.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      let metrics: ParsedBrainMetrics | null = null;

      if (file.type === "application/json") {
        const json = JSON.parse(text);
        metrics = await parseJSON(json);
      } else {
        // Try S2 format first, then Endres
        metrics = await parseS2Report(text) || await parseEndresReport(text);
      }

      if (!metrics) {
        throw new Error("Unable to parse report. Please check file format.");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert brain metrics
      const { error } = await supabase.from("brain_metrics").insert({
        user_id: user.id,
        player_id: playerId,
        reaction_time: metrics.reactionTime,
        reaction_time_grade: calculateGrade(metrics.reactionTime, "reaction"),
        good_swings_percentage: metrics.decisionAccuracy,
        good_takes_percentage: metrics.decisionAccuracy * 0.9,
        chase_rate: 100 - metrics.decisionAccuracy,
        swing_decision_grade: calculateGrade(metrics.decisionAccuracy, "decision"),
        focus_score: metrics.focusScore,
        focus_grade: calculateGrade(metrics.focusScore, "focus"),
        consistency_rating: metrics.processingSpeed
      });

      if (error) throw error;

      toast({
        title: "Brain Data Uploaded",
        description: `Successfully imported ${metrics.source.toUpperCase()} cognition data.`
      });

      onDataUploaded();
      setFile(null);
      setTestDate("");
      setNotes("");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const calculateGrade = (value: number, type: string): number => {
    // Simple grading logic - should be enhanced based on benchmarks
    if (type === "reaction") {
      if (value < 200) return 95;
      if (value < 250) return 85;
      if (value < 300) return 75;
      return 65;
    }
    if (type === "decision" || type === "focus") {
      if (value >= 90) return 95;
      if (value >= 80) return 85;
      if (value >= 70) return 75;
      return 65;
    }
    return 75;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Brain/Cognition Test Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brain-file">S2 Cognition or Endres Report (PDF/JSON)</Label>
          <Input
            id="brain-file"
            type="file"
            accept=".pdf,.json,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: S2 Cognition reports, Endres testing results (PDF, JSON, or TXT)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-date">Test Date (Optional)</Label>
          <Input
            id="test-date"
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about the testing session..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleFileUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Upload & Parse Data"}
        </Button>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Supported Formats
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>S2 Cognition:</strong> Reaction time, decision accuracy, visual recognition</li>
            <li>• <strong>Endres Testing:</strong> RT (reaction time), ACC (accuracy)</li>
            <li>• <strong>JSON:</strong> Custom format with reactionTime, decisionAccuracy, etc.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
