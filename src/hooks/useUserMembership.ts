import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MembershipTier = "free" | "basic" | "pro";

interface UserMembership {
  tier: MembershipTier;
  status: string;
  expiresAt: string | null;
}

export function useUserMembership() {
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembership();
  }, []);

  const loadMembership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMembership(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_memberships")
        .select("tier, status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        console.error("Error loading membership:", error);
        setMembership({ tier: "free", status: "active", expiresAt: null });
      } else if (data) {
        setMembership({
          tier: data.tier as MembershipTier,
          status: data.status,
          expiresAt: data.expires_at,
        });
      } else {
        setMembership({ tier: "free", status: "active", expiresAt: null });
      }
    } catch (error) {
      console.error("Error in loadMembership:", error);
      setMembership({ tier: "free", status: "active", expiresAt: null });
    } finally {
      setLoading(false);
    }
  };

  return { membership, loading, refetch: loadMembership };
}
