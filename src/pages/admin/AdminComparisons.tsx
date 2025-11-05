import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { X, Plus } from "lucide-react";

export default function AdminComparisons() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['admin-players-for-comparison'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .eq('is_active', true)
        .order('last_name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: comparisonData, isLoading: dataLoading } = useQuery({
    queryKey: ['player-comparison', selectedPlayers],
    queryFn: async () => {
      if (selectedPlayers.length === 0) return null;

      const playerDataPromises = selectedPlayers.map(async (playerId) => {
        const { data: analyses } = await supabase
          .from('swing_analyses')
          .select('bat_score, ball_score, body_score, brain_score, overall_score')
          .eq('player_id', playerId);

        const player = players?.find(p => p.id === playerId);

        if (!analyses || analyses.length === 0) {
          return {
            playerId,
            playerName: player ? `${player.first_name} ${player.last_name}` : 'Unknown',
            avgBat: 0,
            avgBall: 0,
            avgBody: 0,
            avgBrain: 0,
            avgOverall: 0,
            totalSwings: 0
          };
        }

        return {
          playerId,
          playerName: player ? `${player.first_name} ${player.last_name}` : 'Unknown',
          avgBat: analyses.reduce((sum, a) => sum + a.bat_score, 0) / analyses.length,
          avgBall: analyses.reduce((sum, a) => sum + a.ball_score, 0) / analyses.length,
          avgBody: analyses.reduce((sum, a) => sum + a.body_score, 0) / analyses.length,
          avgBrain: analyses.reduce((sum, a) => sum + a.brain_score, 0) / analyses.length,
          avgOverall: analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length,
          totalSwings: analyses.length
        };
      });

      return Promise.all(playerDataPromises);
    },
    enabled: selectedPlayers.length > 0
  });

  const radarData = [
    { metric: 'Bat', ...comparisonData?.reduce((acc, p) => ({ ...acc, [p.playerName]: p.avgBat }), {}) },
    { metric: 'Ball', ...comparisonData?.reduce((acc, p) => ({ ...acc, [p.playerName]: p.avgBall }), {}) },
    { metric: 'Body', ...comparisonData?.reduce((acc, p) => ({ ...acc, [p.playerName]: p.avgBody }), {}) },
    { metric: 'Brain', ...comparisonData?.reduce((acc, p) => ({ ...acc, [p.playerName]: p.avgBrain }), {}) }
  ];

  const colors = ['hsl(var(--primary))', '#FF6B35', '#4ECDC4', '#95E1D3', '#FFD700'];

  const addPlayer = (playerId: string) => {
    if (!selectedPlayers.includes(playerId) && selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
  };

  if (playersLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Player Comparisons</h1>
        <p className="text-muted-foreground">Compare up to 4 players side-by-side</p>
      </div>

      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Players to Compare ({selectedPlayers.length}/4)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select onValueChange={addPlayer} disabled={selectedPlayers.length >= 4}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a player to add..." />
              </SelectTrigger>
              <SelectContent>
                {players
                  ?.filter(p => !selectedPlayers.includes(p.id))
                  .map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlayers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.map(playerId => {
                const player = players?.find(p => p.id === playerId);
                return (
                  <div key={playerId} className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full">
                    <span>{player?.first_name} {player?.last_name}</span>
                    <button onClick={() => removePlayer(playerId)} className="hover:opacity-70">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlayers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select at least one player to begin comparison</p>
          </CardContent>
        </Card>
      )}

      {selectedPlayers.length > 0 && (
        <>
          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>4 B's Radar Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <Skeleton className="h-96" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    {comparisonData?.map((player, index) => (
                      <Radar
                        key={player.playerId}
                        name={player.playerName}
                        dataKey={player.playerName}
                        stroke={colors[index]}
                        fill={colors[index]}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Stats Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Metric</th>
                      {comparisonData?.map((player, index) => (
                        <th key={player.playerId} className="text-center p-4" style={{ color: colors[index] }}>
                          {player.playerName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Total Swings</td>
                      {comparisonData?.map(player => (
                        <td key={player.playerId} className="text-center p-4">{player.totalSwings}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Overall Score</td>
                      {comparisonData?.map(player => (
                        <td key={player.playerId} className="text-center p-4 font-bold text-primary">
                          {player.avgOverall.toFixed(0)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Bat Score</td>
                      {comparisonData?.map(player => (
                        <td key={player.playerId} className="text-center p-4">{player.avgBat.toFixed(0)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Ball Score</td>
                      {comparisonData?.map(player => (
                        <td key={player.playerId} className="text-center p-4">{player.avgBall.toFixed(0)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Body Score</td>
                      {comparisonData?.map(player => (
                        <td key={player.playerId} className="text-center p-4">{player.avgBody.toFixed(0)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Brain Score</td>
                      {comparisonData?.map(player => (
                        <td key={player.playerId} className="text-center p-4">{player.avgBrain.toFixed(0)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
