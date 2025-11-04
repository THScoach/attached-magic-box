import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Film, Download, Share2, Sparkles, Play, TrendingUp, Loader2 } from "lucide-react";
import { useHighlightReel, HighlightSwing } from "@/hooks/useHighlightReel";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface HighlightReelProps {
  playerId?: string;
}

export function HighlightReel({ playerId }: HighlightReelProps) {
  const { highlights, isLoading, generateDescription } = useHighlightReel(playerId, 9);
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightSwing | null>(null);
  const [description, setDescription] = useState<string>("");
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const { toast } = useToast();

  const handleViewHighlight = async (highlight: HighlightSwing) => {
    setSelectedHighlight(highlight);
    setDescription("");
    setGeneratingDesc(true);
    
    const desc = await generateDescription(highlight);
    if (desc) {
      setDescription(desc);
    }
    setGeneratingDesc(false);
  };

  const handleShare = async (highlight: HighlightSwing) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Best Swing - ${highlight.overall_score} H.I.T.S. Score`,
          text: description || `Check out my swing with a ${highlight.overall_score} H.I.T.S. score!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Share this link to show off your highlight.",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-yellow-500";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Your Highlight Reel</h3>
          </div>
          <Badge variant="secondary">
            {highlights.length} Highlights
          </Badge>
        </div>

        {highlights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights.map((highlight) => (
              <Card
                key={highlight.id}
                className="group cursor-pointer hover:border-primary transition-all overflow-hidden"
                onClick={() => handleViewHighlight(highlight)}
              >
                <div className="relative aspect-video bg-black">
                  <video
                    src={highlight.video_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur">
                    {highlight.overall_score}
                  </Badge>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(highlight.created_at), 'MMM d, yyyy')}
                    </span>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">ANCHOR</p>
                      <p className={`font-semibold ${getScoreColor(highlight.anchor_score)}`}>
                        {highlight.anchor_score}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ENGINE</p>
                      <p className={`font-semibold ${getScoreColor(highlight.engine_score)}`}>
                        {highlight.engine_score}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">WHIP</p>
                      <p className={`font-semibold ${getScoreColor(highlight.whip_score)}`}>
                        {highlight.whip_score}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No highlights yet. Record some swings to build your reel!
            </p>
          </div>
        )}
      </Card>

      {/* Highlight Detail Modal */}
      <Dialog open={!!selectedHighlight} onOpenChange={() => setSelectedHighlight(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Highlight Details
            </DialogTitle>
          </DialogHeader>

          {selectedHighlight && (
            <div className="space-y-6">
              {/* Video */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={selectedHighlight.video_url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              </div>

              {/* AI Description */}
              {generatingDesc ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generating highlight description...</span>
                </div>
              ) : description ? (
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
                  <p className="text-sm leading-relaxed">{description}</p>
                </Card>
              ) : null}

              {/* Scores */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">H.I.T.S.</p>
                  <p className={`text-3xl font-bold ${getScoreColor(selectedHighlight.overall_score)}`}>
                    {selectedHighlight.overall_score}
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">ANCHOR</p>
                  <p className={`text-3xl font-bold ${getScoreColor(selectedHighlight.anchor_score)}`}>
                    {selectedHighlight.anchor_score}
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">ENGINE</p>
                  <p className={`text-3xl font-bold ${getScoreColor(selectedHighlight.engine_score)}`}>
                    {selectedHighlight.engine_score}
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">WHIP</p>
                  <p className={`text-3xl font-bold ${getScoreColor(selectedHighlight.whip_score)}`}>
                    {selectedHighlight.whip_score}
                  </p>
                </Card>
              </div>

              {/* Additional Metrics */}
              {(selectedHighlight.bat_speed || selectedHighlight.exit_velocity || selectedHighlight.sequence_efficiency) && (
                <div className="grid grid-cols-3 gap-4">
                  {selectedHighlight.bat_speed && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Bat Speed</p>
                      <p className="text-xl font-bold">{selectedHighlight.bat_speed} mph</p>
                    </div>
                  )}
                  {selectedHighlight.exit_velocity && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Exit Velocity</p>
                      <p className="text-xl font-bold">{selectedHighlight.exit_velocity} mph</p>
                    </div>
                  )}
                  {selectedHighlight.sequence_efficiency && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Sequence</p>
                      <p className="text-xl font-bold">{selectedHighlight.sequence_efficiency}%</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleShare(selectedHighlight)}
                  className="flex-1"
                  variant="outline"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedHighlight.video_url;
                    link.download = `highlight-${selectedHighlight.overall_score}.mp4`;
                    link.click();
                  }}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
