import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface SwingUpload {
  id: string;
  athleteName: string;
  uploadDate: string;
  status: "pending" | "reviewed" | "action_taken";
  swingCount: number;
  priority?: "high" | "normal" | "low";
}

const mockUploads: SwingUpload[] = [
  { id: "1", athleteName: "Jake Williams", uploadDate: "8 days ago", status: "pending", swingCount: 0, priority: "high" },
  { id: "2", athleteName: "Mike Torres", uploadDate: "2 hours ago", status: "pending", swingCount: 12, priority: "normal" },
  { id: "3", athleteName: "Emily Chen", uploadDate: "1 day ago", status: "reviewed", swingCount: 15, priority: "normal" },
  { id: "4", athleteName: "Sarah Johnson", uploadDate: "5 hours ago", status: "pending", swingCount: 8, priority: "normal" },
  { id: "5", athleteName: "Marcus Brown", uploadDate: "3 days ago", status: "action_taken", swingCount: 10, priority: "low" }
];

const getStatusBadge = (status: SwingUpload["status"]) => {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "reviewed":
      return (
        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
          <Play className="h-3 w-3 mr-1" />
          Reviewed
        </Badge>
      );
    case "action_taken":
      return (
        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      );
  }
};

const getPriorityIndicator = (priority?: SwingUpload["priority"]) => {
  if (priority === "high") {
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
  return null;
};

export function SwingUploadQueue() {
  const pendingCount = mockUploads.filter(u => u.status === "pending").length;
  const reviewedCount = mockUploads.filter(u => u.status === "reviewed").length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Swing Upload Queue</h3>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending • {reviewedCount} reviewed
          </p>
        </div>
        <Button size="sm">Review All</Button>
      </div>

      <div className="space-y-3">
        {mockUploads.map((upload) => (
          <div
            key={upload.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              {getPriorityIndicator(upload.priority)}
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-sm">
                {upload.athleteName.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{upload.athleteName}</p>
                  {getStatusBadge(upload.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {upload.swingCount === 0 
                    ? `No swings uploaded in ${upload.uploadDate}`
                    : `${upload.swingCount} swings • ${upload.uploadDate}`
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {upload.status === "pending" && (
                <>
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm">Review</Button>
                </>
              )}
              {upload.status === "reviewed" && (
                <>
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm">Send Feedback</Button>
                </>
              )}
              {upload.status === "action_taken" && (
                <Button size="sm" variant="ghost">View History</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
