import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, Ticket, TrendingUp, UserPlus, Calendar } from "lucide-react";
import { useCoachRoster } from "@/hooks/useCoachRoster";
import { AddAthleteModal } from "@/components/AddAthleteModal";
import { PromoCodeManager } from "@/components/PromoCodeManager";
import { RealtimeNotificationCenter } from "@/components/RealtimeNotificationCenter";
import { CoachAITrainingInput } from "@/components/admin/CoachAITrainingInput";
import { CoachRickChatBubble } from "@/components/CoachRickChatBubble";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trophy } from "lucide-react";
import { TeamChallengeManager } from "@/components/admin/TeamChallengeManager";
import { DrillEffectivenessPanel } from "@/components/admin/DrillEffectivenessPanel";
import { ChallengeLeaderboard } from "@/components/ChallengeLeaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AthleteProgressOverview } from "@/components/admin/AthleteProgressOverview";
import { TeamAnalyticsDashboard } from "@/components/admin/TeamAnalyticsDashboard";
import { AthleteReportScheduler } from "@/components/admin/AthleteReportScheduler";
import { AthleteComparison } from "@/components/admin/AthleteComparison";
import { TeamLeaderboards } from "@/components/admin/TeamLeaderboards";
import { CoachingNotesPanel } from "@/components/admin/CoachingNotesPanel";
import { BulkTeamActions } from "@/components/admin/BulkTeamActions";
import { ParentGuardianManager } from "@/components/admin/ParentGuardianManager";

export default function CoachDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { athletes, loading: rosterLoading, stats, reload } = useCoachRoster();

  useEffect(() => {
    loadCoachData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        navigate("/coach-auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadCoachData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    } else {
      navigate("/coach-auth");
      return;
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('athleteInfo');
      localStorage.removeItem('onboardingComplete');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error("Failed to sign out. Please try again.");
        return;
      }
      
      toast.success("Signed out successfully");
      
      // Force redirect to coach auth page
      window.location.href = "/coach-auth";
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast.error("An error occurred during sign out");
    }
  };

  if (loading || rosterLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const avgGrind = athletes.length > 0
    ? Math.round(athletes.reduce((sum, a) => sum + a.grit_score, 0) / athletes.length)
    : 0;

  const organizationName = user?.user_metadata?.organization_name || "Your Organization";

  // Calculate alerts (simplified for now)
  const lowGrindAthletes = athletes.filter((a) => a.grit_score < 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Coach Dashboard</h1>
            <p className="text-muted-foreground">{organizationName}</p>
          </div>
          <div className="flex items-center gap-2">
            <RealtimeNotificationCenter />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {lowGrindAthletes.length > 0 && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {lowGrindAthletes.length} athlete(s) with GRIND score below 50 — time to push harder
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Seats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.usedSeats} / {stats.totalSeats}</div>
              <p className="text-sm text-muted-foreground">
                {stats.availableSeats} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Athletes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{athletes.length}</div>
              <p className="text-sm text-muted-foreground">On roster</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Team Avg GRIND
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{avgGrind}</div>
              <p className="text-sm text-muted-foreground">Commitment score</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Training Input */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-1">
            <TabsTrigger value="analytics" className="text-xs">
              <TrendingUp className="h-4 w-4 lg:mr-1" />
              <span className="hidden lg:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="text-xs">
              <Trophy className="h-4 w-4 lg:mr-1" />
              <span className="hidden lg:inline">Leaders</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="text-xs">
              <Users className="h-4 w-4 lg:mr-1" />
              <span className="hidden lg:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="athletes" className="text-xs">
              <Users className="h-4 w-4 lg:mr-1" />
              <span className="hidden lg:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">
              <Calendar className="h-4 w-4 lg:mr-1" />
              <span className="hidden lg:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-xs">
              <span className="hidden lg:inline">Manage</span>
              <span className="lg:hidden">Mgmt</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs">
              <Trophy className="h-4 w-4 lg:mr-1" />
              <span className="hidden lg:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="effectiveness" className="text-xs">
              <span className="hidden lg:inline">Drills</span>
              <span className="lg:hidden">Dr</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <span className="hidden lg:inline">Notes</span>
              <span className="lg:hidden">Nt</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="text-xs">
              <span className="hidden lg:inline">Bulk</span>
              <span className="lg:hidden">Bk</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <TeamAnalyticsDashboard athleteIds={athletes.map(a => a.athlete_id)} />
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-6">
            <TeamLeaderboards athletes={athletes.map(a => ({ athlete_id: a.athlete_id, athlete_email: a.athlete_email }))} />
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <AthleteComparison athletes={athletes.map(a => ({ athlete_id: a.athlete_id, athlete_email: a.athlete_email }))} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <AthleteReportScheduler athletes={athletes.map(a => ({ athlete_id: a.athlete_id, athlete_email: a.athlete_email }))} />
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <div className="grid gap-6">
              {athletes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No athletes on your roster yet</p>
                  </CardContent>
                </Card>
              ) : (
                athletes.map((athlete) => (
                  <CoachingNotesPanel
                    key={athlete.athlete_id}
                    athleteId={athlete.athlete_id}
                    athleteEmail={athlete.athlete_email}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="athletes" className="space-y-6">
            <Alert>
              <AlertDescription>
                Parents can access athlete progress via /parent-portal after being added by a coach
              </AlertDescription>
            </Alert>
            {athletes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No athletes on your roster yet</p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Athlete
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {athletes.map((athlete) => (
                    <div key={athlete.athlete_id} className="space-y-4">
                      <AthleteProgressOverview
                        athleteId={athlete.athlete_id}
                        athleteEmail={athlete.athlete_email}
                      />
                      <ParentGuardianManager
                        athleteId={athlete.athlete_id}
                        athleteEmail={athlete.athlete_email}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <CoachAITrainingInput />

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Athletes</CardTitle>
                  <CardDescription>Manage your team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    {athletes.length === 0 ? (
                      <p className="text-muted-foreground mb-4">No athletes yet</p>
                    ) : (
                      <p className="text-muted-foreground mb-4">{athletes.length} athletes on your roster</p>
                    )}
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={() => setShowAddModal(true)}
                        disabled={stats.availableSeats <= 0}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Athlete
                      </Button>
                      {athletes.length > 0 && (
                        <Button 
                          variant="outline"
                          onClick={() => navigate("/coach-roster")}
                        >
                          View Full Roster
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <PromoCodeManager availableSeats={stats.availableSeats} />
            </div>

            {/* Purchase Section */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Team Seats</CardTitle>
                <CardDescription>
                  Get discounted rates for bulk team access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-bold">Team Package - 10 Seats</h3>
                      <p className="text-sm text-muted-foreground">Discounted rate for coaching organizations</p>
                    </div>
                    <Button disabled>Coming Soon</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <TeamChallengeManager />
            <ChallengeLeaderboard />
          </TabsContent>

          <TabsContent value="effectiveness">
            <DrillEffectivenessPanel />
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            {athletes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No athletes on your roster yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {athletes.map((athlete) => (
                  <CoachingNotesPanel
                    key={athlete.athlete_id}
                    athleteId={athlete.athlete_id}
                    athleteEmail={athlete.athlete_email}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <BulkTeamActions athletes={athletes.map(a => ({
              id: a.athlete_id,
              email: a.athlete_email
            }))} />
          </TabsContent>
        </Tabs>

        <AddAthleteModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSuccess={reload}
          availableSeats={stats.availableSeats}
        />
        <CoachRickChatBubble />
      </div>
    </div>
  );
}
