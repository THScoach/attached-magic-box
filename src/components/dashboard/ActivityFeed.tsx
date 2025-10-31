import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Upload, MessageSquare, TrendingUp, Target } from "lucide-react";

interface Activity {
  id: string;
  type: "swing" | "drill" | "feedback" | "achievement";
  title: string;
  description: string;
  timestamp: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "feedback",
    title: "Coach Feedback",
    description: "Coach Rick reviewed your latest swing - Tempo improved!",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    type: "drill",
    title: "Drill Completed",
    description: "Anchor 6.2 - Hip Hinge Series",
    timestamp: "5 hours ago"
  },
  {
    id: "3",
    type: "swing",
    title: "Swing Uploaded",
    description: "BP Session - 12 swings analyzed",
    timestamp: "1 day ago"
  },
  {
    id: "4",
    type: "achievement",
    title: "Milestone Reached",
    description: "7-day training streak!",
    timestamp: "2 days ago"
  }
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "swing":
      return <Upload className="h-4 w-4 text-primary" />;
    case "drill":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "feedback":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "achievement":
      return <TrendingUp className="h-4 w-4 text-orange-500" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

export function ActivityFeed() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
