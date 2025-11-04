import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Calendar, Target, TrendingUp, ClipboardList } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachingNotesPanel } from "@/components/admin/CoachingNotesPanel";
import { MetricTrendChart } from "@/components/MetricTrendChart";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { AthleteScheduleCalendar } from "@/components/AthleteScheduleCalendar";
import { format } from "date-fns";

export default function AthleteProfileDashboard() {
  const { athleteId } = useParams();
  const navigate = useNavigate();

  // Fetch athlete profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["athlete-profile", athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", athleteId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!athleteId,
  });

  // Fetch membership info
  const { data: membership } = useQuery({
    queryKey: ["athlete-membership", athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_memberships")
        .select("*")
        .eq("user_id", athleteId)
        .eq("status", "active")
        .maybeSingle();
      
      return data;
    },
    enabled: !!athleteId,
  });

  // Fetch recent analyses
  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ["athlete-analyses", athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swing_analyses")
        .select("*")
        .eq("user_id", athleteId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!athleteId,
  });

  // Fetch active goals
  const { data: goals } = useQuery({
    queryKey: ["athlete-goals", athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", athleteId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!athleteId,
  });

  // Calculate stats
  const avgScore = analyses?.length 
    ? (analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / analyses.length).toFixed(1)
    : "N/A";

  const recentTrend = analyses && analyses.length >= 2
    ? analyses[0].overall_score > analyses[1].overall_score ? "up" : "down"
    : "neutral";

  if (profileLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Athlete not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "AT";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/coach-dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Athlete Profile</h1>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant={membership?.tier === "free" ? "secondary" : "default"}>
                    {membership?.tier || "free"} tier
                  </Badge>
                </div>
                {profile.height_inches && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Height:</span> {Math.floor(profile.height_inches / 12)}'{profile.height_inches % 12}"
                  </div>
                )}
                {profile.weight_lbs && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Weight:</span> {profile.weight_lbs} lbs
                  </div>
                )}
                {profile.position && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Position:</span> {profile.position}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Swings</p>
                  <p className="text-2xl font-bold">{analyses?.length || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{avgScore}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                  <p className="text-2xl font-bold">{goals?.length || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="text-sm font-medium">
                    {profile.last_active_at 
                      ? format(new Date(profile.last_active_at), "MMM d")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analyses">
            <ClipboardList className="h-4 w-4 mr-2" />
            Analyses
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="notes">
            <ClipboardList className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {analyses && analyses.length > 0 ? (
                  <MetricTrendChart
                    title="Performance Trend"
                    metricName="H.I.T.S Score"
                    data={analyses.slice(0, 10).reverse().map((a) => ({
                      date: new Date(a.created_at).toISOString(),
                      value: a.overall_score || 0,
                    }))}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">No analyses yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {analysesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : analyses && analyses.length > 0 ? (
                  <div className="space-y-3">
                    {analyses.slice(0, 5).map((analysis) => (
                      <div key={analysis.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Swing Analysis</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(analysis.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge variant={analysis.overall_score >= 80 ? "default" : "secondary"}>
                          {analysis.overall_score?.toFixed(0) || "N/A"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analyses Tab */}
        <TabsContent value="analyses">
          <Card>
            <CardHeader>
              <CardTitle>All Swing Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {analysesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : analyses && analyses.length > 0 ? (
                <div className="space-y-3">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                         onClick={() => navigate(`/analysis/${analysis.id}`)}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {format(new Date(analysis.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                            <Badge variant={analysis.overall_score >= 80 ? "default" : "secondary"}>
                              {analysis.overall_score?.toFixed(0) || "N/A"}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {analysis.bat_score && <span>Bat: {analysis.bat_score.toFixed(0)}</span>}
                            {analysis.body_score && <span>Body: {analysis.body_score.toFixed(0)}</span>}
                            {analysis.ball_score && <span>Ball: {analysis.ball_score.toFixed(0)}</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No analyses found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals">
          <div className="grid gap-4 md:grid-cols-2">
            {goals && goals.length > 0 ? (
              goals.map((goal) => (
                <GoalProgressCard key={goal.id} goal={goal as any} />
              ))
            ) : (
              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center">No active goals</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Training Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <AthleteScheduleCalendar playerId={athleteId!} userId={athleteId!} isCoachView={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <CoachingNotesPanel athleteId={athleteId!} athleteEmail={profile.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
