import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { useReportSchedules } from "@/hooks/useReportSchedules";
import { format } from "date-fns";

interface ReportHistoryProps {
  userId: string;
}

export function ReportHistory({ userId }: ReportHistoryProps) {
  const { reports, loading } = useReportSchedules(userId);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-16 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No reports generated yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Generate your first report to start tracking progress
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card key={report.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">Progress Report</h4>
                  <Badge variant={
                    report.report_type === 'manual' ? 'secondary' :
                    report.report_type === 'scheduled' ? 'default' : 'outline'
                  }>
                    {report.report_type}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(report.period_start), 'MMM d')} - {format(new Date(report.period_end), 'MMM d, yyyy')}
                  </div>
                  
                  {report.metrics && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {report.metrics.totalSwings} swings • Avg: {report.metrics.avgOverallScore}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(report.report_url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}