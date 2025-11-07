import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddAthleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableSeats: number;
}

export function AddAthleteModal({ open, onOpenChange, onSuccess, availableSeats }: AddAthleteModalProps) {
  const [athleteEmail, setAthleteEmail] = useState("");
  const [whopUserId, setWhopUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddAthleteByEmail = async () => {
    if (!athleteEmail.trim()) {
      toast.error("Please enter athlete email");
      return;
    }

    if (availableSeats <= 0) {
      toast.error("No available seats. Purchase more seats first.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        return;
      }

      // First, get all users to find the athlete by email
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError || !usersData) {
        toast.error("Failed to fetch users");
        return;
      }

      const athleteUser = usersData.users.find((u: any) => u.email === athleteEmail.trim());

      if (!athleteUser) {
        toast.error("No user found with that email. They must sign up first.");
        return;
      }

      // Check if athlete is already on roster
      const { data: existingRoster } = await supabase
        .from("team_rosters")
        .select("id, is_active")
        .eq("coach_id", user.id)
        .eq("athlete_id", athleteUser.id)
        .maybeSingle();

      if (existingRoster) {
        if (existingRoster.is_active) {
          toast.error("This athlete is already on your roster");
          return;
        } else {
          // Reactivate
          const { error } = await supabase
            .from("team_rosters")
            .update({ is_active: true, assigned_at: new Date().toISOString() })
            .eq("id", existingRoster.id);

          if (error) throw error;
          toast.success(`${athleteEmail} reactivated on roster`);
        }
      } else {
        // Add new roster entry
        const { error } = await supabase
          .from("team_rosters")
          .insert({
            coach_id: user.id,
            athlete_id: athleteUser.id,
            seats_purchased: 0, // Seat count managed at coach level
            is_active: true,
          });

        if (error) throw error;
        toast.success(`${athleteEmail} added to roster`);
      }

      setAthleteEmail("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding athlete:", error);
      toast.error(error.message || "Failed to add athlete");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAthleteByWhopId = async () => {
    if (!whopUserId.trim()) {
      toast.error("Please enter Whop User ID");
      return;
    }

    if (availableSeats <= 0) {
      toast.error("No available seats. Purchase more seats first.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        return;
      }

      // Find profile by whop_user_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, whop_username")
        .eq("whop_user_id", whopUserId.trim())
        .maybeSingle();

      if (profileError || !profile) {
        toast.error("No athlete found with that Whop User ID. They must subscribe via Whop first.");
        return;
      }

      // Check if athlete is already on roster
      const { data: existingRoster } = await supabase
        .from("team_rosters")
        .select("id, is_active")
        .eq("coach_id", user.id)
        .eq("athlete_id", profile.id)
        .maybeSingle();

      if (existingRoster) {
        if (existingRoster.is_active) {
          toast.error("This athlete is already on your roster");
          return;
        } else {
          // Reactivate
          const { error } = await supabase
            .from("team_rosters")
            .update({ is_active: true, assigned_at: new Date().toISOString() })
            .eq("id", existingRoster.id);

          if (error) throw error;
          toast.success(`${profile.whop_username || profile.email} reactivated on roster`);
        }
      } else {
        // Add new roster entry
        const { error } = await supabase
          .from("team_rosters")
          .insert({
            coach_id: user.id,
            athlete_id: profile.id,
            seats_purchased: 0, // Seat count managed at coach level
            is_active: true,
          });

        if (error) throw error;
        toast.success(`${profile.whop_username || profile.email} added to roster`);
      }

      setWhopUserId("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding athlete by Whop ID:", error);
      toast.error(error.message || "Failed to add athlete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Athlete to Roster</DialogTitle>
          <DialogDescription>
            Link an athlete to your coaching dashboard
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">By Email</TabsTrigger>
            <TabsTrigger value="whop">By Whop ID</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            {availableSeats <= 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  ⚠️ No available seats. Purchase more seats to add athletes.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="athleteEmail">Athlete Email</Label>
              <Input
                id="athleteEmail"
                type="email"
                placeholder="athlete@example.com"
                value={athleteEmail}
                onChange={(e) => setAthleteEmail(e.target.value)}
                disabled={loading || availableSeats <= 0}
              />
              <p className="text-xs text-muted-foreground">
                The athlete must already have a HITS account
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleAddAthleteByEmail} disabled={loading || availableSeats <= 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Athlete
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="whop" className="space-y-4">
            {availableSeats <= 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  ⚠️ No available seats. Purchase more seats to add athletes.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="whopUserId">Whop User ID</Label>
              <Input
                id="whopUserId"
                type="text"
                placeholder="user_xxxxx"
                value={whopUserId}
                onChange={(e) => setWhopUserId(e.target.value)}
                disabled={loading || availableSeats <= 0}
              />
              <p className="text-xs text-muted-foreground">
                Link an athlete who subscribed via Whop. Ask them for their Whop User ID from their account settings.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleAddAthleteByWhopId} disabled={loading || availableSeats <= 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Link Athlete
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}