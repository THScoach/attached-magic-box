import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TempoHeroProps {
  loadMs: number;
  fireMs: number;
  ratio: number;
  zone: number;
}

export function TempoHero({ loadMs, fireMs, ratio, zone }: TempoHeroProps) {
  // Calculate bar widths based on load and fire times
  const totalMs = loadMs + fireMs;
  const loadWidth = (loadMs / totalMs) * 100;
  const fireWidth = (fireMs / totalMs) * 100;

  // Determine tempo category
  const getTempoCategory = () => {
    if (ratio >= 2.5) return { label: "WHIPPER", description: "slow load, fast fire!" };
    if (ratio >= 1.8) return { label: "BALANCED", description: "smooth and powerful!" };
    return { label: "QUICK", description: "fast reaction time!" };
  };

  const category = getTempoCategory();

  return (
    <Card className="bg-[#1f2937] border-border p-8">
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">YOUR SWING TEMPO</h2>
        </div>

        {/* Big Numbers */}
        <div className="flex justify-center items-center gap-8">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">LOAD</div>
            <div className="text-6xl font-bold text-[#8b5cf6]">{loadMs}ms</div>
            <div className="text-sm text-gray-400 mt-2">← Pull back the slingshot →</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">FIRE</div>
            <div className="text-6xl font-bold text-[#ef4444]">{fireMs}ms</div>
            <div className="text-sm text-gray-400 mt-2">← Snap! →</div>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="space-y-2">
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div 
              className="bg-[#8b5cf6] flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${loadWidth}%` }}
            >
              LOAD
            </div>
            <div 
              className="bg-[#ef4444] flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${fireWidth}%` }}
            >
              FIRE
            </div>
          </div>
        </div>

        {/* Tempo Ratio */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-bold text-white">TEMPO: {ratio.toFixed(2)}:1</span>
            <Badge className="bg-green-500 text-white text-lg px-3 py-1">
              ✅ ELITE!
            </Badge>
          </div>
          <p className="text-lg text-gray-300">
            💡 You load for {ratio.toFixed(0)}× longer than you fire
          </p>
          <p className="text-xl font-semibold text-white">
            You're a "{category.label}" - {category.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
