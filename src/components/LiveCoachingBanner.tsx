import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, differenceInMinutes, isBefore } from "date-fns";
import { useNavigate } from "react-router-dom";

interface LiveSession {
  id: string;
  session_date: string;
  session_time: string;
  title: string;
  description: string;
  status: string;
  live_link: string | null;
  submission_deadline: string | null;
}

export function LiveCoachingBanner() {
  const [nextSession, setNextSession] = useState<LiveSession | null>(null);
  const [countdown, setCountdown] = useState("");
  const [canJoin, setCanJoin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNextSession();
    const interval = setInterval(loadNextSession, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!nextSession) return;

    const updateCountdown = () => {
      const sessionDateTime = parseISO(`${nextSession.session_date}T${nextSession.session_time}`);
      const now = new Date();
      const minutesUntil = differenceInMinutes(sessionDateTime, now);

      // Can join 30 minutes before
      setCanJoin(minutesUntil <= 30 && minutesUntil >= -120);

      if (minutesUntil < 0) {
        setCountdown("Live Now!");
      } else if (minutesUntil < 60) {
        setCountdown(`${minutesUntil} minutes`);
      } else {
        const hours = Math.floor(minutesUntil / 60);
        const mins = minutesUntil % 60;
        setCountdown(`${hours}h ${mins}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextSession]);

  const loadNextSession = async () => {
    try {
      const { data } = await supabase
        .from("live_coaching_sessions")
        .select("*")
        .eq("status", "scheduled")
        .gte("session_date", new Date().toISOString().split('T')[0])
        .order("session_date", { ascending: true })
        .order("session_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      setNextSession(data);
    } catch (error) {
      console.error("Error loading next session:", error);
    }
  };

  if (!nextSession) {
    return null;
  }

  const sessionDateTime = parseISO(`${nextSession.session_date}T${nextSession.session_time}`);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Video className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{nextSession.title}</h3>
            {nextSession.status === "live" && (
              <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {nextSession.description || "Join Coach for live swing breakdowns and Q&A"}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(sessionDateTime, "EEEE, MMM d @ h:mm a")}</span>
            </div>

            {countdown && (
              <div className="flex items-center gap-2 font-medium text-primary">
                <Clock className="h-4 w-4" />
                <span>{countdown}</span>
              </div>
            )}
          </div>

          {nextSession.submission_deadline && (
            <div className="mt-3 p-3 bg-card rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                Submit your swing by {format(parseISO(nextSession.submission_deadline), "MMM d @ h:mm a")} for live feedback
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {canJoin && nextSession.live_link ? (
            <Button
              onClick={() => window.open(nextSession.live_link!, '_blank')}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Join Live
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate("/analyze")}
            >
              Submit Swing
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/live-coaching")}
          >
            View Replays
          </Button>
        </div>
      </div>
    </Card>
  );
}
