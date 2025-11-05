import { useUserRole } from "@/hooks/useUserRole";
import { useCoachRoster } from "@/hooks/useCoachRoster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamAnalyticsDashboard } from "@/components/admin/TeamAnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AthleteComparison } from "@/components/admin/AthleteComparison";
import { AthleteProgressOverview } from "@/components/admin/AthleteProgressOverview";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export default function TeamAnalytics() {
  const { isCoach, loading: roleLoading } = useUserRole();
  const { athletes, loading: athletesLoading } = useCoachRoster();

  if (roleLoading || athletesLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isCoach) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              This page is only available for coaches.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const athleteIds = athletes.map(a => a.athlete_id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Team Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive performance insights for your team
          </p>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Athletes</p>
              <p className="text-2xl font-bold">{athletes.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {athleteIds.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Athletes Yet</h3>
            <p className="text-muted-foreground">
              Add athletes to your roster to see team analytics and insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TeamAnalyticsDashboard athleteIds={athleteIds} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {athletes.map((athlete) => (
                <AthleteProgressOverview
                  key={athlete.athlete_id}
                  athleteId={athlete.athlete_id}
                  athleteEmail={athlete.athlete_email}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <AthleteComparison athletes={athletes.map(a => ({ athlete_id: a.athlete_id, athlete_email: a.athlete_email }))} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
