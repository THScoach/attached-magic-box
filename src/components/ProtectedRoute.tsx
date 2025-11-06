import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWhopAuth } from "@/contexts/WhopContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useWhopAuth();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // In Whop, users must authenticate through Whop's platform
      console.log('[ProtectedRoute] User not authenticated in Whop');
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, requireAuth, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Access via Whop</h2>
          <p className="text-muted-foreground">
            Please access HITS through your Whop membership portal.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
