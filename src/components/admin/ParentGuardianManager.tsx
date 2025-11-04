import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Trash2, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ParentGuardianManagerProps {
  athleteId: string;
  athleteEmail: string;
}

export function ParentGuardianManager({ athleteId, athleteEmail }: ParentGuardianManagerProps) {
  const [parentEmail, setParentEmail] = useState("");
  const [relationship, setRelationship] = useState<"parent" | "guardian" | "other">("parent");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: guardians = [], refetch } = useQuery({
    queryKey: ["parent-guardians", athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_guardians")
        .select("*")
        .eq("athlete_id", athleteId);

      if (error) throw error;

      // Fetch parent emails
      const parentIds = data.map((g: any) => g.parent_user_id);
      if (parentIds.length === 0) return [];

      const usersResponse = await supabase.auth.admin.listUsers();
      const userMap = new Map<string, string>(
        usersResponse.data?.users
          .filter((u: any) => u.email)
          .map((u: any) => [u.id, u.email] as [string, string]) || []
      );

      return data.map((g: any) => ({
        ...g,
        parentEmail: userMap.get(g.parent_user_id) || "Unknown",
      }));
    },
    enabled: !!athleteId,
  });

  const handleAddParent = async () => {
    if (!parentEmail.trim()) {
      toast.error("Please enter a parent email");
      return;
    }

    setIsProcessing(true);
    try {
      // Find user by email
      const usersResponse = await supabase.auth.admin.listUsers();
      const parentUser = usersResponse.data?.users.find(
        (u: any) => u.email.toLowerCase() === parentEmail.toLowerCase()
      );

      if (!parentUser) {
        toast.error("No user found with that email. They must create an account first.");
        return;
      }

      // Add parent connection
      const { error } = await supabase.from("parent_guardians").insert({
        parent_user_id: parentUser.id,
        athlete_id: athleteId,
        relationship,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This parent is already connected to this athlete");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Parent/guardian added successfully");
      setParentEmail("");
      refetch();
    } catch (error) {
      console.error("Error adding parent:", error);
      toast.error("Failed to add parent/guardian");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveParent = async (guardianId: string) => {
    try {
      const { error } = await supabase
        .from("parent_guardians")
        .delete()
        .eq("id", guardianId);

      if (error) throw error;

      toast.success("Parent/guardian removed");
      refetch();
    } catch (error) {
      console.error("Error removing parent:", error);
      toast.error("Failed to remove parent/guardian");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent/Guardian Access</CardTitle>
        <CardDescription>
          Manage who can view {athleteEmail.split("@")[0]}'s progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Parent Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-accent/5">
          <h3 className="font-semibold">Add Parent/Guardian</h3>
          
          <div className="space-y-2">
            <Label>Parent/Guardian Email</Label>
            <Input
              type="email"
              placeholder="parent@example.com"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              They must have an account already
            </p>
          </div>

          <div className="space-y-2">
            <Label>Relationship</Label>
            <Select value={relationship} onValueChange={(value: any) => setRelationship(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddParent} disabled={isProcessing} className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Parent/Guardian
          </Button>
        </div>

        {/* Current Parents List */}
        <div className="space-y-3">
          <h3 className="font-semibold">Current Access</h3>
          
          {guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No parents/guardians added yet
            </p>
          ) : (
            <div className="space-y-2">
              {guardians.map((guardian: any) => (
                <div
                  key={guardian.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{guardian.parentEmail}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {guardian.relationship}
                        {guardian.is_primary && " • Primary"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveParent(guardian.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
