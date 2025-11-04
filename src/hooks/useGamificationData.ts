import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCelebration } from "./useCelebration";

interface GamificationData {
  currentXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  practiceDays: string[];
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
    target?: number;
  }>;
}

export function useGamificationData(playerId?: string) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { celebrate } = useCelebration();

  useEffect(() => {
    loadGamificationData();
  }, [playerId]);

  const loadGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch gamification data
      const { data: gamData, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading gamification data:", error);
      }

      if (gamData) {
        // Calculate XP and level from total checkins
        const totalCheckins = gamData.total_checkins || 0;
        const currentXP = totalCheckins * 100; // 100 XP per checkin
        const currentLevel = Math.floor(currentXP / 500) + 1; // Level up every 500 XP

        // Parse practice days from JSONB
        const practiceDays = Array.isArray(gamData.practice_days) 
          ? (gamData.practice_days as string[])
          : [];

        // Parse badges from JSONB
        const badges = Array.isArray(gamData.badges) 
          ? (gamData.badges as any[])
          : [];

        setData({
          currentXP,
          currentLevel,
          currentStreak: gamData.current_streak || 0,
          longestStreak: gamData.longest_streak || 0,
          totalCheckins,
          practiceDays,
          badges,
        });
      } else {
        // Initialize with default data if no record exists
        setData({
          currentXP: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
          totalCheckins: 0,
          practiceDays: [],
          badges: [],
        });
      }
    } catch (error) {
      console.error("Error in loadGamificationData:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Get current data
      const { data: currentData } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const lastCheckin = currentData?.last_checkin_date;
      const practiceDays = Array.isArray(currentData?.practice_days) 
        ? currentData.practice_days 
        : [];

      // Don't update if already checked in today
      if (lastCheckin === today) return;

      // Calculate new streak
      let newStreak = 1;
      if (lastCheckin) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastCheckin === yesterdayStr) {
          newStreak = (currentData?.current_streak || 0) + 1;
        }
      }

      // Add today to practice days if not already there
      const updatedPracticeDays = practiceDays.includes(today)
        ? practiceDays
        : [...practiceDays, today];

      // Update database
      const { error } = await supabase
        .from("user_gamification")
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, currentData?.longest_streak || 0),
          last_checkin_date: today,
          total_checkins: (currentData?.total_checkins || 0) + 1,
          practice_days: updatedPracticeDays,
          badges: currentData?.badges || [],
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error("Error updating streak:", error);
      } else {
        // Create notifications and celebrations for streak milestones
        if (newStreak === 7) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'achievement',
            title: '🔥 Week Streak!',
            message: 'You\'ve practiced 7 days in a row! Keep the momentum going!'
          });
          celebrate({
            type: "streak",
            title: "7 Day Streak! 🔥",
            message: "You've practiced 7 days in a row! Keep the momentum going!",
            metric: "Practice Streak",
            value: 7,
          });
        } else if (newStreak === 30) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'achievement',
            title: '🔥 Month Streak!',
            message: 'Incredible! 30 days of consistent practice. You\'re unstoppable!'
          });
          celebrate({
            type: "streak",
            title: "30 Day Streak! 🔥",
            message: "Incredible! 30 days of consistent practice. You're unstoppable!",
            metric: "Practice Streak",
            value: 30,
          });
        } else if (newStreak % 100 === 0) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'achievement',
            title: '🔥 Century Streak!',
            message: `Amazing! ${newStreak} days in a row! You\'re a legend!`
          });
          celebrate({
            type: "streak",
            title: `${newStreak} Day Streak! 🔥`,
            message: `Amazing! ${newStreak} days in a row! You're a legend!`,
            metric: "Practice Streak",
            value: newStreak,
          });
        }
        
        // Reload data
        await loadGamificationData();
      }
    } catch (error) {
      console.error("Error in updateStreak:", error);
    }
  };

  const unlockBadge = async (badgeId: string, badgeName: string, badgeDescription: string, badgeIcon: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentData } = await supabase
        .from("user_gamification")
        .select("badges")
        .eq("user_id", user.id)
        .maybeSingle();

      const currentBadges = Array.isArray(currentData?.badges) ? currentData.badges : [];
      
      // Check if badge already exists
      const badgeExists = currentBadges.some((b: any) => b.id === badgeId);
      if (badgeExists) return;

      // Add new badge
      const newBadge = {
        id: badgeId,
        name: badgeName,
        description: badgeDescription,
        icon: badgeIcon,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };

      const updatedBadges = [...currentBadges, newBadge];

      const { error } = await supabase
        .from("user_gamification")
        .update({ badges: updatedBadges })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error unlocking badge:", error);
      } else {
        // Create notification and celebration for badge unlock
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'achievement',
          title: `🏆 Badge Unlocked: ${badgeName}`,
          message: badgeDescription
        });
        
        celebrate({
          type: "badge",
          title: `Badge Unlocked! 🏆`,
          message: badgeDescription,
          metric: badgeName,
        });
        
        await loadGamificationData();
      }
    } catch (error) {
      console.error("Error in unlockBadge:", error);
    }
  };

  return {
    data,
    loading,
    refetch: loadGamificationData,
    updateStreak,
    unlockBadge,
  };
}
