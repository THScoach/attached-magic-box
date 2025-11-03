import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export function InfoTooltip({ content, className = "" }: InfoTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          type="button"
          className={`inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors p-1 ${className}`}
        >
          <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-xs text-sm" side="top">
        {content}
      </PopoverContent>
    </Popover>
  );
}
