import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DrillCard } from "@/components/DrillCard";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { mockDrills } from "@/lib/mockAnalysis";
import { toast } from "sonner";

export default function Drills() {
  const [filter, setFilter] = useState<"ALL" | "ANCHOR" | "ENGINE" | "WHIP">("ALL");

  const filteredDrills = filter === "ALL" 
    ? mockDrills 
    : mockDrills.filter(drill => drill.pillar === filter);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Drill Library</h1>
        <p className="text-muted-foreground">
          Targeted exercises to improve your swing
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Filter Buttons */}
        <Card className="p-3">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              size="sm"
              variant={filter === "ALL" ? "default" : "outline"}
              onClick={() => setFilter("ALL")}
            >
              All Drills
            </Button>
            <Button
              size="sm"
              variant={filter === "ANCHOR" ? "default" : "outline"}
              onClick={() => setFilter("ANCHOR")}
              className={filter === "ANCHOR" ? "bg-anchor hover:bg-anchor/90" : ""}
            >
              ANCHOR
            </Button>
            <Button
              size="sm"
              variant={filter === "ENGINE" ? "default" : "outline"}
              onClick={() => setFilter("ENGINE")}
              className={filter === "ENGINE" ? "bg-engine hover:bg-engine/90" : ""}
            >
              ENGINE
            </Button>
            <Button
              size="sm"
              variant={filter === "WHIP" ? "default" : "outline"}
              onClick={() => setFilter("WHIP")}
              className={filter === "WHIP" ? "bg-whip hover:bg-whip/90" : ""}
            >
              WHIP
            </Button>
          </div>
        </Card>

        {/* Drills Grid */}
        <div className="grid gap-4">
          {filteredDrills.map(drill => (
            <DrillCard 
              key={drill.id} 
              drill={drill}
              onViewDrill={(id) => {
                toast.info("Drill details coming soon!");
              }}
            />
          ))}
        </div>

        {filteredDrills.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No drills found for this category
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
