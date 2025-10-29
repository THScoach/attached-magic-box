import { Home, Camera, TrendingUp, Target, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Camera, label: "Analyze", path: "/analyze" },
    { icon: TrendingUp, label: "Progress", path: "/progress" },
    { icon: Target, label: "Drills", path: "/drills" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center justify-around flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
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
