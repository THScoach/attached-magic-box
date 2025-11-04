import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { differenceInMonths } from "date-fns";

export function ProfileUpdatePrompt() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptReason, setPromptReason] = useState<"outdated" | "inactive" | null>(null);

  useEffect(() => {
    checkProfileUpdate();
  }, []);

  const checkProfileUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_last_updated, last_active_at, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.onboarding_completed) return;

      const now = new Date();
      
      // Check if profile was last updated more than 6 months ago
      if (profile.profile_last_updated) {
        const monthsSinceUpdate = differenceInMonths(now, new Date(profile.profile_last_updated));
        if (monthsSinceUpdate >= 6) {
          setPromptReason("outdated");
          setShowPrompt(true);
          return;
        }
      }

      // Check if user was inactive for 3+ months
      if (profile.last_active_at) {
        const monthsSinceActive = differenceInMonths(now, new Date(profile.last_active_at));
        const daysSinceActive = Math.floor(
          (now.getTime() - new Date(profile.last_active_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Only show if user was inactive for 90+ days AND just logged back in
        if (monthsSinceActive >= 3 && daysSinceActive >= 90) {
          setPromptReason("inactive");
          setShowPrompt(true);
          return;
        }
      }
    } catch (error) {
      console.error("Error checking profile update:", error);
    }
  };

  const handleUpdateProfile = () => {
    setShowPrompt(false);
    navigate("/onboarding");
  };

  const handleRemindLater = async () => {
    // Store dismissed timestamp in localStorage to not show again for 1 week
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    localStorage.setItem("profileUpdateDismissed", oneWeekFromNow.toISOString());
    setShowPrompt(false);
  };

  const getMessage = () => {
    if (promptReason === "outdated") {
      return "It's been over 6 months since you last updated your profile. Your height and weight may have changed, which affects the accuracy of our momentum-based calculations.";
    }
    if (promptReason === "inactive") {
      return "Welcome back! It's been a while since your last visit. Let's update your profile to ensure your swing analysis remains accurate.";
    }
    return "";
  };

  return (
    <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Your Profile?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{getMessage()}</p>
            <p className="text-sm font-medium text-foreground mt-2">
              Updating your profile ensures:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>More accurate swing analysis</li>
              <li>Better personalized recommendations</li>
              <li>Precise momentum calculations</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleRemindLater}>
            Remind Me Later
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleUpdateProfile}>
            Update Profile
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
