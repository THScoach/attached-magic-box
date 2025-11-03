import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FreeSwingCounterProps {
  swingsUsed: number;
  swingsLimit?: number;
  className?: string;
}

export function FreeSwingCounter({ 
  swingsUsed, 
  swingsLimit = 10,
  className 
}: FreeSwingCounterProps) {
  const navigate = useNavigate();
  const remaining = Math.max(0, swingsLimit - swingsUsed);
  const percentage = (swingsUsed / swingsLimit) * 100;

  const getColor = () => {
    if (remaining > 5) return "text-green-500 border-green-500/50 bg-green-500/10";
    if (remaining > 2) return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10";
    return "text-red-500 border-red-500/50 bg-red-500/10";
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-pointer hover:opacity-80 transition-opacity",
        getColor(),
        className
      )}
      onClick={() => navigate('/profile')}
    >
      <Zap className="h-3 w-3 mr-1" />
      <span className="font-semibold">{remaining}/{swingsLimit}</span>
      <span className="ml-1 text-xs opacity-80">free swings</span>
    </Badge>
  );
}
