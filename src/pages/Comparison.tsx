import { BottomNav } from "@/components/BottomNav";
import { SwingComparison } from "@/components/SwingComparison";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Comparison() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-engine/5 to-whip/10 px-6 pt-8 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">Swing Comparison</h1>
        <p className="text-muted-foreground">
          Analyze differences between two swings with synchronized playback
        </p>
      </div>

      <div className="px-6 py-6">
        <SwingComparison />
      </div>

      <BottomNav />
    </div>
  );
}
