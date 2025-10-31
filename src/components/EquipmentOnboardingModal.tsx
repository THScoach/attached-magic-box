import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";

interface Equipment {
  id: string;
  label: string;
  description: string;
}

const EQUIPMENT_OPTIONS: Equipment[] = [
  { id: "stack_bat", label: "Stack Bat", description: "For overload/underload training" },
  { id: "blast_sensor", label: "Blast Sensor", description: "Bat speed & metrics tracking" },
  { id: "rapsodo", label: "Rapsodo / HitTrax / PocketRadar", description: "Ball flight tracking" },
  { id: "cage_access", label: "Batting Cage Access", description: "Indoor/outdoor facility" },
  { id: "tee_net", label: "Tee & Net", description: "Home training setup" },
];

interface EquipmentOnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function EquipmentOnboardingModal({
  open,
  onComplete,
}: EquipmentOnboardingModalProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleEquipment = (id: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const equipmentData = EQUIPMENT_OPTIONS.reduce((acc, eq) => {
        acc[eq.id] = selectedEquipment.includes(eq.id);
        return acc;
      }, {} as Record<string, boolean>);

      // Store in user_metadata for now (could be a separate table)
      const { error } = await supabase.auth.updateUser({
        data: {
          equipment_setup: equipmentData,
          equipment_onboarded: true,
        },
      });

      if (error) throw error;

      toast.success("Equipment setup saved! Let's get to work.");
      onComplete();
    } catch (error) {
      console.error("Equipment setup error:", error);
      toast.error("Failed to save equipment setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md"  onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <CoachRickAvatar size="sm" />
            <div>
              <DialogTitle className="text-2xl">Welcome to HITS™</DialogTitle>
              <DialogDescription className="text-base">
                What training tools do you have access to?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            This helps me tailor your training plan to what you can actually use.
          </p>

          <div className="space-y-3">
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <div
                key={equipment.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <Checkbox
                  id={equipment.id}
                  checked={selectedEquipment.includes(equipment.id)}
                  onCheckedChange={() => toggleEquipment(equipment.id)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={equipment.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {equipment.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {equipment.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="text-sm font-medium mb-1">Coach Rick says:</p>
            <p className="text-sm text-muted-foreground italic">
              "I'll use this to recommend the right drills and tools each week. You don't
              need everything — just show up and work with what you've got. Let's get it."
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="flex-1"
          >
            I don't have any tools yet
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedEquipment.length === 0}
            className="flex-1"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
