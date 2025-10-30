import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseISO, isBefore } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubmitForLiveModalProps {
  sessionId: string;
  sessionTitle: string;
  submissionDeadline: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitForLiveModal({
  sessionId,
  sessionTitle,
  submissionDeadline,
  open,
  onOpenChange,
}: SubmitForLiveModalProps) {
  const [feelNotes, setFeelNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      checkSubmissionStatus();
      checkDeadline();
    }
  }, [open, sessionId]);

  const checkDeadline = () => {
    if (!submissionDeadline) {
      setDeadlinePassed(false);
      return;
    }

    // Convert to Central Time
    const deadlineDate = toZonedTime(parseISO(submissionDeadline), 'America/Chicago');
    const now = toZonedTime(new Date(), 'America/Chicago');
    setDeadlinePassed(isBefore(deadlineDate, now));
  };

  const checkSubmissionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("session_submissions")
        .select("id")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      setHasSubmitted(!!data);
    } catch (error) {
      console.error("Error checking submission status:", error);
    }
  };

  const handleRecordSwing = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to submit");
        return;
      }

      // Store session context for after recording
      localStorage.setItem("liveSubmissionContext", JSON.stringify({
        sessionId,
        feelNotes,
        submissionDeadline,
      }));

      // Navigate to analyze page
      navigate("/analyze");
      onOpenChange(false);
    } catch (error) {
      console.error("Error preparing submission:", error);
      toast.error("Failed to start recording");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExisting = async () => {
    if (!feelNotes.trim()) {
      toast.error("Please add feel notes before submitting");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to submit");
        return;
      }

      // Get latest analysis
      const { data: latestAnalysis } = await supabase
        .from("swing_analyses")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const isOnTime = !deadlinePassed;

      const { error } = await supabase
        .from("session_submissions")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          analysis_id: latestAnalysis?.id || null,
          feel_notes: feelNotes.trim(),
          is_on_time: isOnTime,
        });

      if (error) throw error;

      toast.success(
        isOnTime 
          ? "Swing submitted for live review!"
          : "Swing submitted (late submission)"
      );
      
      setHasSubmitted(true);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting for live:", error);
      toast.error("Failed to submit swing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit for Live Review</DialogTitle>
          <DialogDescription>
            {sessionTitle}
          </DialogDescription>
        </DialogHeader>

        {hasSubmitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-2">Already Submitted!</p>
            <p className="text-sm text-muted-foreground">
              Your swing has been submitted for this session.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissionDeadline && (
              <div className={`p-4 rounded-lg border ${deadlinePassed ? 'bg-destructive/10 border-destructive/20' : 'bg-muted'}`}>
                <p className="text-sm font-medium mb-1">
                  {deadlinePassed ? "⚠️ Deadline Passed" : "📅 Deadline"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(toZonedTime(parseISO(submissionDeadline), 'America/Chicago'), "MMM d @ h:mm a zzz")}
                </p>
                {deadlinePassed && (
                  <p className="text-xs text-destructive mt-2">
                    Late submissions are accepted but marked as late
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="feelNotes">Feel Notes (1-2 sentences)</Label>
              <Textarea
                id="feelNotes"
                placeholder="How did this swing feel? What are you working on?"
                value={feelNotes}
                onChange={(e) => setFeelNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tell Coach Rick what you want feedback on
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRecordSwing}
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                Record New Swing
              </Button>

              <Button
                onClick={handleSubmitExisting}
                disabled={loading || !feelNotes.trim()}
                variant="outline"
                className="w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Submit Latest Swing
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}