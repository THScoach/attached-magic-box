import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, TrendingUp, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { MetricTrendChart } from "@/components/MetricTrendChart";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AthleteConnection {
  id: string;
  athlete_id: string;
  relationship: string;
  athleteEmail?: string;
  athleteName?: string;
}

export default function ParentPortal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    } else {
      navigate("/auth");
      return;
    }
    setLoading(false);
  };

  const { data: athletes = [], isLoading: athletesLoading } = useQuery({
    queryKey: ["parent-athletes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_guardians")
        .select("*")
        .eq("parent_user_id", user?.id);

      if (error) throw error;

      // Fetch athlete details
      const athleteIds = data.map((a: any) => a.athlete_id);
      const usersResponse = await supabase.auth.admin.listUsers();
      const athleteMap = new Map<string, any>(
        usersResponse.data?.users
          .filter((u: any) => u.id)
          .map((u: any) => [u.id, u] as [string, any]) || []
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", athleteIds);

      const profileMap = new Map<string, any>(
        profiles?.map((p: any) => [p.id, p] as [string, any]) || []
      );

      return data.map((connection: any) => {
        const athlete = athleteMap.get(connection.athlete_id);
        const profile = profileMap.get(connection.athlete_id);
        return {
          ...connection,
          athleteEmail: athlete?.email || "Unknown",
          athleteName: profile
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : athlete?.email || "Unknown",
        };
      });
    },
    enabled: !!user?.id,
  });

  const { data: athleteStats } = useQuery({
    queryKey: ["athlete-stats", selectedAthlete],
    queryFn: async () => {
      if (!selectedAthlete) return null;

      const { data: analyses } = await supabase
        .from("swing_analyses")
        .select("*")
        .eq("user_id", selectedAthlete)
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: grit } = await supabase
        .from("grit_scores")
        .select("*")
        .eq("user_id", selectedAthlete)
        .is("player_id", null)
        .single();

      return {
        analyses: analyses || [],
        totalSwings: analyses?.length || 0,
        avgScore: analyses?.length
          ? Math.round(
              analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) /
                analyses.length
            )
          : 0,
        gritScore: Math.round(grit?.current_score || 0),
        currentStreak: grit?.current_streak || 0,
      };
    },
    enabled: !!selectedAthlete,
  });

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  if (loading || athletesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!athletes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Parent Portal</h1>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              You don't have access to any athletes yet. Please contact your athlete's coach to get added as a parent/guardian.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Auto-select first athlete if none selected
  if (!selectedAthlete && athletes.length > 0) {
    setSelectedAthlete(athletes[0].athlete_id);
  }

  const currentAthlete = athletes.find(a => a.athlete_id === selectedAthlete);

  return (
    <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Parent Portal</h1>
            <p className="text-muted-foreground">
              View your athlete's progress and performance
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Athlete Selector */}
        {athletes.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Athlete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {athletes.map((athlete) => (
                  <Button
                    key={athlete.id}
                    variant={selectedAthlete === athlete.athlete_id ? "default" : "outline"}
                    onClick={() => setSelectedAthlete(athlete.athlete_id)}
                    className="justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {athlete.athleteName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        {athleteStats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Swings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{athleteStats.totalSwings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {athleteStats.avgScore}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GRIND Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-engine">
                  {athleteStats.gritScore}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {athleteStats.currentStreak} days
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="schedule">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            {selectedAthlete && athleteStats && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                    <CardDescription>
                      Last {athleteStats.analyses.length} swing analyses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {athleteStats.analyses.length > 0 ? (
                      <MetricTrendChart
                        title="Performance Over Time"
                        data={athleteStats.analyses.map((a: any) => ({
                          date: new Date(a.created_at).toLocaleDateString(),
                          value: a.overall_score || 0,
                        }))}
                        metricName="Overall Score"
                      />
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No swing data available yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Analyses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {athleteStats.analyses.length > 0 ? (
                      <div className="space-y-3">
                        {athleteStats.analyses.slice(0, 5).map((analysis: any) => (
                          <div
                            key={analysis.id}
                            className="flex justify-between items-center p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {new Date(analysis.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(analysis.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                {Math.round(analysis.overall_score || 0)}
                              </p>
                              <p className="text-sm text-muted-foreground">Score</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No analyses yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
                <CardDescription>
                  Practices, games, and assignments for {currentAthlete?.athleteName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Schedule view coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Coach Communications</CardTitle>
                <CardDescription>
                  Messages between you and {currentAthlete?.athleteName}'s coach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Messaging system coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
