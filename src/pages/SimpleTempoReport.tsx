import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TempoHero } from "@/components/tempo/TempoHero";
import { TempoContext } from "@/components/tempo/TempoContext";
import { TempoTrainingPlan } from "@/components/tempo/TempoTrainingPlan";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SimpleTempoReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");
  
  const [loading, setLoading] = useState(true);
  const [tempoData, setTempoData] = useState<{
    loadMs: number;
    fireMs: number;
    ratio: number;
    zone: number;
    context: "practice" | "game";
  } | null>(null);

  useEffect(() => {
    // Get tempo data from URL params or use demo data
    const loadParam = searchParams.get("load");
    const fireParam = searchParams.get("fire");
    const contextParam = searchParams.get("context") as "practice" | "game" | null;
    
    if (loadParam && fireParam) {
      const loadMs = parseInt(loadParam);
      const fireMs = parseInt(fireParam);
      const ratio = loadMs / fireMs;
      
      // Determine zone based on ratio
      let zone = 1;
      if (ratio >= 2.5) zone = 1; // Pattern building
      else if (ratio >= 1.7) zone = 2; // Game speed
      else zone = 3; // Reaction speed

      setTempoData({
        loadMs,
        fireMs,
        ratio: parseFloat(ratio.toFixed(2)),
        zone,
        context: contextParam || (ratio >= 2.5 ? "practice" : "game")
      });
    } else {
      // Use demo data
      setTempoData({
        loadMs: 715,
        fireMs: 239,
        ratio: 2.99,
        zone: 1,
        context: "practice"
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tempo analysis...</p>
        </div>
      </div>
    );
  }

  if (!tempoData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No tempo data available</p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Tempo Analysis Report
          </h1>
          <p className="text-lg text-gray-400">
            Player-friendly swing tempo breakdown with training recommendations
          </p>
        </div>

        {/* Three Main Sections */}
        <div className="space-y-8">
          {/* Section 1: Your Tempo (Hero) */}
          <TempoHero
            loadMs={tempoData.loadMs}
            fireMs={tempoData.fireMs}
            ratio={tempoData.ratio}
          />

          {/* Section 2: What This Means (Context) */}
          <TempoContext
            context={tempoData.context}
            ratio={tempoData.ratio}
          />

          {/* Section 3: Coach Rick's Plan (Training Zones) */}
          <TempoTrainingPlan
            currentZone={tempoData.zone}
            currentRatio={tempoData.ratio}
          />
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate("/reboot-analysis")}
            className="bg-primary hover:bg-primary/90"
          >
            Analyze Another Swing
          </Button>
        </div>
      </div>
    </div>
  );
}
