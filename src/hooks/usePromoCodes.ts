import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  coach_id: string;
  seats_allocated: number;
  seats_used: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export function usePromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Error loading promo codes:", error);
      toast.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (seatsAllocated: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Generate unique code
      const code = `HITS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Expires in 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase
        .from("promo_codes")
        .insert({
          code,
          coach_id: user.id,
          seats_allocated: seatsAllocated,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast.success("Promo code generated successfully!");
      await loadPromoCodes();
      return true;
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate promo code");
      return false;
    }
  };

  const deactivateCode = async (codeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active: false })
        .eq("id", codeId);

      if (error) throw error;

      toast.success("Promo code deactivated");
      await loadPromoCodes();
      return true;
    } catch (error) {
      console.error("Error deactivating code:", error);
      toast.error("Failed to deactivate promo code");
      return false;
    }
  };

  const redeemCode = async (code: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to redeem a code");
        return false;
      }

      // Check if code exists and is valid
      const { data: promoCode, error: fetchError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (fetchError || !promoCode) {
        toast.error("Invalid or expired promo code");
        return false;
      }

      // Check if seats are available
      if (promoCode.seats_used >= promoCode.seats_allocated) {
        toast.error("This promo code has no seats remaining");
        return false;
      }

      // Check if already redeemed
      const { data: existingRedemption } = await supabase
        .from("promo_redemptions")
        .select("*")
        .eq("promo_code_id", promoCode.id)
        .eq("athlete_id", user.id)
        .maybeSingle();

      if (existingRedemption) {
        toast.error("You have already redeemed this code");
        return false;
      }

      // Create redemption record
      const { error: redemptionError } = await supabase
        .from("promo_redemptions")
        .insert({
          promo_code_id: promoCode.id,
          athlete_id: user.id,
        });

      if (redemptionError) throw redemptionError;

      // Increment seats_used
      const { error: updateError } = await supabase
        .from("promo_codes")
        .update({ seats_used: promoCode.seats_used + 1 })
        .eq("id", promoCode.id);

      if (updateError) throw updateError;

      // Add athlete to team roster
      const { error: rosterError } = await supabase
        .from("team_rosters")
        .insert({
          coach_id: promoCode.coach_id,
          athlete_id: user.id,
          is_active: true,
        });

      if (rosterError) throw rosterError;

      toast.success("Promo code redeemed! You're now part of the team.");
      return true;
    } catch (error) {
      console.error("Error redeeming code:", error);
      toast.error("Failed to redeem promo code");
      return false;
    }
  };

  return {
    promoCodes,
    loading,
    generateCode,
    deactivateCode,
    redeemCode,
    reload: loadPromoCodes,
  };
}
