import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Drill } from "@/types/swing";
import { Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrillCardProps {
  drill: Drill;
  onViewDrill?: (drillId: string) => void;
}

const pillarColors = {
  ANCHOR: "text-anchor",
  ENGINE: "text-engine",
  WHIP: "text-whip"
};

export function DrillCard({ drill, onViewDrill }: DrillCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <div className="text-center p-4">
          <div className={cn("text-4xl font-bold mb-2", pillarColors[drill.pillar])}>
            {drill.pillar}
          </div>
          <p className="text-sm text-muted-foreground">Drill Video</p>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold mb-2">{drill.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {drill.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: drill.difficulty }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{drill.duration} min</span>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => onViewDrill?.(drill.id)}
        >
          View Drill →
        </Button>
      </div>
    </Card>
  );
}
