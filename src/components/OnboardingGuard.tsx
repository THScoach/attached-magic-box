import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, [role, roleLoading]);

  const checkOnboarding = async () => {
    if (roleLoading) return;

    // Only check onboarding for athletes
    if (role !== "athlete") {
      setChecking(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!profile?.onboarding_completed) {
        navigate("/onboarding", { replace: true });
        return;
      }
    } catch (error) {
      console.error("Error checking onboarding:", error);
    } finally {
      setChecking(false);
    }
  };

  if (roleLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
