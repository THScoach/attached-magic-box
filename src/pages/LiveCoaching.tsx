import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Video, Clock, Calendar, Play, Lock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { BottomNav } from "@/components/BottomNav";
import { SubmitForLiveModal } from "@/components/SubmitForLiveModal";
import { useTierAccess } from "@/hooks/useTierAccess";

interface CoachingSession {
  id: string;
  session_date: string;
  session_time: string;
  title: string;
  description: string | null;
  status: string;
  live_link: string | null;
  replay_url: string | null;
  replay_notes: string | null;
  submission_deadline: string | null;
}

export default function LiveCoaching() {
  const tierAccess = useTierAccess();
  const [upcomingSessions, setUpcomingSessions] = useState<CoachingSession[]>([]);
  const [replays, setReplays] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModalSession, setSubmitModalSession] = useState<CoachingSession | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get upcoming sessions
      const { data: upcoming } = await supabase
        .from("live_coaching_sessions")
        .select("*")
        .gte("session_date", today)
        .in("status", ["scheduled", "live"])
        .order("session_date", { ascending: true })
        .order("session_time", { ascending: true });

      // Get past sessions with replays
      const { data: past } = await supabase
        .from("live_coaching_sessions")
        .select("*")
        .eq("status", "completed")
        .not("replay_url", "is", null)
        .order("session_date", { ascending: false })
        .limit(20);

      setUpcomingSessions(upcoming || []);
      setReplays(past || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const SessionCard = ({ session, isReplay = false }: { session: CoachingSession; isReplay?: boolean }) => {
    const sessionDateTime = parseISO(`${session.session_date}T${session.session_time}`);

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${isReplay ? 'bg-accent' : 'bg-primary/10'}`}>
            {isReplay ? (
              <Play className="h-6 w-6 text-primary" />
            ) : (
              <Video className="h-6 w-6 text-primary" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{session.title}</h3>
              {session.status === "live" && (
                <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
              )}
            </div>

            {session.description && (
              <p className="text-sm text-muted-foreground mb-3">{session.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(sessionDateTime, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(sessionDateTime, "h:mm a")}</span>
              </div>
            </div>

            {isReplay && session.replay_notes && (
              <div className="p-3 bg-muted rounded-lg mb-4">
                <p className="text-sm text-foreground">{session.replay_notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              {isReplay && session.replay_url ? (
                <Button
                  onClick={() => window.open(session.replay_url!, '_blank')}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Watch Replay
                </Button>
              ) : tierAccess.canJoinLive ? (
                session.live_link ? (
                  <Button
                    onClick={() => window.open(session.live_link!, '_blank')}
                    className="gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Join Session
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Link Coming Soon
                  </Button>
                )
              ) : (
                <Button disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  Upgrade to Join Live
                </Button>
              )}

              {!isReplay && tierAccess.canJoinLive && (
                <Button
                  variant="outline"
                  onClick={() => setSubmitModalSession(session)}
                >
                  Submit Swing for Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Live Coaching</h1>
          <p className="text-muted-foreground">
            Join weekly live sessions for swing breakdowns and personalized coaching
          </p>
        </div>

        {/* Upcoming Sessions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No upcoming sessions scheduled yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </section>

        <Separator className="my-8" />

        {/* Replay Library */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Replay Library</h2>
          {replays.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No replays available yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {replays.map((session) => (
                <SessionCard key={session.id} session={session} isReplay />
              ))}
            </div>
          )}
        </section>
      </div>

      {submitModalSession && (
        <SubmitForLiveModal
          sessionId={submitModalSession.id}
          sessionTitle={submitModalSession.title}
          submissionDeadline={submitModalSession.submission_deadline}
          open={!!submitModalSession}
          onOpenChange={(open) => !open && setSubmitModalSession(null)}
        />
      )}
      
      <BottomNav />
    </div>
  );
}
