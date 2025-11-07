import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ExternalLink, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function RecentWhopSubscriptions() {
  const { toast } = useToast();
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [linkedAthletes, setLinkedAthletes] = useState<Set<string>>(new Set());

  const { data: recentSubscriptions, isLoading, refetch } = useQuery({
    queryKey: ["recent-whop-subscriptions"],
    queryFn: async () => {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, whop_user_id, whop_username, created_at")
        .not("whop_user_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (profileError) throw profileError;
      return profiles || [];
    },
  });

  const handleLinkAthlete = async (profileId: string, whopUserId: string) => {
    setLinkingId(profileId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("team_rosters")
        .insert({
          coach_id: user.id,
          athlete_id: profileId,
          seats_purchased: 1,
          is_active: true,
        });

      if (error) throw error;

      setLinkedAthletes(prev => new Set([...prev, profileId]));
      refetch();

      toast({
        title: "Athlete linked successfully",
        description: "The athlete has been added to your roster.",
      });
    } catch (error: any) {
      toast({
        title: "Error linking athlete",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLinkingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Whop Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent Whop Subscriptions
        </CardTitle>
        <CardDescription>
          New athletes who subscribed through your Whop storefront
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!recentSubscriptions || recentSubscriptions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No Whop subscriptions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSubscriptions.map((sub) => {
              const isLinked = linkedAthletes.has(sub.id);
              
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {sub.whop_username || sub.email}
                      </p>
                      {isLinked && (
                        <Badge variant="outline" className="gap-1 shrink-0">
                          <CheckCircle className="h-3 w-3" />
                          Linked
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono bg-muted px-2 py-0.5 rounded">
                        {sub.whop_user_id}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(sub.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                  
                  {!isLinked && (
                    <Button
                      size="sm"
                      onClick={() => handleLinkAthlete(sub.id, sub.whop_user_id!)}
                      disabled={linkingId === sub.id}
                      className="ml-3 shrink-0"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {linkingId === sub.id ? "Linking..." : "Link Now"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
