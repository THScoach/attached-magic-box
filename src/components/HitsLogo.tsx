import { cn } from "@/lib/utils";
import primaryMark from "@/assets/hits-logo-primary-mark.png";
import wordmarkHorizontal from "@/assets/hits-wordmark-horizontal.png";
import appIcon from "@/assets/hits-app-icon.png";
import withTagline from "@/assets/hits-logo-with-tagline.png";
import lightVersion from "@/assets/hits-logo-light.png";

interface HitsLogoProps {
  className?: string;
  variant?: "primary" | "wordmark" | "tagline" | "icon" | "light";
}

export function HitsLogo({ className, variant = "wordmark" }: HitsLogoProps) {
  const logos = {
    primary: primaryMark,
    wordmark: wordmarkHorizontal,
    tagline: withTagline,
    icon: appIcon,
    light: lightVersion,
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
      src={appIcon} 
      alt="HITS" 
      className={cn("h-10 w-10 object-contain", className)}
    />
  );
}
