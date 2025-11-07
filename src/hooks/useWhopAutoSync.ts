import { useEffect, useState } from "react";
import { useWhopAuth } from "@/contexts/WhopContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Automatically syncs Whop user data to the logged-in user's profile
 * This prevents duplicate accounts and ensures seamless integration
 */
export function useWhopAutoSync() {
  const { user: whopUser, membership } = useWhopAuth();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Only run sync if we have both Whop data and a Supabase session
    const syncWhopData = async () => {
      if (!whopUser || syncing || synced) return;

      try {
        // Check if user is authenticated with Supabase
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (!supabaseUser) return;

        setSyncing(true);

        // Get current profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('whop_user_id, email')
          .eq('id', supabaseUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // If profile already has Whop ID linked, we're done
        if (profile.whop_user_id === whopUser.id) {
          console.log('Whop data already synced');
          setSynced(true);
          return;
        }

        // Check if Whop user email matches logged-in user email
        const emailsMatch = profile.email.toLowerCase() === whopUser.email.toLowerCase();

        if (!emailsMatch) {
          console.warn('Whop email does not match logged-in user email');
          // Don't auto-link if emails don't match (security measure)
          return;
        }

        // Link Whop user ID to profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            whop_user_id: whopUser.id,
            whop_username: whopUser.username,
          })
          .eq('id', supabaseUser.id);

        if (updateError) {
          console.error('Error linking Whop data:', updateError);
          toast.error('Failed to sync Whop subscription');
          return;
        }

        console.log('Successfully linked Whop user ID to profile');

        // Sync membership data if user has active subscription
        if (membership?.valid) {
          await syncMembershipTier(supabaseUser.id, membership);
        }

        setSynced(true);
        toast.success('Your Whop subscription has been synced!');
      } catch (error) {
        console.error('Error in Whop auto-sync:', error);
      } finally {
        setSyncing(false);
      }
    };

    syncWhopData();
  }, [whopUser, membership, syncing, synced]);

  return { syncing, synced };
}

/**
 * Syncs Whop membership tier to user_memberships table
 */
async function syncMembershipTier(userId: string, membership: any) {
  try {
    // Map Whop product IDs to tiers
    const tierMap: Record<string, string> = {
      '297-b6': 'challenge',
      'prod_challenge': 'challenge',
      'diy-annual': 'diy',
      'prod_diy': 'diy',
      'elite-90-day-transformation': 'elite',
      'prod_elite': 'elite',
    };

    const productId = membership.product_id || membership.plan_id;
    const tier = tierMap[productId] || 'free';

    // Check if membership record exists
    const { data: existingMembership } = await supabase
      .from('user_memberships')
      .select('id, tier, whop_user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMembership) {
      // Update existing membership
      await supabase
        .from('user_memberships')
        .update({
          tier: tier as 'challenge' | 'diy' | 'elite' | 'free',
          status: 'active',
          expires_at: membership.valid_until || null,
          whop_membership_id: membership.id,
          whop_product_id: productId,
        })
        .eq('id', existingMembership.id);
    } else {
      // Create new membership record
      await supabase
        .from('user_memberships')
        .insert({
          user_id: userId,
          tier: tier as 'challenge' | 'diy' | 'elite' | 'free',
          status: 'active',
          expires_at: membership.valid_until || null,
          whop_membership_id: membership.id,
          whop_product_id: productId,
          swing_count: 0,
        });
    }

    console.log(`Synced Whop membership tier: ${tier}`);
  } catch (error) {
    console.error('Error syncing membership tier:', error);
  }
}
