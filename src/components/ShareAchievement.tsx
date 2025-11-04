import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Download, Twitter, Facebook, Instagram, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface ShareAchievementProps {
  type: "goal" | "personal_best" | "streak" | "highlight" | "progress";
  data: {
    title: string;
    metric?: string;
    value?: number;
    unit?: string;
    score?: number;
    improvement?: number;
    date?: string;
  };
  trigger?: React.ReactNode;
}

export function ShareAchievement({ type, data, trigger }: ShareAchievementProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getTypeConfig = () => {
    switch (type) {
      case "goal":
        return {
          gradient: "from-green-500 to-emerald-600",
          icon: "🎯",
          title: "Goal Achieved!",
        };
      case "personal_best":
        return {
          gradient: "from-blue-500 to-cyan-600",
          icon: "🚀",
          title: "New Personal Best!",
        };
      case "streak":
        return {
          gradient: "from-orange-500 to-red-600",
          icon: "🔥",
          title: "Streak Milestone!",
        };
      case "highlight":
        return {
          gradient: "from-purple-500 to-pink-600",
          icon: "⭐",
          title: "Top Performance!",
        };
      case "progress":
        return {
          gradient: "from-yellow-500 to-amber-600",
          icon: "📈",
          title: "Progress Update!",
        };
    }
  };

  const config = getTypeConfig();

  const generateImage = async () => {
    if (!cardRef.current) return null;

    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setGenerating(false);
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      setGenerating(false);
      return null;
    }
  };

  const handleDownload = async () => {
    const imageUrl = await generateImage();
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `hits-${type}-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();

    toast({
      title: "Image Downloaded!",
      description: "Your achievement card has been saved.",
    });
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'native') => {
    const shareText = `${data.title} ${data.metric ? `- ${data.metric}: ${data.value}${data.unit}` : ''} 🎯 #HITS #BaseballTraining`;
    const shareUrl = window.location.origin;

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        '_blank'
      );
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link Copied!",
      description: "Share this link to show off your achievement.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Achievement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <div
            ref={cardRef}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${config.gradient} p-8 text-white shadow-2xl`}
          >
            <div className="relative z-10 space-y-4">
              {/* Icon */}
              <div className="text-6xl">{config.icon}</div>

              {/* Title */}
              <div>
                <p className="text-sm font-medium opacity-90">{config.title}</p>
                <h3 className="text-2xl font-bold mt-1">{data.title}</h3>
              </div>

              {/* Metric */}
              {data.metric && data.value !== undefined && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">{data.metric}</p>
                  <p className="text-4xl font-bold">
                    {data.value}
                    {data.unit && <span className="text-2xl ml-1">{data.unit}</span>}
                  </p>
                </div>
              )}

              {/* Score */}
              {data.score !== undefined && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">H.I.T.S. Score</p>
                  <p className="text-4xl font-bold">{data.score}</p>
                </div>
              )}

              {/* Improvement */}
              {data.improvement !== undefined && data.improvement > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="opacity-90">Improvement:</span>
                  <span className="font-bold">+{data.improvement}%</span>
                </div>
              )}

              {/* Date */}
              {data.date && (
                <p className="text-xs opacity-75">{data.date}</p>
              )}

              {/* Branding */}
              <div className="absolute bottom-4 right-4 opacity-50">
                <p className="text-xs font-bold">H.I.T.S.</p>
                <p className="text-[10px]">Training System</p>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleDownload}
                disabled={generating}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleShare('twitter')}
                variant="outline"
                className="w-full"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleShare('facebook')}
                variant="outline"
                className="w-full"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              {navigator.share && (
                <Button
                  onClick={() => handleShare('native')}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Share your achievement and inspire others! 💪
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
