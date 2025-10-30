import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Ticket } from "lucide-react";
import { usePromoCodes } from "@/hooks/usePromoCodes";
import { useNavigate } from "react-router-dom";

export function RedeemPromoCode() {
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const { redeemCode } = usePromoCodes();
  const navigate = useNavigate();

  const handleRedeem = async () => {
    if (!code.trim()) return;

    setRedeeming(true);
    const success = await redeemCode(code);
    setRedeeming(false);

    if (success) {
      setCode("");
      // Redirect to dashboard after successful redemption
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Redeem Team Code
        </CardTitle>
        <CardDescription>
          Enter your coach's promo code to join their team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="promo-code">Promo Code</Label>
          <Input
            id="promo-code"
            placeholder="HITS-XXXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>

        <Button
          onClick={handleRedeem}
          disabled={!code.trim() || redeeming}
          className="w-full"
        >
          {redeeming ? "Redeeming..." : "Redeem Code"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your coach will provide you with a promo code to access team features
        </p>
      </CardContent>
    </Card>
  );
}
