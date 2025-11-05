import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MembershipTier = "free" | "challenge" | "diy" | "elite";

export interface SubscriptionData {
  tier: MembershipTier;
  status: string;
  expiresAt: string | null;
  swingCount: number;
  whopUserId: string | null;
  features: {
    unlimitedAnalyses: boolean;
    coachRickAI: boolean;
    drillPlans: boolean;
    advancedReports: boolean;
    liveCoaching: boolean;
    swingsAllowed: number;
  };
}

export function useSubscriptionTier() {
  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscription-tier"],
    queryFn: async (): Promise<SubscriptionData> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Get membership data
      const { data: membership, error: membershipError } = await supabase
        .from("user_memberships")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (membershipError) {
        console.error("Error fetching membership:", membershipError);
        // Return free tier as default
        return {
          tier: "free",
          status: "active",
          expiresAt: null,
          swingCount: 0,
          whopUserId: null,
          features: getFeaturesByTier("free"),
        };
      }

      return {
        tier: membership.tier as MembershipTier,
        status: membership.status,
        expiresAt: membership.expires_at,
        swingCount: membership.swing_count || 0,
        whopUserId: membership.whop_user_id,
        features: getFeaturesByTier(membership.tier as MembershipTier),
      };
    },
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  return {
    subscription,
    isLoading,
    error,
    refreshTier: refetch,
  };
}

function getFeaturesByTier(tier: MembershipTier) {
  const features = {
    free: {
      unlimitedAnalyses: false,
      coachRickAI: false,
      drillPlans: false,
      advancedReports: false,
      liveCoaching: false,
      swingsAllowed: 10,
    },
    challenge: {
      unlimitedAnalyses: false,
      coachRickAI: true,
      drillPlans: true,
      advancedReports: false,
      liveCoaching: true,
      swingsAllowed: 50,
    },
    diy: {
      unlimitedAnalyses: true,
      coachRickAI: true,
      drillPlans: true,
      advancedReports: true,
      liveCoaching: false,
      swingsAllowed: -1, // Unlimited
    },
    elite: {
      unlimitedAnalyses: true,
      coachRickAI: true,
      drillPlans: true,
      advancedReports: true,
      liveCoaching: true,
      swingsAllowed: -1, // Unlimited
    },
  };

  return features[tier] || features.free;
}
