import { useWhopMembership } from "./useWhopMembership";
import { MembershipTier } from "./useUserMembership";
import { TierAccess } from "./useTierAccess";

const TIER_ACCESS_MAP: Record<MembershipTier, Omit<TierAccess, 'swingCount' | 'swingsRemaining' | 'isExpired' | 'daysRemaining' | 'canViewCoachDashboard' | 'tier' | 'loading' | 'isTeamMember'>> = {
  free: {
    canUseScheduler: false,
    canViewGrind: false,
    canJoinLive: false,
    canViewReplay: true,
    canAnalyzeSwing: true,
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
    canAnalyzeSwing: true,
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
    canAnalyzeSwing: true,
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
    canAnalyzeSwing: true,
    canAccessCoachRick: true,
    canBook1on1: true,
    schedulerLevel: "full_plus",
    grindLevel: "full",
    liveAccess: "full_plus_feedback",
  },
};

export function useWhopTierAccess() {
  const { membership, loading } = useWhopMembership();

  const tier = membership?.tier || "free";
  const swingCount = membership?.swingCount || 0;
  const status = membership?.status || 'active';
  const expiresAt = membership?.expiresAt;
  
  const access = TIER_ACCESS_MAP[tier];

  // Calculate expiration for challenge tier
  const isExpired = tier === 'challenge' && expiresAt
    ? new Date(expiresAt) < new Date()
    : false;

  const daysRemaining = tier === 'challenge' && expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Calculate swings remaining
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

  const canAccessCoachRick = ['diy', 'elite'].includes(tier) && status === 'active';
  const canBook1on1 = tier === 'elite' && status === 'active';

  // In Whop, no coach role concept - everyone is a member
  const canViewCoachDashboard = false;
  const isTeamMember = false;

  return {
    ...access,
    canAnalyzeSwing,
    canAccessCoachRick,
    canBook1on1,
    canViewCoachDashboard,
    tier,
    swingCount,
    swingsRemaining,
    isExpired,
    daysRemaining,
    loading,
    isTeamMember,
  };
}
