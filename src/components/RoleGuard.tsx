import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/dashboard" }: RoleGuardProps) {
  const navigate = useNavigate();
  const { role, loading } = useUserRole();

  useEffect(() => {
    if (!loading && role) {
      const isAllowed = allowedRoles.includes(role);
      
      if (!isAllowed) {
        toast.error("You don't have permission to access this page");
        navigate(redirectTo, { replace: true });
      }
    }
  }, [role, loading, allowedRoles, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAllowed = role && allowedRoles.includes(role);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
