import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, Ticket, TrendingUp, UserPlus } from "lucide-react";
import { useCoachRoster } from "@/hooks/useCoachRoster";
import { AddAthleteModal } from "@/components/AddAthleteModal";
import { useTierAccess } from "@/hooks/useTierAccess";

export default function CoachDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const tierAccess = useTierAccess();
  const { athletes, loading: rosterLoading, stats, reload } = useCoachRoster();

  useEffect(() => {
    if (!tierAccess.loading && !tierAccess.canViewCoachDashboard) {
      navigate("/dashboard");
      return;
    }

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
  }, [navigate, tierAccess.loading, tierAccess.canViewCoachDashboard]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/coach-auth");
  };

  if (loading || rosterLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const avgGrit = athletes.length > 0
    ? Math.round(athletes.reduce((sum, a) => sum + a.grit_score, 0) / athletes.length)
    : 0;

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
                Team Avg GRIT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{avgGrit}</div>
              <p className="text-sm text-muted-foreground">Commitment score</p>
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
