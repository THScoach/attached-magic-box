import { cn } from "@/lib/utils";
import monogramMark from "@/assets/hits-monogram-v2.png";
import wordmarkHorizontal from "@/assets/hits-wordmark-v2.png";
import appIcon from "@/assets/hits-icon-v2.png";
import lockupWithTagline from "@/assets/hits-lockup-v2.png";
import embroideryVersion from "@/assets/hits-embroidery-v2.png";

interface HitsLogoProps {
  className?: string;
  variant?: "monogram" | "wordmark" | "lockup" | "icon" | "embroidery";
}

export function HitsLogo({ className, variant = "wordmark" }: HitsLogoProps) {
  const logos = {
    monogram: monogramMark,
    wordmark: wordmarkHorizontal,
    lockup: lockupWithTagline,
    icon: appIcon,
    embroidery: embroideryVersion,
  };

  return (
    <img 
      src={logos[variant]} 
      alt="HITS - Hitting Intelligence Training System" 
      className={cn("object-contain", className)}
    />
  );
}

export function HitsMonogram({ className }: { className?: string }) {
  return (
    <img 
      src={monogramMark} 
      alt="HITS" 
      className={cn("h-12 w-12 object-contain", className)}
    />
  );
}
