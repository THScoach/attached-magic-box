import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, TrendingUp, FileVideo, Target, MessageSquare, Calendar, Upload, Brain } from "lucide-react";
import { FourBsScorecard } from "@/components/FourBsScorecard";
import { MetricTrendChart } from "@/components/MetricTrendChart";
import { CoachingNotesPanel } from "@/components/admin/CoachingNotesPanel";
import { DrillRecommendations } from "@/components/DrillRecommendations";
import { ExternalSessionUpload } from "@/components/ExternalSessionUpload";
import { ExternalSessionDataView } from "@/components/ExternalSessionDataView";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";

interface Player {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  handedness: string | null;
  position: string | null;
  team_name: string | null;
  organization: string | null;
  jersey_number: string | null;
  height: number | null;
  weight: number | null;
  avatar_url: string | null;
}

interface SwingAnalysis {
  id: string;
  created_at: string;
  overall_score: number;
  bat_score: number;
  ball_score: number;
  body_score: number;
  brain_score: number;
  video_url: string | null;
}

export default function AdminPlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [analyses, setAnalyses] = useState<SwingAnalysis[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<SwingAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPlayerData();
    }
  }, [id]);

  const loadPlayerData = async () => {
    setLoading(true);
    
    // Load player info
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (playerError) {
      console.error("Error loading player:", playerError);
      setLoading(false);
      return;
    }

    if (!playerData) {
      setLoading(false);
      return;
    }

    // Load user profile to get email
    const { data: profileData } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", playerData.user_id)
      .single();

    // Combine player and profile data
    const playerWithEmail = {
      ...playerData,
      email: profileData?.email || ''
    };

    setPlayer(playerWithEmail);

    // Load swing analyses
    const { data: analysesData, error: analysesError } = await supabase
      .from("swing_analyses")
      .select("id, created_at, overall_score, bat_score, ball_score, body_score, brain_score, video_url")
      .eq("player_id", id)
      .order("created_at", { ascending: false });

    if (analysesError) {
      console.error("Error loading analyses:", analysesError);
    } else {
      setAnalyses(analysesData || []);
      setLatestAnalysis(analysesData?.[0] || null);
    }

    setLoading(false);
  };

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-8">
        <Alert>
          <AlertDescription>
            Player not found. Please check the player ID and try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/admin/players")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Button>
      </div>
    );
  }

  const age = getAge(player.birth_date);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Mobile Header */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-4 md:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/players")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">
              {player.first_name} {player.last_name}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {[
                age && `${age}yo`,
                player.position,
                player.handedness && `${player.handedness}HH`,
                player.jersey_number && `#${player.jersey_number}`
              ].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileVideo className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{analyses.length}</div>
            <p className="text-xs text-muted-foreground">Total Swings</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {latestAnalysis ? latestAnalysis.overall_score.toFixed(0) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Latest Score</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">
              {analyses.length > 0
                ? (analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length).toFixed(0)
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="text-lg font-bold">
              {player.height && player.weight
                ? `${Math.floor(player.height / 12)}'${player.height % 12}"`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">{player.weight ? `${player.weight}lb` : 'Not set'}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => navigate(`/brain/${id}`)}
            variant="outline"
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            Brain
          </Button>
          <Button
            onClick={() => {
              sessionStorage.setItem('selectedPlayerId', id!);
              navigate('/reboot-analysis');
            }}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Analyze
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="scorecard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="scorecard" className="text-xs md:text-sm">4 B's</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs md:text-sm">Progress</TabsTrigger>
            <TabsTrigger value="analyses" className="text-xs md:text-sm">History</TabsTrigger>
            <TabsTrigger value="external" className="text-xs md:text-sm">External</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs md:text-sm">Notes</TabsTrigger>
            <TabsTrigger value="drills" className="text-xs md:text-sm">Drills</TabsTrigger>
          </TabsList>

        <TabsContent value="scorecard" className="space-y-4">
          {latestAnalysis ? (
            <FourBsScorecard 
              userTier={"pro" as any}
              metrics={{
                bat_score: latestAnalysis.bat_score,
                ball_score: latestAnalysis.ball_score,
                body_score: latestAnalysis.body_score,
                brain_score: latestAnalysis.brain_score,
                overall_score: latestAnalysis.overall_score
              }}
              analysisId={latestAnalysis.id}
              bypassTierRestrictions={true}
              playerId={id}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileVideo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No swing analyses yet for this player</p>
                <p className="text-sm mt-2">Upload a swing video to see the 4 B's scorecard</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {analyses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Score Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricTrendChart
                    title="Overall Score Trend"
                    data={analyses.map(a => ({
                      date: new Date(a.created_at).toLocaleDateString(),
                      value: a.overall_score
                    }))}
                    metricName="Overall Score"
                    color="#FFD700"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4 B's Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Bat", key: "bat_score", color: "#FFD700" },
                      { name: "Ball", key: "ball_score", color: "#FF6B35" },
                      { name: "Body", key: "body_score", color: "#4ECDC4" },
                      { name: "Brain", key: "brain_score", color: "#95E1D3" }
                    ].map(pillar => {
                      const avgScore = analyses.length > 0
                        ? analyses.reduce((sum, a) => sum + (a as any)[pillar.key], 0) / analyses.length
                        : 0;
                      return (
                        <div key={pillar.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{pillar.name}</span>
                            <span className="text-sm font-bold">{avgScore.toFixed(0)}</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${avgScore}%`,
                                backgroundColor: pillar.color
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Bat Score Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricTrendChart
                    title="Bat Score Progress"
                    data={analyses.map(a => ({
                      date: new Date(a.created_at).toLocaleDateString(),
                      value: a.bat_score
                    }))}
                    metricName="Bat Score"
                    color="#FFD700"
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No progress data available yet</p>
                <p className="text-sm mt-2">Upload multiple swings to see progress trends</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analyses" className="space-y-3">
          {analyses.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Analysis History ({analyses.length})</h3>
                <Button
                  onClick={() => {
                    sessionStorage.setItem('selectedPlayerId', id!);
                    navigate('/reboot-analysis');
                  }}
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  New
                </Button>
              </div>
              
              <div className="space-y-2">
                {analyses.map(analysis => (
                  <Card
                    key={analysis.id}
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate(`/result/${analysis.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-primary">
                          {analysis.overall_score.toFixed(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs space-y-1">
                          <div className="flex gap-2">
                            <span>🏏 {analysis.bat_score.toFixed(0)}</span>
                            <span>⚾ {analysis.ball_score.toFixed(0)}</span>
                          </div>
                          <div className="flex gap-2">
                            <span>💪 {analysis.body_score.toFixed(0)}</span>
                            <span>🧠 {analysis.brain_score.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileVideo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No analyses recorded yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="external" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload External Sensor Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExternalSessionUpload
                playerId={id!}
                onUploadComplete={() => {
                  // Optionally refresh data here
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Session Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ExternalSessionDataView playerId={id!} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <CoachingNotesPanel athleteId={id!} athleteEmail={player.email} />
        </TabsContent>

        <TabsContent value="drills" className="space-y-4">
          {latestAnalysis ? (
            <DrillRecommendations 
              analysisId={latestAnalysis.id} 
              playerId={id!}
              userId={player.user_id}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No drill recommendations available yet</p>
                <p className="text-sm mt-2">Upload a swing to get personalized drill recommendations</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
