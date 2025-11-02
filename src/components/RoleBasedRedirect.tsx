import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const navigate = useNavigate();
  const { role, loading } = useUserRole();

  useEffect(() => {
    if (!loading && role) {
      // Redirect based on role
      if (role === "admin") {
        navigate("/coach-dashboard", { replace: true });
      } else if (role === "coach") {
        navigate("/coach-dashboard", { replace: true });
      } else if (role === "athlete") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
