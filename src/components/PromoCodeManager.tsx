import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ticket, Copy, XCircle, Plus } from "lucide-react";
import { usePromoCodes } from "@/hooks/usePromoCodes";
import { toast } from "sonner";
import { format } from "date-fns";

interface PromoCodeManagerProps {
  availableSeats: number;
}

export function PromoCodeManager({ availableSeats }: PromoCodeManagerProps) {
  const { promoCodes, loading, generateCode, deactivateCode } = usePromoCodes();
  const [seatsToAllocate, setSeatsToAllocate] = useState(1);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (seatsToAllocate > availableSeats) {
      toast.error(`You only have ${availableSeats} available seats`);
      return;
    }

    setGenerating(true);
    await generateCode(seatsToAllocate);
    setGenerating(false);
    setSeatsToAllocate(1);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const activeCodesCount = promoCodes.filter(
    (pc) => pc.is_active && new Date(pc.expires_at) > new Date()
  ).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Promo Codes
        </CardTitle>
        <CardDescription>
          Generate codes to give athletes access to your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate New Code */}
        <div className="space-y-3">
          <Label htmlFor="seats">Seats to allocate per code</Label>
          <div className="flex gap-2">
            <Input
              id="seats"
              type="number"
              min={1}
              max={availableSeats}
              value={seatsToAllocate}
              onChange={(e) => setSeatsToAllocate(Number(e.target.value))}
              className="w-24"
            />
            <Button
              onClick={handleGenerate}
              disabled={generating || availableSeats <= 0}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {generating ? "Generating..." : "Generate Code"}
            </Button>
          </div>
          {availableSeats <= 0 && (
            <p className="text-sm text-destructive">
              No available seats. Purchase more to generate codes.
            </p>
          )}
        </div>

        {/* Active Codes List */}
        {activeCodesCount === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active promo codes</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Active Codes</h3>
            {promoCodes
              .filter((pc) => pc.is_active && new Date(pc.expires_at) > new Date())
              .map((promoCode) => (
                <div
                  key={promoCode.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-bold bg-muted px-3 py-1 rounded">
                        {promoCode.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(promoCode.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deactivateCode(promoCode.id)}
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div>
                      Seats: {promoCode.seats_used} / {promoCode.seats_allocated}
                    </div>
                    <div>
                      Expires: {format(new Date(promoCode.expires_at), "MMM d, yyyy")}
                    </div>
                  </div>

                  {promoCode.seats_used >= promoCode.seats_allocated && (
                    <Badge variant="secondary">Full</Badge>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Expired/Inactive Codes */}
        {promoCodes.some(
          (pc) => !pc.is_active || new Date(pc.expires_at) <= new Date()
        ) && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Inactive/Expired Codes
            </h3>
            {promoCodes
              .filter((pc) => !pc.is_active || new Date(pc.expires_at) <= new Date())
              .map((promoCode) => (
                <div
                  key={promoCode.id}
                  className="p-3 border rounded-lg opacity-50 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <code className="font-mono">{promoCode.code}</code>
                    <Badge variant="outline">
                      {!promoCode.is_active ? "Deactivated" : "Expired"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {promoCode.seats_used} / {promoCode.seats_allocated} used
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
