import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CSVImport from "@/components/CSVImport";

export default function CSVImportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") as "ball" | "bat" || "ball";
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPlayer();
    }
  }, [id]);

  const loadPlayer = async () => {
    const { data } = await supabase
      .from("players")
      .select("id, first_name, last_name")
      .eq("id", id)
      .single();

    setPlayer(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <p>Player not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-4 md:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/player/${id}/${type}`)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">
              Import CSV Data
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {player.first_name} {player.last_name} - {type === "ball" ? "Ball Tracking" : "Bat Sensor"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4">
        <CSVImport
          playerId={id!}
          importType={type}
          onSuccess={() => {
            navigate(`/player/${id}/${type}`);
          }}
        />
      </div>
    </div>
  );
}
