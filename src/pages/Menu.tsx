import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Users, 
  Settings, 
  FileText, 
  LogOut,
  Upload,
  Video,
  UploadCloud,
  History,
  GitCompare,
  Music,
  BookOpen,
  TrendingUp,
  Target,
  HelpCircle,
  MessageSquare,
  Bug,
  FileCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { useUserRole } from "@/hooks/useUserRole";

export default function Menu() {
  const navigate = useNavigate();
  const { isAdmin, isCoach } = useUserRole();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick 
  }: { 
    icon: any; 
    label: string; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors rounded-lg group"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="text-foreground">{label}</span>
      </div>
      <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/home')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-center text-foreground">⚾ The Hitting Skool</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Account Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">ACCOUNT</h2>
          <Card>
            <CardContent className="p-2">
              <MenuItem icon={User} label="My Profile" onClick={() => navigate('/profile')} />
              {(isAdmin || isCoach) && (
                <MenuItem icon={Users} label="My Team" onClick={() => navigate('/admin/roster')} />
              )}
              <MenuItem icon={Settings} label="Settings" onClick={() => navigate('/profile')} />
              <MenuItem icon={FileText} label="Legal" onClick={() => navigate('/terms')} />
              <MenuItem icon={LogOut} label="Sign Out" onClick={handleSignOut} />
            </CardContent>
          </Card>
        </div>

        {/* Analysis Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">ANALYSIS</h2>
          <Card>
            <CardContent className="p-2">
              <MenuItem icon={Upload} label="Upload Reboot PDF" onClick={() => navigate('/reboot-analysis')} />
              <MenuItem icon={Video} label="Record Video" onClick={() => navigate('/reboot-analysis')} />
              <MenuItem icon={UploadCloud} label="Upload Video" onClick={() => navigate('/reboot-analysis')} />
              <MenuItem icon={History} label="Analysis History" onClick={() => navigate('/reboot-analysis')} />
              <MenuItem icon={GitCompare} label="Compare Swings" onClick={() => navigate('/comparison')} />
            </CardContent>
          </Card>
        </div>

        {/* Training Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">TRAINING</h2>
          <Card>
            <CardContent className="p-2">
              <MenuItem icon={Music} label="Tempo Trainer" onClick={() => navigate('/training')} />
              <MenuItem icon={BookOpen} label="Training Programs" onClick={() => navigate('/training')} />
              <MenuItem icon={TrendingUp} label="Progress Tracking" onClick={() => navigate('/progress')} />
              <MenuItem icon={Target} label="Zone Distribution" onClick={() => navigate('/progress')} />
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">SUPPORT</h2>
          <Card>
            <CardContent className="p-2">
              <MenuItem icon={HelpCircle} label="FAQs" onClick={() => navigate('/about')} />
              <MenuItem icon={MessageSquare} label="Contact Coach" onClick={() => navigate('/book-call')} />
              <MenuItem icon={Bug} label="Report Issue" onClick={() => toast.info("Feature coming soon")} />
              <MenuItem icon={FileCode} label="Log Files" onClick={() => toast.info("Feature coming soon")} />
            </CardContent>
          </Card>
        </div>

        {/* Version */}
        <p className="text-center text-sm text-muted-foreground">
          The Hitting Skool v1.0.0
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
