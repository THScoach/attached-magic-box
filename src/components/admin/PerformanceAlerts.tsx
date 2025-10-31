import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle2, TrendingDown, Calendar } from "lucide-react";

interface Alert {
  id: string;
  type: "critical" | "warning" | "success";
  athleteName: string;
  message: string;
  timestamp: string;
  action?: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    athleteName: "Jake Williams",
    message: "No swings uploaded in 8+ days",
    timestamp: "Today",
    action: "Send Reminder"
  },
  {
    id: "2",
    type: "warning",
    athleteName: "Sarah Johnson",
    message: "Tempo score decreased 3 consecutive sessions",
    timestamp: "Yesterday",
    action: "Review Analysis"
  },
  {
    id: "3",
    type: "warning",
    athleteName: "Mike Torres",
    message: "Missed 2 scheduled training days",
    timestamp: "2 days ago",
    action: "Check In"
  },
  {
    id: "4",
    type: "success",
    athleteName: "Emily Chen",
    message: "Completed 100% of assigned drills - 3 weeks straight!",
    timestamp: "Today",
    action: "Send Praise"
  },
  {
    id: "5",
    type: "success",
    athleteName: "Marcus Brown",
    message: "Exit velocity improved 5 mph in 2 weeks",
    timestamp: "Yesterday",
    action: "Review Progress"
  }
];

const getAlertIcon = (type: Alert["type"]) => {
  switch (type) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
};

const getAlertBadge = (type: Alert["type"]) => {
  switch (type) {
    case "critical":
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Critical</Badge>;
    case "warning":
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Warning</Badge>;
    case "success":
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Success</Badge>;
  }
};

export function PerformanceAlerts() {
  const criticalCount = mockAlerts.filter(a => a.type === "critical").length;
  const warningCount = mockAlerts.filter(a => a.type === "warning").length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Performance Alerts</h3>
          <p className="text-sm text-muted-foreground">
            {criticalCount} critical • {warningCount} warnings
          </p>
        </div>
        <Button size="sm" variant="outline">View All</Button>
      </div>

      <div className="space-y-3">
        {mockAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
              alert.type === "critical" 
                ? "border-red-500/30 bg-red-500/5" 
                : alert.type === "warning"
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-green-500/30 bg-green-500/5"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{alert.athleteName}</p>
                {getAlertBadge(alert.type)}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {alert.timestamp}
                </p>
                {alert.action && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    {alert.action}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
