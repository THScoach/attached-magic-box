import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportScheduleManager } from "@/components/ReportScheduleManager";
import { Mail, Calendar, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AthleteReportSchedulerProps {
  athletes: Array<{
    athlete_id: string;
    athlete_email: string;
  }>;
}

export function AthleteReportScheduler({ athletes }: AthleteReportSchedulerProps) {
  if (athletes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Add athletes to start scheduling reports</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          Schedule automated progress reports to be generated and emailed to your athletes weekly or monthly
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {athletes.map((athlete) => (
          <Card key={athlete.athlete_id}>
            <CardHeader>
              <CardTitle className="text-lg">{athlete.athlete_email}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                Automated report scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportScheduleManager
                userId={athlete.athlete_id}
                playerId={athlete.athlete_id}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Automated Reports Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">1</div>
            <p><strong>Set Schedule:</strong> Choose weekly or monthly report generation for each athlete</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">2</div>
            <p><strong>Enable Email:</strong> Toggle email delivery to automatically send reports to athletes</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">3</div>
            <p><strong>Auto-Generate:</strong> Reports are created automatically and include swing metrics, trends, and progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
