import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Target, Star } from "lucide-react";

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  type: "goal" | "personal_best" | "streak" | "badge";
  title: string;
  message: string;
  metric?: string;
  value?: number;
}

export function CelebrationModal({
  open,
  onClose,
  type,
  title,
  message,
  metric,
  value,
}: CelebrationModalProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const icons = {
    goal: <Target className="h-20 w-20 text-primary" />,
    personal_best: <TrendingUp className="h-20 w-20 text-green-500" />,
    streak: <Star className="h-20 w-20 text-yellow-500" />,
    badge: <Trophy className="h-20 w-20 text-purple-500" />,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        {open && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}

        <div className="flex flex-col items-center gap-6 py-6">
          <div className="animate-bounce">
            {icons[type]}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {message}
            </p>
          </div>

          {metric && value !== undefined && (
            <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg w-full">
              <p className="text-sm text-muted-foreground mb-1">{metric}</p>
              <p className="text-4xl font-bold text-primary">{value}</p>
            </div>
          )}

          <Button onClick={onClose} size="lg" className="w-full">
            Awesome! Let's Keep Going! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
