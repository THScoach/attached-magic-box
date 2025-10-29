import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "coach" | "athlete" | "admin" | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading user role:", error);
        setRole(null);
      } else {
        setRole((data?.role as UserRole) || null);
      }
    } catch (error) {
      console.error("Error in loadUserRole:", error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return { role, loading, isCoach: role === "coach", isAthlete: role === "athlete", isAdmin: role === "admin" };
}
