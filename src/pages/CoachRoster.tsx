import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Users, Search, TrendingUp, Flame, UserPlus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useCoachRoster } from "@/hooks/useCoachRoster";
import { AddAthleteModal } from "@/components/AddAthleteModal";
import { format } from "date-fns";

export default function CoachRoster() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { isCoach, loading: roleLoading } = useUserRole();
  const { athletes, loading: rosterLoading, stats, reload } = useCoachRoster();

  const filteredAthletes = searchTerm
    ? athletes.filter((a) =>
        a.athlete_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : athletes;

  useEffect(() => {
    if (!roleLoading && !isCoach) {
      navigate("/dashboard");
      return;
    }
  }, [isCoach, roleLoading, navigate]);

  const getGrindColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getActivityStatus = (lastDate: string | null) => {
    if (!lastDate) return { text: "Never", color: "text-muted-foreground" };
    
    const daysSince = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince === 0) return { text: "Today", color: "text-green-500" };
    if (daysSince <= 2) return { text: `${daysSince}d ago`, color: "text-yellow-500" };
    if (daysSince <= 7) return { text: `${daysSince}d ago`, color: "text-orange-500" };
    return { text: `${daysSince}d ago`, color: "text-red-500" };
  };

  const avgGrind = athletes.length > 0
    ? Math.round(athletes.reduce((sum, a) => sum + a.grit_score, 0) / athletes.length)
    : 0;

  if (roleLoading || rosterLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/coach-dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">Team Roster</h1>
              <p className="text-muted-foreground">
                Monitor your athletes' commitment and progress
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} disabled={stats.availableSeats <= 0}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Athlete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Seats Used</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.usedSeats} / {stats.totalSeats}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <Progress value={(stats.usedSeats / stats.totalSeats) * 100} className="mt-3" />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Avg GRIND</p>
                <p className={`text-2xl font-bold ${getGrindColor(avgGrind)}`}>
                  {avgGrind}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Athletes</p>
                <p className="text-2xl font-bold text-foreground">
                  {athletes.filter(a => a.is_active).length}
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search athletes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Roster Table */}
        <Card>
          {filteredAthletes.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Athletes Yet</h3>
              <p className="text-muted-foreground">
                Athletes will appear here once you assign seats
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Athlete
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      GRIND Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Streak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredAthletes.map((athlete) => {
                    const completionRate = athlete.total_tasks_assigned
                      ? Math.round((athlete.total_tasks_completed / athlete.total_tasks_assigned) * 100)
                      : 0;
                    const activity = getActivityStatus(athlete.last_active);

                    return (
                      <tr key={athlete.athlete_id} className="hover:bg-accent/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">
                            {athlete.athlete_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">
                            {athlete.team_name || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-bold ${getGrindColor(athlete.grit_score)}`}>
                            {athlete.grit_score || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-foreground">
                              {athlete.current_streak || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">
                            {athlete.total_tasks_completed} / {athlete.total_tasks_assigned}
                            <span className="ml-2">({completionRate}%)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${activity.color}`}>
                            {activity.text}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {athlete.is_active ? (
                            <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <AddAthleteModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSuccess={reload}
          availableSeats={stats.availableSeats}
        />
      </div>
    </div>
  );
}
