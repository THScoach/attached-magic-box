import { cn } from "@/lib/utils";

interface HitsLogoProps {
  className?: string;
  variant?: "full" | "compact";
}

export function HitsLogo({ className, variant = "full" }: HitsLogoProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500 shadow-lg">
          <span className="text-2xl font-black text-black">H</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black uppercase tracking-tight text-white">
          HITS
        </span>
        <span className="text-xs font-bold text-gray-400">™</span>
      </div>
      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-gray-500">
        Hitting Intelligence Training System
      </span>
    </div>
  );
}

export function HitsMonogram({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500 shadow-lg",
      className
    )}>
      <span className="text-2xl font-black text-black">H</span>
    </div>
  );
}
