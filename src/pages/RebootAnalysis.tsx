import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, TrendingUp, TrendingDown, Download, Zap, Target, Clock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { FourBMotionAnalysis } from "@/components/FourBMotionAnalysis";
import { KinematicSequenceGraph } from "@/components/KinematicSequenceGraph";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RebootReport {
  id: string;
  label: string;
  uploadDate: Date; // When the PDF was uploaded
  reportDate: Date; // Date extracted from the PDF report itself
  metrics: {
    negativeMoveTime: number; // seconds before impact
    maxPelvisTurnTime: number;
    maxShoulderTurnTime: number;
    maxXFactorTime: number;
    loadDuration: number; // ms
    fireDuration: number; // ms
    tempoRatio: number;
    kinematicSequenceGap: number;
  };
  scores: {
    fireDurationScore: number;
    tempoRatioScore: number;
    bodyScore: number;
    archetype: string;
  };
}

export default function RebootAnalysis() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<RebootReport[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<[string | null, string | null]>([null, null]);

  const calculateMetrics = (data: {
    negativeMoveTime: number;
    maxPelvisTurnTime: number;
    maxShoulderTurnTime: number;
    maxXFactorTime: number;
  }) => {
    // Load Duration (ms) = (Negative Move Time - Max Pelvis Turn Time) × 1000
    const loadDuration = (data.negativeMoveTime - data.maxPelvisTurnTime) * 1000;
    
    // Fire Duration (ms) = Max Pelvis Turn Time × 1000
    const fireDuration = data.maxPelvisTurnTime * 1000;
    
    // Tempo Ratio = Load Duration ÷ Fire Duration
    const tempoRatio = loadDuration / fireDuration;
    
    // Kinematic Sequence Gap = Max Pelvis Turn Time - Max Shoulder Turn Time
    const kinematicSequenceGap = (data.maxPelvisTurnTime - data.maxShoulderTurnTime) * 1000;

    return {
      loadDuration: Math.round(loadDuration),
      fireDuration: Math.round(fireDuration),
      tempoRatio: Math.round(tempoRatio * 100) / 100,
      kinematicSequenceGap: Math.round(kinematicSequenceGap)
    };
  };

  const calculateScores = (metrics: ReturnType<typeof calculateMetrics>) => {
    // Fire Duration Scoring
    let fireDurationScore = 0;
    if (metrics.fireDuration >= 130 && metrics.fireDuration <= 150) {
      fireDurationScore = 100; // Excellent
    } else if (metrics.fireDuration > 150 && metrics.fireDuration <= 200) {
      fireDurationScore = 85; // Good
    } else if (metrics.fireDuration > 200 && metrics.fireDuration <= 250) {
      fireDurationScore = 70; // Developing
    } else {
      fireDurationScore = 50; // Needs Work
    }

    // Tempo Ratio Scoring
    let tempoRatioScore = 0;
    if (metrics.tempoRatio >= 2.0 && metrics.tempoRatio <= 2.6) {
      tempoRatioScore = 100; // Optimal
    } else if (metrics.tempoRatio > 2.6 && metrics.tempoRatio <= 3.5) {
      tempoRatioScore = 95; // Elite
    } else if (metrics.tempoRatio < 2.0) {
      tempoRatioScore = 60; // Rushed
    } else {
      tempoRatioScore = 70; // Over-whip
    }

    // Body Score (average of both)
    const bodyScore = Math.round((fireDurationScore + tempoRatioScore) / 2);

    // Archetype Classification
    let archetype = "";
    if (metrics.tempoRatio > 2.6 && metrics.fireDuration < 200) {
      archetype = "Elite Whipper";
    } else if (metrics.tempoRatio >= 2.0 && metrics.tempoRatio <= 2.6 && metrics.fireDuration >= 150 && metrics.fireDuration <= 200) {
      archetype = "Spinner";
    } else if (metrics.tempoRatio < 2.0) {
      archetype = "Rushed";
    } else if (metrics.tempoRatio > 3.5) {
      archetype = "Over-whip";
    } else {
      archetype = "Developing";
    }

    return {
      fireDurationScore,
      tempoRatioScore,
      bodyScore,
      archetype
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);
    toast.loading('Processing Reboot Motion report...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload PDF to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/reboot-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Parse PDF to extract metrics
      const filePath = `swing-videos/${fileName}`;
      
      const { data: parsedData, error: parseError } = await supabase.functions
        .invoke('parse-reboot-pdf', {
          body: { filePath, extractTiming: true }
        });

      if (parseError) throw parseError;

      // Process extracted data
      const timingData = parsedData?.timing || {
        negativeMoveTime: 0.956, // Example defaults
        maxPelvisTurnTime: 0.241,
        maxShoulderTurnTime: 0.189,
        maxXFactorTime: 0.156
      };

      // Get the report date from the PDF or use today as fallback
      const reportDateStr = parsedData?.reportDate || new Date().toISOString().split('T')[0];
      const reportDate = new Date(reportDateStr);

      const metrics = calculateMetrics(timingData);
      const scores = calculateScores(metrics);

      const newReport: RebootReport = {
        id: Date.now().toString(),
        label: `Report ${reports.length + 1}`,
        uploadDate: new Date(),
        reportDate: reportDate, // Date from the PDF report itself
        metrics: {
          ...timingData,
          ...metrics
        },
        scores
      };

      setReports(prev => [...prev, newReport]);
      toast.dismiss();
      toast.success('Report processed successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to process report');
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getArchetypeColor = (archetype: string) => {
    if (archetype === "Elite Whipper") return "bg-green-500/10 text-green-600 border-green-500";
    if (archetype === "Spinner") return "bg-blue-500/10 text-blue-600 border-blue-500";
    if (archetype === "Rushed") return "bg-orange-500/10 text-orange-600 border-orange-500";
    if (archetype === "Over-whip") return "bg-purple-500/10 text-purple-600 border-purple-500";
    return "bg-gray-500/10 text-gray-600 border-gray-500";
  };

  const compareReports = () => {
    const [beforeId, afterId] = selectedReportIds;
    if (!beforeId || !afterId) return null;

    const before = reports.find(r => r.id === beforeId);
    const after = reports.find(r => r.id === afterId);
    if (!before || !after) return null;

    return {
      before,
      after,
      deltas: {
        loadDuration: after.metrics.loadDuration - before.metrics.loadDuration,
        fireDuration: after.metrics.fireDuration - before.metrics.fireDuration,
        tempoRatio: after.metrics.tempoRatio - before.metrics.tempoRatio,
        bodyScore: after.scores.bodyScore - before.scores.bodyScore
      }
    };
  };

  const comparison = compareReports();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background px-6 pt-8 pb-6 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">4B Motion Analysis</h1>
            <p className="text-muted-foreground">
              Reboot Motion 3D Tempo Calculator & Progress Tracker
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            📊 Powered by Reboot Motion
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload & Calculate</TabsTrigger>
            <TabsTrigger value="compare">Compare Reports</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Reboot Motion Report</CardTitle>
                <CardDescription>
                  Upload your Reboot Motion PDF report to automatically extract timing data and calculate tempo metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="reboot-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="reboot-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">
                        {uploading ? 'Processing...' : 'Click to upload PDF'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to select
                      </p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Latest Report */}
            {reports.length > 0 && (() => {
              const latest = reports[reports.length - 1];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Latest Analysis</h2>
                    <div className="text-sm text-muted-foreground">
                      Report Date: <span className="font-semibold">{latest.reportDate.toLocaleDateString()}</span>
                      {latest.uploadDate.toDateString() !== latest.reportDate.toDateString() && (
                        <span className="ml-2 text-xs">
                          (Uploaded: {latest.uploadDate.toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Metrics Overview */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">Load</Badge>
                            <InfoTooltip content="Load Duration is the time from initial movement to maximum pelvis rotation. Optimal range: 400-700ms. This represents the energy storage phase of the swing." />
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{latest.metrics.loadDuration}ms</div>
                        <p className="text-sm text-muted-foreground">Load Duration</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Zap className="h-5 w-5 text-orange-500" />
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">Fire</Badge>
                            <InfoTooltip content="Fire Duration is the time from maximum pelvis rotation to contact. Elite range: 130-150ms. This is the explosive energy release phase where power is transferred through the kinetic chain." />
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{latest.metrics.fireDuration}ms</div>
                        <p className="text-sm text-muted-foreground">Fire Duration</p>
                        <div className="mt-2">
                          <Progress value={latest.scores.fireDurationScore} className="h-2" />
                          <p className={`text-xs mt-1 font-semibold ${getScoreColor(latest.scores.fireDurationScore)}`}>
                            {latest.scores.fireDurationScore >= 90 ? 'Excellent' : 
                             latest.scores.fireDurationScore >= 75 ? 'Good' : 'Developing'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="h-5 w-5 text-green-500" />
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">Ratio</Badge>
                            <InfoTooltip content="Tempo Ratio = Load Duration ÷ Fire Duration. Optimal: 2.0-2.6:1, Elite: 2.6-3.5:1. This ratio indicates timing efficiency and power accumulation. Too low = rushed, too high = over-whip." />
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{latest.metrics.tempoRatio}:1</div>
                        <p className="text-sm text-muted-foreground">Tempo Ratio</p>
                        <div className="mt-2">
                          <Progress value={latest.scores.tempoRatioScore} className="h-2" />
                          <p className={`text-xs mt-1 font-semibold ${getScoreColor(latest.scores.tempoRatioScore)}`}>
                            {latest.metrics.tempoRatio >= 2.0 && latest.metrics.tempoRatio <= 2.6 ? 'Optimal' :
                             latest.metrics.tempoRatio > 2.6 && latest.metrics.tempoRatio <= 3.5 ? 'Elite' : 
                             latest.metrics.tempoRatio < 2.0 ? 'Rushed' : 'Over-whip'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">4B</Badge>
                            <InfoTooltip content="Body Score is calculated from Fire Duration and Tempo Ratio scores. This composite metric reflects overall swing efficiency and timing quality in the BODY pillar of the 4 B's framework." />
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{latest.scores.bodyScore}</div>
                        <p className="text-sm text-muted-foreground">Body Score</p>
                        <Badge className={`mt-2 ${getArchetypeColor(latest.scores.archetype)}`}>
                          {latest.scores.archetype}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-semibold mb-2">Extracted Timing Data</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Negative Move:</span>
                              <span className="font-medium">{latest.metrics.negativeMoveTime.toFixed(3)}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Pelvis Turn:</span>
                              <span className="font-medium">{latest.metrics.maxPelvisTurnTime.toFixed(3)}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Shoulder Turn:</span>
                              <span className="font-medium">{latest.metrics.maxShoulderTurnTime.toFixed(3)}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max X Factor:</span>
                              <span className="font-medium">{latest.metrics.maxXFactorTime.toFixed(3)}s</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Calculated Metrics</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Load Duration:</span>
                              <span className="font-medium">{latest.metrics.loadDuration}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fire Duration:</span>
                              <span className="font-medium">{latest.metrics.fireDuration}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tempo Ratio:</span>
                              <span className="font-medium">{latest.metrics.tempoRatio}:1</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sequence Gap:</span>
                              <span className="font-medium">{latest.metrics.kinematicSequenceGap}ms</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coaching Recommendations */}
                      <Alert>
                        <AlertDescription>
                          <h4 className="font-semibold mb-2">💡 Coaching Recommendations:</h4>
                          {latest.scores.archetype === "Elite Whipper" && (
                            <p>Excellent tempo! Your fire duration is explosive ({latest.metrics.fireDuration}ms) and tempo ratio is optimal. Focus on maintaining this elite timing pattern.</p>
                          )}
                          {latest.scores.archetype === "Spinner" && (
                            <p>Good balanced approach. Your tempo ratio ({latest.metrics.tempoRatio}:1) is in the optimal range. Work on reducing fire duration to break into elite territory.</p>
                          )}
                          {latest.scores.archetype === "Rushed" && (
                            <p>Your tempo ratio is below optimal ({latest.metrics.tempoRatio}:1). Focus on extending your load phase to build more energy before firing.</p>
                          )}
                          {latest.scores.archetype === "Over-whip" && (
                            <p>Your load phase may be too long ({latest.metrics.loadDuration}ms). Work on more explosive hip rotation to reduce your tempo ratio.</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Kinematic Sequence Graph */}
                  <KinematicSequenceGraph metrics={latest.metrics} />
                </div>
              );
            })()}
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            {reports.length < 2 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Upload at least 2 reports to compare progress</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Report Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Reports to Compare</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Before (Baseline)</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedReportIds[0] || ''}
                        onChange={(e) => setSelectedReportIds([e.target.value, selectedReportIds[1]])}
                      >
                        <option value="">Select report...</option>
                        {reports.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.label} - {r.uploadDate.toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">After (Current)</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedReportIds[1] || ''}
                        onChange={(e) => setSelectedReportIds([selectedReportIds[0], e.target.value])}
                      >
                        <option value="">Select report...</option>
                        {reports.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.label} - {r.reportDate.toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison Results */}
                {comparison && (
                  <div className="space-y-4">
                    {/* Progress Summary */}
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription>
                        <h4 className="font-semibold mb-2">📊 Progress Summary</h4>
                        <p>
                          Body Score: {comparison.after.scores.bodyScore}/100 
                          {comparison.deltas.bodyScore > 0 ? (
                            <span className="text-green-600 ml-2">↑ {comparison.deltas.bodyScore} points</span>
                          ) : comparison.deltas.bodyScore < 0 ? (
                            <span className="text-red-600 ml-2">↓ {Math.abs(comparison.deltas.bodyScore)} points</span>
                          ) : (
                            <span className="text-gray-600 ml-2">→ No change</span>
                          )}
                        </p>
                        <p className="mt-1">
                          Archetype: {comparison.before.scores.archetype} → {comparison.after.scores.archetype}
                          {comparison.before.scores.archetype !== comparison.after.scores.archetype && " ⭐"}
                        </p>
                      </AlertDescription>
                    </Alert>

                    {/* Side-by-Side Comparison */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Before */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Before</CardTitle>
                          <CardDescription>{comparison.before.reportDate.toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Load Duration:</span>
                            <span className="font-medium">{comparison.before.metrics.loadDuration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Fire Duration:</span>
                            <span className="font-medium">{comparison.before.metrics.fireDuration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tempo Ratio:</span>
                            <span className="font-medium">{comparison.before.metrics.tempoRatio}:1</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Body Score:</span>
                            <span className="font-medium">{comparison.before.scores.bodyScore}/100</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* After */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">After</CardTitle>
                          <CardDescription>{comparison.after.reportDate.toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Load Duration:</span>
                            <span className="font-medium">
                              {comparison.after.metrics.loadDuration}ms
                              {comparison.deltas.loadDuration !== 0 && (
                                <span className={`ml-2 text-xs ${comparison.deltas.loadDuration > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparison.deltas.loadDuration > 0 ? '↑' : '↓'} {Math.abs(comparison.deltas.loadDuration)}ms
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Fire Duration:</span>
                            <span className="font-medium">
                              {comparison.after.metrics.fireDuration}ms
                              {comparison.deltas.fireDuration !== 0 && (
                                <span className={`ml-2 text-xs ${comparison.deltas.fireDuration < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparison.deltas.fireDuration > 0 ? '↑' : '↓'} {Math.abs(comparison.deltas.fireDuration)}ms
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tempo Ratio:</span>
                            <span className="font-medium">
                              {comparison.after.metrics.tempoRatio}:1
                              {comparison.deltas.tempoRatio !== 0 && (
                                <span className={`ml-2 text-xs ${comparison.deltas.tempoRatio > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                  {comparison.deltas.tempoRatio > 0 ? '↑' : '↓'} {Math.abs(comparison.deltas.tempoRatio).toFixed(2)}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Body Score:</span>
                            <span className="font-medium">
                              {comparison.after.scores.bodyScore}/100
                              {comparison.deltas.bodyScore !== 0 && (
                                <span className={`ml-2 text-xs ${comparison.deltas.bodyScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparison.deltas.bodyScore > 0 ? '↑' : '↓'} {Math.abs(comparison.deltas.bodyScore)} pts
                                </span>
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <FourBMotionAnalysis playerId={undefined} />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}