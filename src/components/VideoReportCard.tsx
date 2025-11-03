import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Video } from "lucide-react";

interface VideoReportCardProps {
  analysisId: string;
  videoUrl: string | null;
  createdAt: string;
  overallScore: number;
  tempoRatio?: number;
  isSelected: boolean;
  onToggle: (analysisId: string) => void;
}

export function VideoReportCard({
  analysisId,
  videoUrl,
  createdAt,
  overallScore,
  tempoRatio,
  isSelected,
  onToggle
}: VideoReportCardProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Elite";
    if (score >= 80) return "Advanced";
    if (score >= 70) return "Good";
    if (score >= 60) return "Developing";
    return "Needs Work";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <Card 
      className={cn(
        "p-4 transition-all cursor-pointer hover:shadow-lg",
        isSelected && "border-2 border-primary shadow-md"
      )}
      onClick={() => onToggle(analysisId)}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggle(analysisId)}
            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        {/* Video Thumbnail */}
        <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              className="w-full h-full object-cover"
              preload="metadata"
            />
          ) : (
            <Video className="h-10 w-10 text-muted-foreground" />
          )}
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-2">
            {format(new Date(createdAt), 'MMM d, yyyy - h:mm a')}
          </p>
          <div className="space-y-1">
            <p className="text-base font-semibold">
              HITS Score: <span className={cn("font-bold", getScoreColor(overallScore))}>
                {overallScore.toFixed(2)}
              </span> ({getScoreLabel(overallScore)})
            </p>
            {tempoRatio && (
              <p className="text-sm text-muted-foreground">
                Tempo: {tempoRatio.toFixed(2)}:1
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
