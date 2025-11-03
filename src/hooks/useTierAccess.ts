import { useUserMembership, MembershipTier } from "./useUserMembership";
import { useUserRole } from "./useUserRole";

export interface TierAccess {
  canUseScheduler: boolean;
  canViewGrind: boolean;
  canJoinLive: boolean;
  canViewReplay: boolean;
  canViewCoachDashboard: boolean;
  canAnalyzeSwing: boolean;
  canAccessCoachRick: boolean;
  canBook1on1: boolean;
  swingCount: number;
  swingsRemaining: number;
  isExpired: boolean;
  daysRemaining: number | null;
  schedulerLevel: "none" | "weekly" | "full" | "full_plus";
  grindLevel: "none" | "basic" | "full";
  liveAccess: "none" | "replay_only" | "full" | "full_plus_feedback";
  tier: MembershipTier;
  loading: boolean;
  isTeamMember: boolean;
}

const TIER_ACCESS_MAP: Record<MembershipTier, Omit<TierAccess, 'swingCount' | 'swingsRemaining' | 'isExpired' | 'daysRemaining' | 'canViewCoachDashboard' | 'tier' | 'loading' | 'isTeamMember'>> = {
  free: {
    canUseScheduler: false,
    canViewGrind: false,
    canJoinLive: false,
    canViewReplay: true,
    canAnalyzeSwing: true, // Up to 10 swings
    canAccessCoachRick: false,
    canBook1on1: false,
    schedulerLevel: "none",
    grindLevel: "none",
    liveAccess: "replay_only",
  },
  challenge: {
    canUseScheduler: true,
    canViewGrind: true,
    canJoinLive: false,
    canViewReplay: true,
    canAnalyzeSwing: true, // Unlimited for 7 days
    canAccessCoachRick: true,
    canBook1on1: false,
    schedulerLevel: "weekly",
    grindLevel: "basic",
    liveAccess: "replay_only",
  },
  diy: {
    canUseScheduler: true,
    canViewGrind: true,
    canJoinLive: true,
    canViewReplay: true,
    canAnalyzeSwing: true, // Unlimited
    canAccessCoachRick: true,
    canBook1on1: false,
    schedulerLevel: "full",
    grindLevel: "full",
    liveAccess: "full",
  },
  elite: {
    canUseScheduler: true,
    canViewGrind: true,
    canJoinLive: true,
    canViewReplay: true,
    canAnalyzeSwing: true, // Unlimited
    canAccessCoachRick: true,
    canBook1on1: true,
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
  const swingCount = membership?.swingCount || 0;
  const status = membership?.status || 'active';
  const expiresAt = membership?.expiresAt;
  
  // Teams members get elite-level access
  const isTeamMember = role === "athlete" && tier !== "free";
  const effectiveTier: MembershipTier = isTeamMember ? "elite" : tier;
  
  const access = TIER_ACCESS_MAP[effectiveTier];

  // Calculate expiration for challenge tier
  const isExpired = tier === 'challenge' && expiresAt
    ? new Date(expiresAt) < new Date()
    : false;

  const daysRemaining = tier === 'challenge' && expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Calculate swings remaining based on tier
  const swingsRemaining = (() => {
    if (tier === 'free') {
      return Math.max(0, 10 - swingCount);
    }
    if (tier === 'challenge') {
      return isExpired ? 0 : Infinity;
    }
    if (['diy', 'elite'].includes(tier)) {
      return status === 'active' ? Infinity : 0;
    }
    return 0;
  })();

  // Override canAnalyzeSwing based on actual limits
  const canAnalyzeSwing = (() => {
    if (tier === 'free') {
      return swingCount < 10;
    }
    if (tier === 'challenge') {
      return !isExpired && status === 'active';
    }
    if (['diy', 'elite'].includes(tier)) {
      return status === 'active';
    }
    return false;
  })();

  // Override canAccessCoachRick - only DIY and Elite
  const canAccessCoachRick = ['diy', 'elite'].includes(tier) && status === 'active';

  // Override canBook1on1 - only Elite
  const canBook1on1 = tier === 'elite' && status === 'active';

  // Coaches get full access to coach dashboard
  const canViewCoachDashboard = role === "coach" || role === "admin";

  return {
    ...access,
    canAnalyzeSwing,
    canAccessCoachRick,
    canBook1on1,
    canViewCoachDashboard,
    tier: effectiveTier,
    swingCount,
    swingsRemaining,
    isExpired,
    daysRemaining,
    loading,
    isTeamMember,
  };
}
