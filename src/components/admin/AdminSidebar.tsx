import {
  BarChart3,
  Users,
  FileVideo,
  TrendingUp,
  GitCompare,
  FileText,
  Settings,
  TestTube,
  Home,
  LogOut,
  UserCog,
  Calendar
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const handleSignOut = async () => {
    try {
      localStorage.removeItem('athleteInfo');
      localStorage.removeItem('onboardingComplete');
      
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Failed to sign out");
        return;
      }
      
      toast.success("Signed out successfully");
      window.location.href = "/coach-auth";
    } catch (error) {
      toast.error("An error occurred during sign out");
    }
  };

  const navItems = [
    { icon: Home, label: "Overview", path: "/admin" },
    { icon: Users, label: "Players", path: "/admin/players" },
    { icon: UserCog, label: "Team Roster", path: "/admin/roster" },
    { icon: Calendar, label: "Calendar", path: "/admin/calendar" },
    { icon: FileVideo, label: "All Analyses", path: "/admin/analyses" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: GitCompare, label: "Comparisons", path: "/admin/comparisons" },
    { icon: FileText, label: "Reports", path: "/admin/reports" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
    { icon: TestTube, label: "Test Features", path: "/admin/test" },
  ];

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">ADMIN</h1>
        <p className="text-sm text-muted-foreground">Coach Dashboard</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </aside>
  );
}
