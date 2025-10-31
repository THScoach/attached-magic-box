import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, MessageSquare, TrendingDown, Calendar } from "lucide-react";

interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Weekly Check-In Reminder",
    description: "Send automated message to athletes who haven't uploaded swings in 7 days",
    enabled: true,
    lastTriggered: "2 days ago",
    triggerCount: 12
  },
  {
    id: "2",
    name: "Performance Drop Alert",
    description: "Notify coach when athlete's tempo score drops 3+ consecutive sessions",
    enabled: true,
    lastTriggered: "Yesterday",
    triggerCount: 3
  },
  {
    id: "3",
    name: "Milestone Celebration",
    description: "Send congratulations message when athlete reaches training milestones",
    enabled: true,
    lastTriggered: "Today",
    triggerCount: 8
  },
  {
    id: "4",
    name: "Program Completion Follow-Up",
    description: "Send feedback request 24 hours after program completion",
    enabled: false,
    triggerCount: 0
  },
  {
    id: "5",
    name: "Inactive Athlete Re-engagement",
    description: "Send motivational message to athletes inactive for 14+ days",
    enabled: true,
    lastTriggered: "5 days ago",
    triggerCount: 6
  }
];

const getAutomationIcon = (name: string) => {
  if (name.includes("Reminder") || name.includes("Check-In")) {
    return <Clock className="h-4 w-4 text-blue-500" />;
  }
  if (name.includes("Alert") || name.includes("Drop")) {
    return <TrendingDown className="h-4 w-4 text-yellow-500" />;
  }
  if (name.includes("Celebration") || name.includes("Milestone")) {
    return <Zap className="h-4 w-4 text-green-500" />;
  }
  return <MessageSquare className="h-4 w-4 text-primary" />;
};

export function AutomationsPanel() {
  const activeCount = mockAutomations.filter(a => a.enabled).length;
  const totalTriggers = mockAutomations.reduce((sum, a) => sum + a.triggerCount, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Automations</h3>
          <p className="text-sm text-muted-foreground">
            {activeCount} active • {totalTriggers} total triggers
          </p>
        </div>
        <Button size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="space-y-4">
        {mockAutomations.map((automation) => (
          <div
            key={automation.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {getAutomationIcon(automation.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{automation.name}</p>
                {automation.enabled && (
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{automation.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {automation.lastTriggered && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last: {automation.lastTriggered}
                  </span>
                )}
                <span>Triggered: {automation.triggerCount}x</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={automation.enabled} />
              <Button size="sm" variant="ghost">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
