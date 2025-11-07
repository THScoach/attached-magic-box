import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWhopAutoSync } from "@/hooks/useWhopAutoSync";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Auto-sync Whop data when user is authenticated
  const { syncing: whopSyncing } = useWhopAutoSync();

  useEffect(() => {
    // Check current auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading || whopSyncing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <p>{whopSyncing ? 'Syncing your subscription...' : 'Loading...'}</p>
          {whopSyncing && (
            <p className="text-sm text-muted-foreground">Please wait a moment</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
