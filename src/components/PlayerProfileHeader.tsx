import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlayerProfileHeaderProps {
  playerId?: string | null;
  className?: string;
}

export function PlayerProfileHeader({ playerId, className = "" }: PlayerProfileHeaderProps) {
  const [playerName, setPlayerName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerName = async () => {
      // Try to get player ID from prop or sessionStorage
      const playerIdToUse = playerId || sessionStorage.getItem('selectedPlayerId');
      
      if (!playerIdToUse) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('players')
          .select('first_name, last_name')
          .eq('id', playerIdToUse)
          .single();

        if (error) {
          console.error('Error fetching player name:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const fullName = `${data.first_name} ${data.last_name}`.trim();
          setPlayerName(fullName || 'Unknown Player');
        }
      } catch (err) {
        console.error('Unexpected error fetching player name:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerName();
  }, [playerId]);

  // Don't render if no player or loading failed
  if (!playerName || loading) {
    return null;
  }

  return (
    <div className={`sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Viewing Profile:</span>
          </div>
          <Badge variant="outline" className="font-semibold text-base px-4 py-1.5">
            {playerName}
          </Badge>
        </div>
      </div>
    </div>
  );
}
