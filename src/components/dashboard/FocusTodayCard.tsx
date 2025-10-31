import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Dumbbell, Video, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface FocusTodayCardProps {
  lastSwingDate?: string;
  tasksCompleted: number;
  tasksTotal: number;
  hasActiveDrills: boolean;
}

export function FocusTodayCard({
  lastSwingDate,
  tasksCompleted,
  tasksTotal,
  hasActiveDrills,
}: FocusTodayCardProps) {
  const navigate = useNavigate();
  
  const daysSinceSwing = lastSwingDate
    ? Math.floor((Date.now() - new Date(lastSwingDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const needsSwing = !lastSwingDate || daysSinceSwing! > 2;
  const needsTasks = tasksCompleted < tasksTotal;

  return (
    <Card className="p-6 border-2 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Your Focus Today</h3>
          {!needsSwing && !needsTasks && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              On Track
            </Badge>
          )}
        </div>

        <div className="grid gap-3">
          {needsSwing && (
            <Button
              size="lg"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => navigate("/analyze")}
            >
              <Upload className="h-5 w-5 shrink-0" />
              <div className="text-left">
                <div className="font-semibold">Record & Upload Swing</div>
                <div className="text-xs opacity-90">
                  {daysSinceSwing !== null
                    ? `It's been ${daysSinceSwing} days`
                    : "Start building your data"}
                </div>
              </div>
            </Button>
          )}

          {hasActiveDrills && (
            <Button
              size="lg"
              variant={needsSwing ? "outline" : "default"}
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => navigate("/drills")}
            >
              <Dumbbell className="h-5 w-5 shrink-0" />
              <div className="text-left">
                <div className="font-semibold">Start Today's Drills</div>
                <div className="text-xs opacity-90">
                  {tasksCompleted} / {tasksTotal} completed this week
                </div>
              </div>
            </Button>
          )}

          <Button
            size="lg"
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => navigate("/live-coaching")}
          >
            <Video className="h-5 w-5 shrink-0" />
            <div className="text-left">
              <div className="font-semibold">Join Live Coaching</div>
              <div className="text-xs opacity-90">Weekly session with Coach Rick</div>
            </div>
          </Button>
        </div>

        {(needsSwing || needsTasks) && (
          <div className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">
            "Don't wait to feel ready. You work → confidence comes. Let's get it."
          </div>
        )}
      </div>
    </Card>
  );
}
