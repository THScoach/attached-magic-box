import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Users, Search, TrendingUp, Flame, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface AthleteData {
  athlete_id: string;
  athlete_email: string;
  team_name: string | null;
  is_active: boolean;
  grit_score: number | null;
  current_streak: number | null;
  last_completion_date: string | null;
  total_completed: number | null;
  total_assigned: number | null;
}

export default function CoachRoster() {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<AthleteData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSeats: 0, usedSeats: 0, avgGrit: 0 });
  const navigate = useNavigate();
  const { isCoach, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && !isCoach) {
      navigate("/dashboard");
      return;
    }
    if (!roleLoading && isCoach) {
      loadRoster();
    }
  }, [isCoach, roleLoading, navigate]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredAthletes(
        athletes.filter((a) =>
          a.athlete_email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredAthletes(athletes);
    }
  }, [searchTerm, athletes]);

  const loadRoster = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get roster data with GRIT scores
      const { data: roster, error } = await supabase
        .from("team_rosters")
        .select(`
          athlete_id,
          team_name,
          is_active,
          seats_purchased
        `)
        .eq("coach_id", user.id);

      if (error) throw error;

      if (!roster || roster.length === 0) {
        setAthletes([]);
        setFilteredAthletes([]);
        setLoading(false);
        return;
      }

      // Get GRIT data for athletes
      const athleteIds = roster.map(r => r.athlete_id);

      const { data: gritData } = await supabase
        .from("grit_scores")
        .select("*")
        .in("user_id", athleteIds);

      const gritMap = new Map(gritData?.map(g => [g.user_id, g]) || []);

      const athleteData: AthleteData[] = roster.map(r => {
        const grit = gritMap.get(r.athlete_id);
        return {
          athlete_id: r.athlete_id,
          athlete_email: r.athlete_id.substring(0, 8) + "...", // Show partial ID for now
          team_name: r.team_name,
          is_active: r.is_active,
          grit_score: grit?.current_score || 0,
          current_streak: grit?.current_streak || 0,
          last_completion_date: grit?.last_completion_date || null,
          total_completed: grit?.total_tasks_completed || 0,
          total_assigned: grit?.total_tasks_assigned || 0,
        };
      });

      setAthletes(athleteData);
      setFilteredAthletes(athleteData);

      // Calculate stats
      const totalSeats = roster.reduce((sum, r) => sum + (r.seats_purchased || 0), 0);
      const usedSeats = roster.filter(r => r.is_active).length;
      const avgGrit = athleteData.reduce((sum, a) => sum + (a.grit_score || 0), 0) / athleteData.length;

      setStats({ totalSeats, usedSeats, avgGrit: Math.round(avgGrit) });
    } catch (error) {
      console.error("Error loading roster:", error);
      toast.error("Failed to load roster");
    } finally {
      setLoading(false);
    }
  };

  const getGritColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getActivityStatus = (lastDate: string | null) => {
    if (!lastDate) return { text: "Inactive", color: "text-red-500" };
    
    const daysSince = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince === 0) return { text: "Active Today", color: "text-green-500" };
    if (daysSince <= 2) return { text: `${daysSince}d ago`, color: "text-yellow-500" };
    return { text: `${daysSince}d inactive`, color: "text-red-500" };
  };

  if (roleLoading || loading) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Roster</h1>
          <p className="text-muted-foreground">
            Monitor your athletes' commitment and progress
          </p>
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
                <p className="text-sm text-muted-foreground">Team Avg GRIT</p>
                <p className={`text-2xl font-bold ${getGritColor(stats.avgGrit)}`}>
                  {stats.avgGrit}
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
                      GRIT Score
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
                    const completionRate = athlete.total_assigned
                      ? Math.round((athlete.total_completed! / athlete.total_assigned) * 100)
                      : 0;
                    const activity = getActivityStatus(athlete.last_completion_date);

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
                          <div className={`text-lg font-bold ${getGritColor(athlete.grit_score)}`}>
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
                            {athlete.total_completed || 0} / {athlete.total_assigned || 0}
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
      </div>
    </div>
  );
}
