import { Button } from "@/components/ui/button";
import { ShareAchievement } from "@/components/ShareAchievement";
import { Share2 } from "lucide-react";

interface QuickShareButtonProps {
  score: number;
  improvement?: number;
  metric?: string;
  value?: number;
  unit?: string;
}

export function QuickShareButton({ score, improvement, metric, value, unit }: QuickShareButtonProps) {
  return (
    <ShareAchievement
      type="progress"
      data={{
        title: "Progress Update",
        score,
        improvement,
        metric,
        value,
        unit,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      }}
      trigger={
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share Progress
        </Button>
      }
    />
  );
}
