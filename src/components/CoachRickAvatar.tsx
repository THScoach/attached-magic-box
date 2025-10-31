import { cn } from "@/lib/utils";
import avatarImage from "@/assets/coach-rick-avatar.png";

interface CoachRickAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  xs: "h-10 w-10",
  sm: "h-16 w-16",
  md: "h-32 w-32",
  lg: "h-48 w-48",
  xl: "h-64 w-64"
};

export function CoachRickAvatar({ 
  size = "md", 
  className,
  showBorder = true 
}: CoachRickAvatarProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-full",
        showBorder && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
        sizeClasses[size],
        className
      )}
    >
      <img 
        src={avatarImage} 
        alt="Coach Rick Strickland" 
        className="h-full w-full object-cover"
      />
    </div>
  );
}
