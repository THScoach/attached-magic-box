import { Home, Camera, TrendingUp, Target, User, FileText, Award, BarChart3, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { useUserRole } from "@/hooks/useUserRole";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCoach } = useUserRole();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Users, label: "Players", path: "/coach-roster", coachOnly: true },
    { 
      icon: Camera, 
      label: "Analyze", 
      path: isCoach ? "/admin/players" : "/reboot-analysis" 
    },
    { icon: BarChart3, label: "Motion", path: "/reboot-analysis" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  const handleNavClick = (path: string) => {
    // If already on this path, don't navigate (prevents unnecessary re-renders)
    if (location.pathname === path) {
      return;
    }
    navigate(path);
  };

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item => {
    if (item.coachOnly && !isCoach) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center justify-around flex-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="pl-2">
          <NotificationBell />
        </div>
      </div>
    </nav>
  );
}
