import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Zap, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DrillEffectiveness {
  drill_id: string;
  drill_name: string;
  difficulty: number;
  pillar: string;
  total_uses: number;
  avg_overall_score: number;
  avg_anchor_score: number;
  avg_engine_score: number;
  avg_whip_score: number;
  avg_bat_speed: number;
  avg_fire_sequence: number;
  first_used: string;
  last_used: string;
}

const pillarIcons = {
  ANCHOR: Target,
  ENGINE: Zap,
  WHIP: Activity,
};

const pillarColors = {
  ANCHOR: "text-blue-500",
  ENGINE: "text-orange-500",
  WHIP: "text-purple-500",
};

export function DrillEffectivenessPanel() {
  const [drills, setDrills] = useState<DrillEffectiveness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrillEffectiveness();
  }, []);

  const loadDrillEffectiveness = async () => {
    try {
      const { data, error } = await supabase
        .from('drill_effectiveness')
        .select('*')
        .order('total_uses', { ascending: false });

      if (error) throw error;
      setDrills(data || []);
    } catch (error) {
      console.error('Error loading drill effectiveness:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDrillsByPillar = (pillar: string) => {
    return drills
      .filter(d => d.pillar === pillar)
      .sort((a, b) => b.avg_overall_score - a.avg_overall_score);
  };

  const getTopDrills = (count: number = 10) => {
    return [...drills]
      .sort((a, b) => b.avg_overall_score - a.avg_overall_score)
      .slice(0, count);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Drill Effectiveness Analytics
        </CardTitle>
        <CardDescription>
          Track which drills produce the best results for your athletes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Drills</TabsTrigger>
            <TabsTrigger value="ANCHOR">Anchor</TabsTrigger>
            <TabsTrigger value="ENGINE">Engine</TabsTrigger>
            <TabsTrigger value="WHIP">Whip</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Drills Tracked</CardDescription>
                  <CardTitle className="text-3xl">{drills.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Uses</CardDescription>
                  <CardTitle className="text-3xl">
                    {drills.reduce((sum, d) => sum + (d.total_uses || 0), 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg Effectiveness</CardDescription>
                  <CardTitle className="text-3xl">
                    {drills.length > 0
                      ? (drills.reduce((sum, d) => sum + (d.avg_overall_score || 0), 0) / drills.length).toFixed(1)
                      : 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <DrillTable drills={getTopDrills()} title="Top Performing Drills" />
          </TabsContent>

          <TabsContent value="ANCHOR">
            <DrillTable drills={getDrillsByPillar('ANCHOR')} title="Anchor Drills" />
          </TabsContent>

          <TabsContent value="ENGINE">
            <DrillTable drills={getDrillsByPillar('ENGINE')} title="Engine Drills" />
          </TabsContent>

          <TabsContent value="WHIP">
            <DrillTable drills={getDrillsByPillar('WHIP')} title="Whip Drills" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DrillTable({ drills, title }: { drills: DrillEffectiveness[]; title: string }) {
  if (drills.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No drill data available yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Drill Name</TableHead>
              <TableHead>Pillar</TableHead>
              <TableHead className="text-center">Uses</TableHead>
              <TableHead className="text-center">Overall Score</TableHead>
              <TableHead className="text-center">Bat Speed</TableHead>
              <TableHead className="text-center">Sequence</TableHead>
              <TableHead className="text-center">Difficulty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drills.map((drill) => {
              const PillarIcon = pillarIcons[drill.pillar as keyof typeof pillarIcons];
              const pillarColor = pillarColors[drill.pillar as keyof typeof pillarColors];

              return (
                <TableRow key={drill.drill_id}>
                  <TableCell className="font-medium">{drill.drill_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={pillarColor}>
                      {PillarIcon && <PillarIcon className="h-3 w-3 mr-1" />}
                      {drill.pillar}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{drill.total_uses || 0}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {drill.avg_overall_score ? drill.avg_overall_score.toFixed(1) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {drill.avg_bat_speed ? drill.avg_bat_speed.toFixed(1) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {drill.avg_fire_sequence ? drill.avg_fire_sequence.toFixed(1) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={drill.difficulty <= 2 ? "secondary" : drill.difficulty <= 4 ? "default" : "destructive"}>
                      {drill.difficulty}/5
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
