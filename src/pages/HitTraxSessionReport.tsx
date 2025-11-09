import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, GitCompare, Zap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface HitTraxSession {
  id: string;
  session_date: string;
  total_swings: number;
  total_hits: number;
  avg_exit_velo: number;
  max_exit_velo: number;
  ev90: number;
  avg_launch_angle: number;
  barrel_rate: number;
  hard_hit_rate: number;
  sweet_spot_rate: number;
  home_runs: number;
  line_drive_rate: number;
  fly_ball_rate: number;
  ground_ball_rate: number;
  player_id: string;
}

interface HitTraxSwing {
  id: string;
  pitch_number: number;
  exit_velo: number;
  launch_angle: number;
  distance: number;
  result: string;
  hit_type: string;
  horiz_angle: number;
  is_barrel: boolean;
}

export default function HitTraxSessionReport() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<HitTraxSession | null>(null);
  const [swings, setSwings] = useState<HitTraxSwing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ld' | 'fb' | 'gb'>('all');

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('hitrax_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Load swings
      const { data: swingsData, error: swingsError } = await supabase
        .from('hitrax_swings')
        .select('*')
        .eq('session_id', sessionId)
        .order('pitch_number', { ascending: true });

      if (swingsError) throw swingsError;
      setSwings(swingsData || []);
    } catch (error) {
      console.error("Error loading session:", error);
      toast.error("Failed to load session data");
    } finally {
      setLoading(false);
    }
  };

  const filteredSwings = swings.filter(swing => {
    if (filter === 'all') return true;
    if (filter === 'ld') return swing.hit_type === 'LD';
    if (filter === 'fb') return swing.hit_type === 'FB';
    if (filter === 'gb') return swing.hit_type === 'GB';
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTitle>Session Not Found</AlertTitle>
          <AlertDescription>
            The requested HitTrax session could not be found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/player/${session.player_id}/ball`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to BALL Dashboard
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Export feature coming soon!")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => toast.info("Compare feature coming soon!")}>
            <GitCompare className="h-4 w-4 mr-2" />
            Compare Sessions
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-4xl font-bold">HitTrax Session Report</h1>
        <p className="text-muted-foreground mt-2">
          {format(new Date(session.session_date), 'MMMM dd, yyyy')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Swings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{session.total_swings}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {session.total_hits} hits
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Avg Exit Velo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{session.avg_exit_velo.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">mph</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">EV90</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{session.ev90.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">90th percentile</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Max Exit Velo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{session.max_exit_velo.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">mph</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Home Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{session.home_runs}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((session.home_runs / session.total_hits) * 100).toFixed(0)}% of hits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="swings" className="w-full">
        <TabsList>
          <TabsTrigger value="swings">Swing-by-Swing</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Swing-by-Swing Table */}
        <TabsContent value="swings">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Swings ({filteredSwings.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'ld' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('ld')}
                  >
                    Line Drives
                  </Button>
                  <Button
                    variant={filter === 'fb' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('fb')}
                  >
                    Fly Balls
                  </Button>
                  <Button
                    variant={filter === 'gb' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('gb')}
                  >
                    Ground Balls
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-2">#</th>
                      <th className="p-2">Exit Velo</th>
                      <th className="p-2">Launch Angle</th>
                      <th className="p-2">Distance</th>
                      <th className="p-2">Result</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Spray Angle</th>
                      <th className="p-2">Barrel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSwings.map(swing => (
                      <tr
                        key={swing.id}
                        className="border-b hover:bg-muted/50 transition"
                      >
                        <td className="p-2">{swing.pitch_number}</td>
                        <td className="p-2 font-semibold">
                          {swing.exit_velo ? `${swing.exit_velo.toFixed(1)} mph` : '—'}
                        </td>
                        <td className="p-2">
                          {swing.launch_angle ? `${swing.launch_angle.toFixed(1)}°` : '—'}
                        </td>
                        <td className="p-2">
                          {swing.distance ? `${swing.distance} ft` : '—'}
                        </td>
                        <td className="p-2">
                          {swing.result === 'HR' ? (
                            <Badge className="bg-yellow-500 text-black">HR</Badge>
                          ) : (
                            swing.result || '—'
                          )}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              swing.hit_type === 'LD' ? 'default' :
                              swing.hit_type === 'FB' ? 'secondary' :
                              'outline'
                            }
                          >
                            {swing.hit_type || '—'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {swing.horiz_angle ? `${swing.horiz_angle}°` : '—'}
                        </td>
                        <td className="p-2">
                          {swing.is_barrel && (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <div className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Hit Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-muted text-center p-6">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-sm text-muted-foreground mb-2">Line Drives</p>
                    <p className="text-3xl font-bold">{session.line_drive_rate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((session.line_drive_rate / 100) * session.total_hits)} hits
                    </p>
                  </Card>

                  <Card className="bg-muted text-center p-6">
                    <div className="text-4xl mb-2">🚀</div>
                    <p className="text-sm text-muted-foreground mb-2">Fly Balls</p>
                    <p className="text-3xl font-bold">{session.fly_ball_rate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((session.fly_ball_rate / 100) * session.total_hits)} hits
                    </p>
                  </Card>

                  <Card className="bg-muted text-center p-6">
                    <div className="text-4xl mb-2">⚾</div>
                    <p className="text-sm text-muted-foreground mb-2">Ground Balls</p>
                    <p className="text-3xl font-bold">{session.ground_ball_rate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((session.ground_ball_rate / 100) * session.total_hits)} hits
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <div className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-muted p-6">
                    <p className="text-sm text-muted-foreground mb-2">Barrel Rate</p>
                    <p className="text-3xl font-bold">{session.barrel_rate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      8-50° LA + 98+ mph
                    </p>
                    {session.barrel_rate >= 15 && (
                      <Badge className="mt-2 bg-green-600">Elite (15%+)</Badge>
                    )}
                  </Card>

                  <Card className="bg-muted p-6">
                    <p className="text-sm text-muted-foreground mb-2">Hard Hit Rate</p>
                    <p className="text-3xl font-bold">{session.hard_hit_rate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      95+ mph exit velo
                    </p>
                  </Card>

                  <Card className="bg-muted p-6">
                    <p className="text-sm text-muted-foreground mb-2">Sweet Spot Rate</p>
                    <p className="text-3xl font-bold">{session.sweet_spot_rate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      8-32° launch angle
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.barrel_rate >= 15 && (
                  <Alert className="bg-green-900/20 border-green-600">
                    <Zap className="h-4 w-4" />
                    <AlertTitle>Elite Barrel Rate!</AlertTitle>
                    <AlertDescription>
                      Your barrel rate of {session.barrel_rate.toFixed(1)}% is elite level (MLB avg: 8%, Elite: 15%+).
                      You're consistently hitting balls in the optimal launch window with high exit velocity.
                    </AlertDescription>
                  </Alert>
                )}

                {session.avg_exit_velo >= 95 && (
                  <Alert className="bg-green-900/20 border-green-600">
                    <AlertTitle>💪 Elite Exit Velocity!</AlertTitle>
                    <AlertDescription>
                      Average exit velocity of {session.avg_exit_velo.toFixed(1)} mph is elite level.
                      Keep generating that bat speed!
                    </AlertDescription>
                  </Alert>
                )}

                {session.home_runs >= 5 && (
                  <Alert className="bg-yellow-900/20 border-yellow-600">
                    <AlertTitle>🔥 Power Display!</AlertTitle>
                    <AlertDescription>
                      {session.home_runs} home runs in this session! You're showing serious power potential.
                    </AlertDescription>
                  </Alert>
                )}

                {session.avg_launch_angle > 30 && (
                  <Alert className="bg-orange-900/20 border-orange-600">
                    <AlertTitle>⚠️ Launch Angle Too High</AlertTitle>
                    <AlertDescription>
                      Average launch angle of {session.avg_launch_angle.toFixed(1)}° is too steep.
                      Optimal range is 10-25° for line drives. Work on staying through the ball.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
