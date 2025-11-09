import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Zap, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrainingZone {
  id: number;
  name: string;
  targetRatio: number;
  loadMs: number;
  fireMs: number;
  drills: string[];
  timeAllocation: number;
}

interface TempoTrainingPlanProps {
  currentZone: number;
  currentRatio: number;
  zones?: TrainingZone[];
}

const defaultZones: TrainingZone[] = [
  {
    id: 1,
    name: "Pattern Building",
    targetRatio: 3.0,
    loadMs: 750,
    fireMs: 250,
    drills: ["Tee work", "Soft toss"],
    timeAllocation: 20,
  },
  {
    id: 2,
    name: "Game Speed",
    targetRatio: 2.0,
    loadMs: 467,
    fireMs: 233,
    drills: ["Front toss", "Live BP 75-85mph"],
    timeAllocation: 40,
  },
  {
    id: 3,
    name: "Reaction Speed",
    targetRatio: 1.5,
    loadMs: 250,
    fireMs: 167,
    drills: ["Live BP 85-95mph", "Pitch machine"],
    timeAllocation: 40,
  },
];

export function TempoTrainingPlan({ currentZone, currentRatio, zones = defaultZones }: TempoTrainingPlanProps) {
  const navigate = useNavigate();

  const getZoneColor = (zoneId: number) => {
    switch (zoneId) {
      case 1:
        return { bg: "bg-green-500", text: "text-green-400", border: "border-green-500" };
      case 2:
        return { bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500" };
      case 3:
        return { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500" };
      default:
        return { bg: "bg-gray-500", text: "text-gray-400", border: "border-gray-500" };
    }
  };

  const getZoneIcon = (zoneId: number) => {
    switch (zoneId) {
      case 1:
        return <Target className="w-6 h-6" />;
      case 2:
        return <Zap className="w-6 h-6" />;
      case 3:
        return <Flame className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getZoneStatus = (zoneId: number) => {
    if (zoneId === currentZone) {
      return { badge: "✅ YOU'RE HERE!", message: "Keep building this in practice" };
    } else if (zoneId === currentZone + 1) {
      return { badge: "🎯 WORK ON THIS!", message: "Game-realistic tempo" };
    } else if (zoneId > currentZone + 1) {
      return { badge: "🔥 CHALLENGE!", message: "High-velocity training" };
    } else {
      return { badge: "✅ MASTERED", message: "Keep practicing occasionally" };
    }
  };

  return (
    <Card className="bg-[#1f2937] border-border p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">COACH RICK'S PLAN</h2>
          <p className="text-lg text-gray-400">🎯 YOUR TRAINING ZONES:</p>
        </div>

        {/* Training Zones */}
        <div className="space-y-6">
          {zones.map((zone) => {
            const colors = getZoneColor(zone.id);
            const status = getZoneStatus(zone.id);
            const isCurrentZone = zone.id === currentZone;
            const totalMs = zone.loadMs + zone.fireMs;
            const loadWidth = (zone.loadMs / totalMs) * 100;
            const fireWidth = (zone.fireMs / totalMs) * 100;

            return (
              <div
                key={zone.id}
                className={`bg-[#374151] rounded-lg p-6 space-y-4 transition-all ${
                  isCurrentZone ? `border-2 ${colors.border} shadow-lg` : "border border-gray-600"
                }`}
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${colors.bg} p-2 rounded-lg text-white`}>
                      {getZoneIcon(zone.id)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        ZONE {zone.id}: {zone.name.toUpperCase()} ({zone.targetRatio}:1)
                      </h3>
                      <Badge className={`${colors.bg} text-white text-sm mt-1`}>
                        {status.badge}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{zone.timeAllocation}%</div>
                    <div className="text-sm text-gray-400">training time</div>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="flex h-8 rounded-lg overflow-hidden">
                  <div
                    className="bg-[#8b5cf6] flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${loadWidth}%` }}
                  >
                    {zone.loadMs}ms
                  </div>
                  <div
                    className="bg-[#ef4444] flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${fireWidth}%` }}
                  >
                    {zone.fireMs}ms
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">📍 Use:</p>
                    <div className="space-y-1">
                      {zone.drills.map((drill) => (
                        <div key={drill} className="text-base text-white">
                          • {drill}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-300">{status.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Message */}
        <div className="bg-[#374151] rounded-lg p-6 text-center space-y-4">
          <p className="text-lg text-white font-semibold">
            💡 THE PLAN:
          </p>
          <p className="text-xl text-gray-300">
            Build <span className="text-green-400 font-bold">3:1</span> in practice → 
            Train <span className="text-blue-400 font-bold">2:1</span> for games → 
            Let your brain adapt to <span className="text-orange-400 font-bold">1-2:1</span> in games!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => navigate("/drills")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              View Recommended Drills
            </Button>
            <Button
              onClick={() => navigate("/progress")}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Track Progress
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
