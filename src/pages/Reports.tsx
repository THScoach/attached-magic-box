import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VideoReportCard } from "@/components/VideoReportCard";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAnalyses } from "@/hooks/usePlayerAnalyses";
import { PlayerSelector } from "@/components/PlayerSelector";
import { toast } from "sonner";
import { FileDown, Share2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Reports() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(() => {
    return sessionStorage.getItem('selectedPlayerId');
  });
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { analyses, loading } = usePlayerAnalyses(selectedPlayerId);

  useEffect(() => {
    if (selectedPlayerId) {
      sessionStorage.setItem('selectedPlayerId', selectedPlayerId);
    }
  }, [selectedPlayerId]);

  const toggleAnalysis = (analysisId: string) => {
    setSelectedAnalyses(prev => 
      prev.includes(analysisId)
        ? prev.filter(id => id !== analysisId)
        : [...prev, analysisId]
    );
  };

  const clearSelection = () => {
    setSelectedAnalyses([]);
  };

  const generateReport = async () => {
    if (selectedAnalyses.length === 0) {
      toast.error("Please select at least one video");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProgressStep("Preparing report...");

    try {
      // Step 1: Extract key frames (33%)
      setProgressStep("Extracting key frames");
      setProgress(33);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Analyzing biomechanics (66%)
      setProgressStep("Analyzing biomechanics");
      setProgress(66);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Generate PDF (100%)
      setProgressStep("Generating PDF");
      setProgress(90);

      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          analysisIds: selectedAnalyses,
          playerId: selectedPlayerId
        }
      });

      if (error) throw error;

      setProgress(100);
      setReportUrl(data.reportUrl);
      setShowSuccessDialog(true);
      toast.success("Report generated successfully!");
      
    } catch (error: any) {
      console.error('Report generation error:', error);
      toast.error("Failed to generate report: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressStep("");
    }
  };

  const downloadReport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  const shareReport = async () => {
    if (!reportUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Swing Analysis Report',
          text: 'Check out my swing analysis report!',
          url: reportUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(reportUrl);
      toast.success("Report link copied to clipboard!");
    }
  };

  const selectedCount = selectedAnalyses.length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Swing Reports</h1>
        <p className="text-muted-foreground">
          Select videos to generate comparison reports
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Player Selector */}
        <Card className="p-4">
          <PlayerSelector
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
          />
        </Card>

        {/* Action Buttons - Sticky */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 -mx-6 px-6 py-3 border-b">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={selectedCount === 0 || isGenerating}
              className="flex-1"
            >
              {selectedCount > 0 ? `${selectedCount} Selected` : 'Select Videos'}
            </Button>
            <Button
              onClick={generateReport}
              disabled={selectedCount === 0 || isGenerating}
              className="flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
          {selectedCount === 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Select at least one video to generate report
            </p>
          )}
        </div>

        {/* Video List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 h-32 animate-pulse bg-muted" />
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {selectedPlayerId 
                ? "No swing analyses found for this player"
                : "Select a player to view their swing analyses"
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {analyses.map(analysis => (
              <VideoReportCard
                key={analysis.id}
                analysisId={analysis.id}
                videoUrl={analysis.video_url}
                createdAt={analysis.created_at}
                overallScore={analysis.overall_score}
                tempoRatio={analysis.metrics?.tempoRatio}
                isSelected={selectedAnalyses.includes(analysis.id)}
                onToggle={toggleAnalysis}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress Dialog */}
      <Dialog open={isGenerating} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generating Your Report...</DialogTitle>
            <DialogDescription>
              {progressStep}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              This may take 10-30 seconds
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className={progress >= 33 ? "text-green-500" : ""}>
                  {progress >= 33 ? "✓" : "○"}
                </div>
                <span>Extracting key frames</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={progress >= 66 ? "text-green-500" : ""}>
                  {progress >= 66 ? "✓" : "○"}
                </div>
                <span>Analyzing biomechanics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={progress >= 100 ? "text-green-500" : ""}>
                  {progress >= 100 ? "✓" : "○"}
                </div>
                <span>Generating PDF</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center">Report Generated!</DialogTitle>
            <DialogDescription className="text-center">
              Your swing analysis report is ready
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={downloadReport}
              className="flex-1"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              onClick={shareReport}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
