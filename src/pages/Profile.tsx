import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { MembershipCard } from "@/components/MembershipCard";

import { User, Settings, HelpCircle, LogOut, Trophy, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      // Clear any local storage items
      localStorage.removeItem('athleteInfo');
      localStorage.removeItem('onboardingComplete');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error("Failed to sign out. Please try again.");
        setIsLoggingOut(false);
        return;
      }
      
      toast.success("Signed out successfully");
      
      // Force redirect to auth page
      window.location.href = "/auth";
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast.error("An error occurred during sign out");
      setIsLoggingOut(false);
    }
  };
  
  const user = {
    name: "Alex Rodriguez",
    email: "alex@email.com",
    memberSince: "Oct 2025",
    totalSwings: 47,
    bestScore: 82,
    currentStreak: 5
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Member since {user.memberSince}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{user.totalSwings}</p>
            <p className="text-xs text-muted-foreground">Swings</p>
          </Card>
          <Card className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{user.bestScore}</p>
            <p className="text-xs text-muted-foreground">Best Score</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">🔥</div>
            <p className="text-2xl font-bold">{user.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
        </div>

        {/* Membership */}
        <MembershipCard />
        

        {/* Menu Options */}
        <section className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => toast.info("Settings coming soon!")}
          >
            <Settings className="h-5 w-5" />
            <div className="text-left">
              <div className="font-bold">Settings</div>
              <div className="text-xs opacity-70">Preferences and notifications</div>
            </div>
          </Button>

          {isAdmin && (
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/tier-demo')}
            >
              <Trophy className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-bold">Test Tiers</div>
                <div className="text-xs opacity-70">Demo tier-based features</div>
              </div>
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => toast.info("Help center coming soon!")}
          >
            <HelpCircle className="h-5 w-5" />
            <div className="text-left">
              <div className="font-bold">Help & Support</div>
              <div className="text-xs opacity-70">FAQs and contact support</div>
            </div>
          </Button>
        </section>

        {/* About */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-bold mb-2">About H.I.T.S. Score</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The Hitting Intelligence Tempo Score measures your swing's kinematic sequence—
            the timing and coordination of your pelvis, torso, and hands. This is the key 
            difference between good hitters and great ones.
          </p>
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={() => toast.info("Learn more coming soon!")}
          >
            Learn more about the science →
          </Button>
        </Card>

        {/* Sign Out */}
        <Card className="p-4 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/privacy')}
          >
            Privacy Policy
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin')}
            >
              Admin Dashboard
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive"
            onClick={handleSignOut}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </>
            )}
          </Button>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
