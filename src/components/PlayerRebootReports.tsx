import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileText, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RebootReport {
  id: string;
  label: string;
  report_date: string;
  fire_duration: number;
  tempo_ratio: number;
  body_score: number;
}

interface PlayerRebootReportsProps {
  playerId: string;
}

export function PlayerRebootReports({ playerId }: PlayerRebootReportsProps) {
  const [reports, setReports] = useState<RebootReport[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, [playerId]);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reboot_reports')
        .select('*')
        .eq('player_id', playerId)
        .order('report_date', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reboot reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading reports...</p>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reboot Motion Reports</CardTitle>
          <CardDescription>No Reboot Motion reports uploaded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/reboot-analysis')} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload Reboot PDF
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {(reports.reduce((sum, r) => sum + r.body_score, 0) / reports.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Body Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {reports[0]?.tempo_ratio.toFixed(1)}:1
            </div>
            <p className="text-xs text-muted-foreground">Latest Tempo</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Reboot Reports</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/reboot-analysis')}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </Button>
        </div>
        {reports.map((report) => (
          <Card key={report.id} className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/reboot-analysis?reportId=${report.id}`)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{report.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        Reboot
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(report.report_date), 'MMM dd, yyyy')}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Tempo: </span>
                        <span className="font-semibold">{report.tempo_ratio.toFixed(1)}:1</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Fire: </span>
                        <span className="font-semibold">{report.fire_duration}ms</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Body: </span>
                        <span className="font-semibold">{report.body_score}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {report.body_score}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
