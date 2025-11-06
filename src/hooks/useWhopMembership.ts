import { useWhopAuth } from "@/contexts/WhopContext";
import { MembershipTier } from "./useUserMembership";

export function useWhopMembership() {
  const { user, membership, isLoading } = useWhopAuth();

  // Map Whop product IDs to HITS tiers
  const getTierFromWhop = (whopMembership: any): MembershipTier => {
    if (!whopMembership || !whopMembership.valid) {
      return "free";
    }

    const productId = whopMembership.product_id || whopMembership.plan_id;
    
    // Map based on product IDs from .env
    const tierMap: Record<string, MembershipTier> = {
      '297-b6': 'challenge',
      'prod_challenge': 'challenge',
      'diy-annual': 'diy',
      'prod_diy': 'diy',
      'elite-90-day-transformation': 'elite',
      'prod_elite': 'elite',
    };

    return tierMap[productId] || 'free';
  };

  const tier = getTierFromWhop(membership);
  const expiresAt = membership?.valid_until || null;
  const swingCount = 0; // Whop doesn't track swing count, handle separately if needed

  return {
    membership: {
      tier,
      status: membership?.valid ? 'active' : 'cancelled',
      expiresAt,
      swingCount,
    },
    loading: isLoading,
    refetch: () => {}, // Whop handles refresh automatically
  };
}
