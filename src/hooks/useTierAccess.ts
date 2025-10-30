import { useUserMembership, MembershipTier } from "./useUserMembership";
import { useUserRole } from "./useUserRole";

interface TierAccess {
  canUseScheduler: boolean;
  canViewGrind: boolean;
  canJoinLive: boolean;
  canViewReplay: boolean;
  canViewCoachDashboard: boolean;
  schedulerLevel: "none" | "weekly" | "full" | "full_plus";
  grindLevel: "none" | "basic" | "full";
  liveAccess: "none" | "replay_only" | "full" | "full_plus_feedback";
}

const TIER_ACCESS_MAP: Record<MembershipTier, TierAccess> = {
  free: {
    canUseScheduler: false,
    canViewGrind: false,
    canJoinLive: false,
    canViewReplay: true,
    canViewCoachDashboard: false,
    schedulerLevel: "none",
    grindLevel: "none",
    liveAccess: "replay_only",
  },
  challenge: {
    canUseScheduler: true,
    canViewGrind: true,
    canJoinLive: false,
    canViewReplay: true,
    canViewCoachDashboard: false,
    schedulerLevel: "weekly",
    grindLevel: "basic",
    liveAccess: "replay_only",
  },
  diy: {
    canUseScheduler: true,
    canViewGrind: true,
    canJoinLive: true,
    canViewReplay: true,
    canViewCoachDashboard: false,
    schedulerLevel: "full",
    grindLevel: "full",
    liveAccess: "full",
  },
  elite: {
    canUseScheduler: true,
    canViewGrind: true,
    canJoinLive: true,
    canViewReplay: true,
    canViewCoachDashboard: true,
    schedulerLevel: "full_plus",
    grindLevel: "full",
    liveAccess: "full_plus_feedback",
  },
};

export function useTierAccess() {
  const { membership, loading: membershipLoading } = useUserMembership();
  const { role, loading: roleLoading } = useUserRole();

  const loading = membershipLoading || roleLoading;
  const tier = membership?.tier || "free";
  
  // Teams members get elite-level access
  const isTeamMember = role === "athlete" && tier !== "free";
  const effectiveTier: MembershipTier = isTeamMember ? "elite" : tier;
  
  const access = TIER_ACCESS_MAP[effectiveTier];

  // Coaches get full access to coach dashboard
  const canViewCoachDashboard = role === "coach" || access.canViewCoachDashboard;

  return {
    ...access,
    canViewCoachDashboard,
    tier: effectiveTier,
    loading,
    isTeamMember,
  };
}
