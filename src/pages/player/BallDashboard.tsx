import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConsistencyScoreCard } from "@/components/ConsistencyScoreCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
}

interface BallData {
  id: string;
  created_at: string;
  exit_velocity: number;
  exit_velocity_grade: number | null;
  hard_hit_percentage: number | null;
  launch_angle_grade: number | null;
  ground_ball_percentage: number | null;
  fly_ball_percentage: number | null;
  line_drive_percentage: number | null;
}

interface HitTraxSession {
  id: string;
  session_date: string;
  total_swings: number;
  total_hits: number;
  avg_exit_velo: number;
  max_exit_velo: number;
  ev90: number;
  barrel_rate: number;
  barrel_count: number;
  home_runs: number;
  exit_velo_std_dev: number;
  launch_angle_std_dev: number;
  exit_velo_consistency_grade: string;
  launch_angle_consistency_grade: string;
  avg_launch_angle: number;
  sweet_spot_rate: number;
  hard_hit_rate: number;
}

export default function BallDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [ballData, setBallData] = useState<BallData | null>(null);
  const [sessions, setSessions] = useState<HitTraxSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    
    const { data: playerData } = await supabase
      .from("players")
      .select("id, first_name, last_name")
      .eq("id", id)
      .single();

    setPlayer(playerData);

    // Load latest ball metrics
    const { data: ballMetrics } = await supabase
      .from("ball_metrics")
      .select("*")
      .eq("player_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setBallData(ballMetrics);

    // Load HitTrax sessions
    const { data: sessionsData } = await supabase
      .from("hitrax_sessions")
      .select(`
        id, session_date, total_swings, total_hits, avg_exit_velo, max_exit_velo, ev90, 
        barrel_rate, barrel_count, home_runs, exit_velo_std_dev, launch_angle_std_dev,
        exit_velo_consistency_grade, launch_angle_consistency_grade, avg_launch_angle,
        sweet_spot_rate, hard_hit_rate
      `)
      .eq("player_id", id)
      .order("session_date", { ascending: false });

    setSessions(sessionsData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Alert>
          <AlertDescription>Player not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-4 md:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/players/${id}`)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">
              ⚾ BALL Dashboard
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {player.first_name} {player.last_name} - Output & Results
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* What is Ball? */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              What is BALL?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              The Ball is the final result - what happens after contact. Key metrics:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Exit Velocity:</strong> How fast the ball leaves the bat
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Launch Angle:</strong> Vertical angle of ball flight
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Distance:</strong> How far the ball travels
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Spray Chart:</strong> Where balls are hit on the field
                </div>
              </li>
            </ul>
            
            <div className="bg-primary/10 border-l-4 border-primary p-3 rounded italic text-sm">
              "Exit velocity is the great equalizer. It doesn't lie." — MLB Scout
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        {!ballData && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">📤 Upload Ball Tracking Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your ball tracking system to analyze exit velocity, launch angle, and more.
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-semibold text-sm mb-1">HitTrax</h4>
                  <p className="text-xs text-muted-foreground">CSV export</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-3xl mb-2">⚾</div>
                  <h4 className="font-semibold text-sm mb-1">Rapsodo</h4>
                  <p className="text-xs text-muted-foreground">CSV export</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-semibold text-sm mb-1">TrackMan</h4>
                  <p className="text-xs text-muted-foreground">CSV export</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => navigate(`/player/${id}/csv-import?type=ball`)}
                >
                  📤 Upload HitTrax CSV
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/external-session-upload`)}
                >
                  Manual Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ball Metrics */}
        {ballData && (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/player/${id}/csv-import?type=ball`)}
              >
                📤 Upload CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/external-session-upload`)}
              >
                Manual Entry
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Latest Ball Metrics</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ballData.created_at).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Exit Velocity Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Exit Velocity</p>
                    <p className="text-lg font-bold">{ballData.exit_velocity} mph</p>
                    {ballData.exit_velocity >= 95 && (
                      <p className="text-xs text-green-500 mt-1">✓ Elite</p>
                    )}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Hard Hit %</p>
                    <p className="text-lg font-bold">{ballData.hard_hit_percentage || 0}%</p>
                    <p className="text-xs text-muted-foreground mt-1">95+ mph</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Launch Angle</p>
                    <p className="text-lg font-bold">{ballData.launch_angle_grade || "—"}°</p>
                    {ballData.launch_angle_grade && ballData.launch_angle_grade >= 10 && ballData.launch_angle_grade <= 25 && (
                      <p className="text-xs text-green-500 mt-1">✓ Optimal</p>
                    )}
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Exit Velocity Grade</p>
                    <p className="text-lg font-bold">{ballData.exit_velocity_grade || "—"}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Ball metrics are calculated from external sensors. Connect HitTrax, Rapsodo, or similar for full tracking.
                </p>
              </CardContent>
            </Card>

            {/* Hit Distribution */}
            {(ballData.line_drive_percentage !== null || ballData.fly_ball_percentage !== null || ballData.ground_ball_percentage !== null) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Hit Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-3xl mb-2">📈</div>
                      <p className="text-xs text-muted-foreground mb-2">Line Drives</p>
                      <p className="text-lg font-bold">{ballData.line_drive_percentage?.toFixed(1) || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">10-25° LA</p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-3xl mb-2">🚀</div>
                      <p className="text-xs text-muted-foreground mb-2">Fly Balls</p>
                      <p className="text-lg font-bold">{ballData.fly_ball_percentage?.toFixed(1) || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">25-50° LA</p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-3xl mb-2">⚾</div>
                      <p className="text-xs text-muted-foreground mb-2">Ground Balls</p>
                      <p className="text-lg font-bold">{ballData.ground_ball_percentage?.toFixed(1) || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">&lt; 10° LA</p>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 border-l-4 border-primary p-3 rounded italic text-sm mt-4">
                    "Elite hitters optimize for line drives (10-25°) and fly balls (25-50°) to maximize hard contact and distance."
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Latest Ball Metrics - Enhanced */}
        {sessions.length > 0 && sessions[0].exit_velo_std_dev !== null && (
          <>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Latest Ball Metrics</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(sessions[0].session_date).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Row 1: Exit Velocity Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Avg Exit Velo</p>
                      <p className="text-3xl font-bold">{sessions[0].avg_exit_velo?.toFixed(1) || 0} mph</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ±{sessions[0].exit_velo_std_dev?.toFixed(1) || 0} mph
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">EV90</p>
                      <p className="text-3xl font-bold">{sessions[0].ev90?.toFixed(1) || 0} mph</p>
                      <p className="text-xs text-muted-foreground mt-1">90th percentile</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Max Exit Velo</p>
                      <p className="text-3xl font-bold text-yellow-500">
                        {sessions[0].max_exit_velo?.toFixed(1) || 0} mph
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Peak power</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">EV Consistency</p>
                      <p className="text-3xl font-bold">{sessions[0].exit_velo_std_dev?.toFixed(1) || 0}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          (sessions[0].exit_velo_std_dev || 0) < 5 ? 'default' :
                          (sessions[0].exit_velo_std_dev || 0) < 8 ? 'secondary' : 'destructive'
                        }>
                          {(sessions[0].exit_velo_std_dev || 0) < 5 ? 'Elite' :
                           (sessions[0].exit_velo_std_dev || 0) < 8 ? 'Good' : 'Needs Work'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 2: Launch Angle Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Avg Launch Angle</p>
                      <p className="text-3xl font-bold">{sessions[0].avg_launch_angle?.toFixed(1) || 0}°</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ±{sessions[0].launch_angle_std_dev?.toFixed(1) || 0}°
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">LA Consistency</p>
                      <p className="text-3xl font-bold">{sessions[0].launch_angle_std_dev?.toFixed(1) || 0}°</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          (sessions[0].launch_angle_std_dev || 0) < 10 ? 'default' :
                          (sessions[0].launch_angle_std_dev || 0) < 15 ? 'secondary' : 'destructive'
                        }>
                          {(sessions[0].launch_angle_std_dev || 0) < 10 ? 'Elite' :
                           (sessions[0].launch_angle_std_dev || 0) < 15 ? 'Good' : 'Needs Work'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Sweet Spot %</p>
                      <p className="text-3xl font-bold">{sessions[0].sweet_spot_rate?.toFixed(1) || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">8-32° launch angle</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Hard Hit %</p>
                      <p className="text-3xl font-bold">{sessions[0].hard_hit_rate?.toFixed(1) || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">95+ mph exit velo</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 3: BARREL RATE (Featured) */}
                <Card className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl">⚡</span>
                          <h3 className="text-2xl font-bold">Barrel Rate</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          8-50° launch angle + 98+ mph exit velo
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-6xl font-bold text-yellow-500">
                          {sessions[0].barrel_rate?.toFixed(1) || 0}%
                        </p>
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <Badge variant={
                            (sessions[0].barrel_rate || 0) >= 15 ? 'default' :
                            (sessions[0].barrel_rate || 0) >= 8 ? 'secondary' : 'destructive'
                          } className="text-lg px-3 py-1">
                            {(sessions[0].barrel_rate || 0) >= 15 ? 'Elite (15%+)' :
                             (sessions[0].barrel_rate || 0) >= 8 ? 'Good (8%+)' : 'Needs Work (<8%)'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barrel Rate Trend */}
                    {sessions.length > 1 && sessions[1].barrel_rate !== null && (
                      <div className="mt-4 pt-4 border-t border-yellow-500/30">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Previous Session:</span>
                          <span className="font-semibold">
                            {sessions[1].barrel_rate?.toFixed(1) || 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-muted-foreground">Change:</span>
                          <span className={`font-semibold ${
                            (sessions[0].barrel_rate || 0) > (sessions[1].barrel_rate || 0)
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {(sessions[0].barrel_rate || 0) > (sessions[1].barrel_rate || 0) ? '↑' : '↓'}
                            {Math.abs((sessions[0].barrel_rate || 0) - (sessions[1].barrel_rate || 0)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Challenge */}
                    {sessions.length > 1 && (
                      <Alert className="mt-4 bg-yellow-900/20 border-yellow-500">
                        <AlertTitle>🎯 Session Challenge</AlertTitle>
                        <AlertDescription>
                          Beat your previous barrel rate of {sessions[1].barrel_rate?.toFixed(1) || 0}%!
                          Focus on 8-50° launch angles with 98+ mph exit velo.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Consistency Score Section */}
            {sessions[0].exit_velo_std_dev !== null && sessions[0].launch_angle_std_dev !== null && (
              <ConsistencyScoreCard
                exitVeloStdDev={sessions[0].exit_velo_std_dev || 0}
                avgExitVelo={sessions[0].avg_exit_velo || 0}
                launchAngleStdDev={sessions[0].launch_angle_std_dev || 0}
                avgLaunchAngle={sessions[0].avg_launch_angle || 0}
              />
            )}

            {/* Barrel Rate Progress Chart */}
            {sessions.length > 1 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Barrel Rate Progress</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your barrel rate improvement over time. Challenge: beat your previous session!
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sessions.slice(0, 10).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="session_date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          label={{ value: 'Barrel Rate (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Barrel Rate']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="barrel_rate" 
                          stroke="#FFD700" 
                          strokeWidth={3}
                          name="Barrel Rate"
                          dot={{ fill: '#FFD700', r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Session Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/50 border-border text-center">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Best Session</p>
                        <p className="text-3xl font-bold text-green-500">
                          {Math.max(...sessions.map(s => s.barrel_rate || 0)).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(
                            sessions.find(s => s.barrel_rate === Math.max(...sessions.map(s => s.barrel_rate || 0)))?.session_date || ''
                          ).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/50 border-border text-center">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Latest Session</p>
                        <p className="text-3xl font-bold">
                          {sessions[0].barrel_rate?.toFixed(1) || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(sessions[0].session_date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/50 border-border text-center">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Improvement</p>
                        <p className={`text-3xl font-bold ${
                          (sessions[0].barrel_rate || 0) > (sessions[1]?.barrel_rate || 0)
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {(sessions[0].barrel_rate || 0) > (sessions[1]?.barrel_rate || 0) ? '+' : ''}
                          {((sessions[0].barrel_rate || 0) - (sessions[1]?.barrel_rate || 0)).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">vs previous</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* HitTrax Sessions List */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">📊 All HitTrax Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition"
                  onClick={() => navigate(`/hitrax-session/${session.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {new Date(session.session_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.total_hits} hits / {session.total_swings} swings
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg EV</p>
                        <p className="text-sm font-bold">{session.avg_exit_velo?.toFixed(1) || 0} mph</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Barrel Rate</p>
                        <p className="text-sm font-bold">{session.barrel_rate?.toFixed(1) || 0}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Home Runs</p>
                        <p className="text-sm font-bold text-yellow-500">{session.home_runs || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Ball Flight Trajectory */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ball Flight Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              From contact to landing, tracking the ball's path:
            </p>
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary mx-auto flex items-center justify-center text-2xl mb-2">
                  🚀
                </div>
                <p className="font-semibold text-sm mb-1">Launch</p>
                <p className="text-xs text-muted-foreground mb-2">Contact point</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Exit Velo</p>
                  <p className="text-sm font-bold">
                    {ballData?.exit_velocity || "—"} mph
                  </p>
                </div>
              </div>
              
              <span className="text-2xl text-muted-foreground">→</span>
              
              <div className="flex-1 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/60 mx-auto flex items-center justify-center text-2xl mb-2">
                  ⚾
                </div>
                <p className="font-semibold text-sm mb-1">Flight</p>
                <p className="text-xs text-muted-foreground mb-2">In the air</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Launch Angle</p>
                  <p className="text-sm font-bold">
                    {ballData?.launch_angle_grade ? `${ballData.launch_angle_grade}°` : "—"}
                  </p>
                </div>
              </div>
              
              <span className="text-2xl text-muted-foreground">→</span>
              
              <div className="flex-1 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/80 mx-auto flex items-center justify-center text-2xl mb-2">
                  🎯
                </div>
                <p className="font-semibold text-sm mb-1">Landing</p>
                <p className="text-xs text-muted-foreground mb-2">Landing point</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-sm font-bold">—</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 border-l-4 border-primary p-3 rounded italic text-sm">
              "Optimal launch conditions: 90+ mph exit velo, 15-30° launch angle for line drives and fly balls."
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5" />
              Ball Flight Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Exit Velocity</h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    Increase exit velocity to elite levels
                  </p>
                  <p className="text-xs text-muted-foreground">Target: 95+ mph</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {ballData ? `${ballData.exit_velocity}` : "—"} mph
                  </p>
                  {ballData && ballData.exit_velocity >= 95 && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded mt-1 inline-block">
                      Elite
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Launch Angle</h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    Optimize launch angle for line drives
                  </p>
                  <p className="text-xs text-muted-foreground">Target: 10-25°</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {ballData?.launch_angle_grade ? `${ballData.launch_angle_grade}°` : "—"}
                  </p>
                  {ballData?.launch_angle_grade && 
                   ballData.launch_angle_grade >= 10 && 
                   ballData.launch_angle_grade <= 25 && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded mt-1 inline-block">
                      Optimal
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Hard Hit %</h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    Increase percentage of hard-hit balls
                  </p>
                  <p className="text-xs text-muted-foreground">Target: 50%+ (95+ mph)</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {ballData?.hard_hit_percentage ? `${ballData.hard_hit_percentage}%` : "—"}
                  </p>
                  {ballData?.hard_hit_percentage && ballData.hard_hit_percentage >= 50 && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded mt-1 inline-block">
                      Elite
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Line Drive Rate</h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    Maximize line drives for consistent contact
                  </p>
                  <p className="text-xs text-muted-foreground">Target: 25%+ (10-25° LA)</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {ballData?.line_drive_percentage ? `${ballData.line_drive_percentage.toFixed(1)}%` : "—"}
                  </p>
                  {ballData?.line_drive_percentage && ballData.line_drive_percentage >= 25 && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded mt-1 inline-block">
                      Elite
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
