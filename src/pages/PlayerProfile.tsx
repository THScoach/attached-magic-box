import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/BottomNav";
import { PlayerAnalysisHistory } from "@/components/PlayerAnalysisHistory";
import { ExternalSessionDataView } from "@/components/ExternalSessionDataView";
import { ExternalSessionUpload } from "@/components/ExternalSessionUpload";
import { ArrowLeft, User, TrendingUp, Upload, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  handedness: string | null;
  position: string | null;
  team_name: string | null;
  organization: string | null;
  jersey_number: string | null;
  height: number | null;
  weight: number | null;
}

export default function PlayerProfile() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('[PlayerProfile] Component mounted/updated for playerId:', playerId);
    loadPlayer();
  }, [playerId]);

  const handleBackClick = () => {
    console.log('[PlayerProfile] Back button clicked, isAdmin:', isAdmin);
    // If admin came from admin page, go back to admin
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate(-1);
    }
  };

  const loadPlayer = async () => {
    if (!playerId) {
      console.log('[PlayerProfile] No playerId provided');
      return;
    }

    console.log('[PlayerProfile] Loading player data for:', playerId);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) throw error;
      console.log('[PlayerProfile] Player loaded successfully:', data?.first_name, data?.last_name);
      setPlayer(data);
    } catch (error) {
      console.error('[PlayerProfile] Error loading player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading player...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Player not found</p>
      </div>
    );
  }

  const age = player.birth_date 
    ? new Date().getFullYear() - new Date(player.birth_date).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background px-6 pt-8 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {player.first_name} {player.last_name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {age && <Badge variant="secondary">{age} yo</Badge>}
              {player.handedness && <Badge variant="secondary">{player.handedness}HH</Badge>}
              {player.position && <Badge variant="secondary">{player.position}</Badge>}
              {player.jersey_number && <Badge variant="secondary">#{player.jersey_number}</Badge>}
            </div>
            {player.team_name && (
              <p className="text-sm text-muted-foreground mt-2">
                {player.team_name}
                {player.organization && ` • ${player.organization}`}
              </p>
            )}
            {(player.height || player.weight) && (
              <p className="text-sm text-muted-foreground">
                {player.height && `${Math.floor(player.height / 12)}'${player.height % 12}"`}
                {player.height && player.weight && ' • '}
                {player.weight && `${player.weight} lbs`}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button onClick={() => navigate('/analyze')} className="w-full">
            <Video className="mr-2 h-4 w-4" />
            Record Swing
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-6">
        <Tabs defaultValue="swings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="swings">Swings</TabsTrigger>
            <TabsTrigger value="external">External Data</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="swings" className="space-y-4 mt-6">
            <PlayerAnalysisHistory playerId={playerId!} />
          </TabsContent>

          <TabsContent value="external" className="space-y-4 mt-6">
            <ExternalSessionDataView key={refreshKey} playerId={playerId!} />
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-6">
            <ExternalSessionUpload 
              playerId={playerId!} 
              onUploadComplete={handleUploadComplete}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
