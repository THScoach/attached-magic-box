import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Play } from "lucide-react";

interface WorkItem {
  id: string;
  title: string;
  type: "drill" | "swings" | "video";
  completed: boolean;
  progress?: number;
}

const mockWork: WorkItem[] = [
  { id: "1", title: "Hip Hinge Series", type: "drill", completed: true },
  { id: "2", title: "10 Tee Swings", type: "swings", completed: true },
  { id: "3", title: "Tempo Drill - Slow Mo", type: "drill", completed: false, progress: 60 },
  { id: "4", title: "Record Live BP", type: "video", completed: false, progress: 0 },
  { id: "5", title: "Anchor Load Pattern", type: "drill", completed: false, progress: 0 }
];

export function AssignedWork() {
  const completedCount = mockWork.filter(w => w.completed).length;
  const totalCount = mockWork.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Today's Program</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <div className="text-2xl font-bold text-primary">{Math.round(completionPercentage)}%</div>
      </div>

      <Progress value={completionPercentage} className="mb-6" />

      <div className="space-y-3">
        {mockWork.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
              {!item.completed && item.progress! > 0 && (
                <Progress value={item.progress} className="mt-2 h-1" />
              )}
            </div>
            {!item.completed && (
              <Button size="sm" variant="ghost">
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
