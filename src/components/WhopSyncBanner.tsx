import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useWhopAuth } from "@/contexts/WhopContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Banner that appears when a Whop subscription is detected but not yet linked
 * Prompts the user to link their account
 */
export function WhopSyncBanner() {
  const { user: whopUser, membership } = useWhopAuth();
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(true);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    checkIfNeedsLinking();
  }, [whopUser]);

  const checkIfNeedsLinking = async () => {
    if (!whopUser) {
      setChecking(false);
      return;
    }

    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) {
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('whop_user_id')
        .eq('id', supabaseUser.id)
        .single();

      // Show banner if Whop user exists but isn't linked to profile
      if (profile && !profile.whop_user_id && membership?.valid) {
        setShow(true);
      }
    } catch (error) {
      console.error('Error checking Whop link status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleLinkNow = async () => {
    if (!whopUser) return;

    setLinking(true);
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) return;

      // Link Whop data to profile
      await supabase
        .from('profiles')
        .update({
          whop_user_id: whopUser.id,
          whop_username: whopUser.username,
        })
        .eq('id', supabaseUser.id);

      // Sync membership if valid
      if (membership?.valid) {
        const tierMap: Record<string, string> = {
          '297-b6': 'challenge',
          'diy-annual': 'diy',
          'elite-90-day-transformation': 'elite',
        };

        const productId = membership.product_id || membership.plan_id;
        const tier = tierMap[productId] || 'free';

        // Check if membership exists
        const { data: existingMembership } = await supabase
          .from('user_memberships')
          .select('id')
          .eq('user_id', supabaseUser.id)
          .maybeSingle();

        if (existingMembership) {
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
          await supabase
            .from('user_memberships')
            .insert({
              user_id: supabaseUser.id,
              tier: tier as 'challenge' | 'diy' | 'elite' | 'free',
              status: 'active',
              expires_at: membership.valid_until || null,
              whop_membership_id: membership.id,
              whop_product_id: productId,
              swing_count: 0,
            });
        }
      }

      setShow(false);
      window.location.reload(); // Refresh to show updated subscription
    } catch (error) {
      console.error('Error linking Whop account:', error);
    } finally {
      setLinking(false);
    }
  };

  if (checking || !show) return null;

  return (
    <Alert className="bg-primary/10 border-primary/20">
      <CheckCircle className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium">Whop Subscription Detected!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Link your Whop account to unlock all features
          </p>
        </div>
        <Button 
          onClick={handleLinkNow} 
          disabled={linking}
          className="shrink-0"
        >
          {linking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Linking...
            </>
          ) : (
            <>
              Link Now
              <ExternalLink className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
