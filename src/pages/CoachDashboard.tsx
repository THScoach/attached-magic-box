import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, Ticket } from "lucide-react";

export default function CoachDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSeats: 0, usedSeats: 0, totalAthletes: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    loadCoachData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (roleData?.role === "coach") {
          setUser(session.user);
          await loadRosterStats(session.user.id);
        } else if (roleData?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setUser(null);
        navigate("/coach-auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadCoachData = async () => {
    // Check current auth state
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if user is actually a coach
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (roleData?.role === "coach") {
        setUser(user);
        await loadRosterStats(user.id);
      } else if (roleData?.role === "admin") {
        navigate("/admin");
        return;
      } else {
        navigate("/dashboard");
        return;
      }
    } else {
      navigate("/coach-auth");
      return;
    }
    setLoading(false);
  };

  const loadRosterStats = async (coachId: string) => {
    try {
      const { data: roster } = await supabase
        .from("team_rosters")
        .select("seats_purchased, is_active")
        .eq("coach_id", coachId);

      if (roster) {
        const totalSeats = roster.reduce((sum, r) => sum + (r.seats_purchased || 0), 0);
        const usedSeats = roster.filter(r => r.is_active).length;
        const totalAthletes = roster.length;
        setStats({ totalSeats, usedSeats, totalAthletes });
      }
    } catch (error) {
      console.error("Error loading roster stats:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/coach-auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const organizationName = user?.user_metadata?.organization_name || "Your Organization";

  return (
    <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Coach Dashboard</h1>
            <p className="text-muted-foreground">{organizationName}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Athletes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAthletes}</div>
              <p className="text-sm text-muted-foreground">Active athletes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Available Seats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.usedSeats} / {stats.totalSeats}</div>
              <p className="text-sm text-muted-foreground">Seats used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Promo Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Active codes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Athletes</CardTitle>
              <CardDescription>Manage your team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {stats.totalAthletes === 0 ? (
                  <p>No athletes yet</p>
                ) : (
                  <p>{stats.totalAthletes} athletes on your roster</p>
                )}
                <Button 
                  className="mt-4" 
                  onClick={() => navigate("/coach-roster")}
                >
                  View Full Roster
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Promo Codes</CardTitle>
              <CardDescription>Distribute access to your athletes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No promo codes generated</p>
                <Button className="mt-4" disabled>
                  Coming Soon: Generate Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Section */}
        <Card className="mt-6">
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
      </div>
    </div>
  );
}
