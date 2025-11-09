import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface EliteComparison {
  name: string;
  ratio: number;
  context: string;
}

interface TempoContextProps {
  context: "practice" | "game";
  ratio: number;
  comparisons?: EliteComparison[];
}

export function TempoContext({ context, ratio, comparisons = [] }: TempoContextProps) {
  const isPractice = context === "practice";
  
  // Default elite comparisons
  const defaultComparisons: EliteComparison[] = [
    { name: "Freeman", ratio: 0.8, context: "game" },
    { name: "Ohtani", ratio: 1.2, context: "game" },
    { name: "Judge", ratio: 1.6, context: "game" },
  ];

  const eliteComparisons = comparisons.length > 0 ? comparisons : defaultComparisons;

  const getContextMessage = () => {
    if (ratio >= 2.5) {
      return {
        title: "YOUR 3:1 TEMPO IS PERFECT FOR PRACTICE!",
        message: "Think of it like a slingshot: The longer you pull back (LOAD), the faster it snaps forward (FIRE). More power!",
        detail: "Your 3:1 tempo matches Tour Tempo (golf) - this is the foundation for building power and mechanics.",
        color: "bg-green-500"
      };
    } else if (ratio >= 1.7) {
      return {
        title: "GREAT GAME-READY TEMPO!",
        message: "You're compressing your mechanics to fit game timing. This is exactly what elite hitters do!",
        detail: "Your 2:1 tempo shows you can maintain good separation while still reacting quickly. Perfect balance of power and speed!",
        color: "bg-blue-500"
      };
    } else {
      return {
        title: "NORMAL FOR HIGH-VELOCITY!",
        message: "Your tempo is compressed because you're reacting to fast pitches. This is exactly what your brain is supposed to do!",
        detail: "Elite hitters adapt their tempo to pitch timing. Quick reactions are a sign of good pitch recognition.",
        color: "bg-orange-500"
      };
    }
  };

  const contextMessage = getContextMessage();

  return (
    <Card className="bg-[#1f2937] border-border p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">WHAT THIS MEANS</h2>
          <Badge className={`${contextMessage.color} text-white text-sm px-3 py-1`}>
            📍 CONTEXT: {isPractice ? "Practice (Tee Work)" : "Game Situation"}
          </Badge>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <div className="bg-[#374151] rounded-lg p-6 space-y-3">
            <h3 className="text-xl font-bold text-green-400">
              ✅ {contextMessage.title}
            </h3>
            
            <p className="text-lg text-white leading-relaxed">
              {contextMessage.message}
            </p>
            
            <p className="text-base text-gray-300 leading-relaxed">
              {contextMessage.detail}
            </p>
          </div>

          {/* Game Compression Explanation (for practice tempos) */}
          {ratio >= 2.5 && (
            <div className="bg-[#374151] rounded-lg p-6 space-y-3 border-l-4 border-orange-500">
              <h4 className="text-lg font-bold text-white">BUT IN GAMES...</h4>
              
              <p className="text-base text-gray-300">
                When you're reacting to a 90mph fastball (arrives in 400ms), you <span className="font-bold text-white">CAN'T</span> load for {Math.round(ratio * 100)}ms!
              </p>
              
              <p className="text-base text-gray-300">
                Your brain will <span className="font-bold text-white">COMPRESS</span> your tempo to 1-2:1.
              </p>
              
              <p className="text-xl font-bold text-green-400">
                ✅ AND THAT'S NORMAL!
              </p>
            </div>
          )}

          {/* Elite Comparisons */}
          <div className="bg-[#374151] rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-white">Elite Hitters in Games:</h4>
              <InfoTooltip content="These are tempo ratios from game situations, showing how elite hitters adapt to pitch timing" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {eliteComparisons.map((player) => (
                <div key={player.name} className="bg-[#1f2937] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{player.name}</div>
                  <div className="text-3xl font-bold text-blue-400 my-2">
                    {player.ratio.toFixed(1)}:1
                  </div>
                  <div className="text-sm text-gray-400">in games</div>
                </div>
              ))}
            </div>
            
            <p className="text-base text-center text-gray-300 font-semibold pt-2">
              Elite hitters adapt their tempo to pitch timing!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
