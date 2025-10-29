import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ExternalLink, TrendingUp } from "lucide-react";

interface ExternalSessionDataViewProps {
  playerId: string;
}

interface SessionData {
  id: string;
  session_date: string;
  data_source: string;
  screenshot_url: string;
  extracted_metrics: Record<string, any>;
  notes: string | null;
}

export function ExternalSessionDataView({ playerId }: ExternalSessionDataViewProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [playerId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('external_session_data' as any)
        .select('*')
        .eq('player_id', playerId)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions((data as any) || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      blast_motion: "Blast Motion",
      hittrax: "HitTrax",
      rapsodo: "Rapsodo",
      trackman: "TrackMan",
      manual: "Manual Entry"
    };
    return labels[source] || source;
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>External Session Data</CardTitle>
          <CardDescription>No session data uploaded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        External Session Data
      </h3>
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {format(new Date(session.session_date), 'MMM dd, yyyy')}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(session.session_date), 'h:mm a')}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {getSourceLabel(session.data_source)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.screenshot_url && (
                  <a 
                    href={session.screenshot_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Screenshot
                  </a>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(session.extracted_metrics).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-xs text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </p>
                    </div>
                  ))}
                </div>

                {session.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{session.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
