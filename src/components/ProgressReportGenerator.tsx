import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlayerSelector } from "@/components/PlayerSelector";
import { Calendar as CalendarIcon, FileText, Loader2, Download, TrendingUp } from "lucide-react";
import { format, subDays, subWeeks, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type ReportPeriod = "7days" | "30days" | "90days" | "custom";
type ReportFormat = "pdf" | "email";

export function ProgressReportGenerator() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("30days");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("pdf");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: previousReports } = useQuery({
    queryKey: ['generated-reports', selectedPlayer],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('generated_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (selectedPlayer) {
        query = query.eq('player_id', selectedPlayer);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPlayer,
  });

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    if (period === "custom" && customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      switch (period) {
        case "7days":
          startDate = subDays(now, 7);
          break;
        case "30days":
          startDate = subDays(now, 30);
          break;
        case "90days":
          startDate = subDays(now, 90);
          break;
        default:
          startDate = subDays(now, 30);
      }
    }

    return { startDate, endDate };
  };

  const handleGenerate = async () => {
    if (!selectedPlayer) {
      toast.error("Please select a player");
      return;
    }

    if (period === "custom" && (!customStartDate || !customEndDate)) {
      toast.error("Please select custom date range");
      return;
    }

    setIsGenerating(true);

    try {
      const { startDate, endDate } = getDateRange();
      
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          player_id: selectedPlayer,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          report_type: 'progress',
          format: reportFormat,
        },
      });

      if (error) throw error;

      if (reportFormat === "pdf" && data?.report_url) {
        // Download PDF
        window.open(data.report_url, '_blank');
        toast.success("Report generated successfully!");
      } else if (reportFormat === "email") {
        toast.success("Report sent to your email!");
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "7days": return "Last 7 Days";
      case "30days": return "Last 30 Days";
      case "90days": return "Last 90 Days";
      case "custom": return "Custom Range";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Generate Progress Report</CardTitle>
          </div>
          <CardDescription>
            Create a comprehensive performance analysis with metrics trends and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Selection */}
          <div className="space-y-2">
            <Label>Player</Label>
            <PlayerSelector
              selectedPlayerId={selectedPlayer}
              onSelectPlayer={setSelectedPlayer}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Time Period</Label>
            <Select value={period} onValueChange={(val) => setPeriod(val as ReportPeriod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {period === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      disabled={(date) => date > new Date() || (customStartDate ? date < customStartDate : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Delivery Format</Label>
            <Select value={reportFormat} onValueChange={(val) => setReportFormat(val as ReportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Download PDF</SelectItem>
                <SelectItem value="email">Send via Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!selectedPlayer || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5 mr-2" />
                Generate Report
              </>
            )}
          </Button>

          {/* Report Preview Info */}
          {selectedPlayer && (
            <div className="p-4 rounded-lg bg-muted/50 border text-sm">
              <p className="font-semibold mb-2">Report will include:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Performance trends for {getPeriodLabel()}</li>
                <li>• 4B pillar scores (BAT, BODY, BALL, BRAIN)</li>
                <li>• Key metrics improvements and regressions</li>
                <li>• Personalized recommendations</li>
                <li>• Drill effectiveness analysis</li>
                <li>• Comparison to previous periods</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Reports */}
      {previousReports && previousReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Reports</CardTitle>
            <CardDescription>Previously generated progress reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {previousReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {format(new Date(report.period_start), "MMM d")} - {format(new Date(report.period_end), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generated {format(new Date(report.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(report.report_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
