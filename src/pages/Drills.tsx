import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { DrillCard } from "@/components/DrillCard";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { PlayerProfileHeader } from "@/components/PlayerProfileHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Target, Zap, Waves } from "lucide-react";
import { DrillRecommendations } from "@/components/DrillRecommendations";
import { PlayerSelector } from "@/components/PlayerSelector";

interface Drill {
  id: string;
  name: string;
  pillar: "ANCHOR" | "ENGINE" | "WHIP";
  difficulty: number;
  duration: number;
  description: string;
  instructions: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
}

export default function Drills() {
  const [filter, setFilter] = useState<"ALL" | "ANCHOR" | "ENGINE" | "WHIP">("ALL");
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(() => {
    return sessionStorage.getItem('selectedPlayerId');
  });

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (selectedPlayerId) {
      sessionStorage.setItem('selectedPlayerId', selectedPlayerId);
    }
  }, [selectedPlayerId]);

  useEffect(() => {
    loadDrills();
  }, []);

  const loadDrills = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("drills")
      .select("*")
      .order("pillar", { ascending: true });

    if (error) {
      toast.error("Failed to load drills");
      setLoading(false);
      return;
    }

    setDrills((data as any[]) || []);
    setLoading(false);
  };
  
  const filteredDrills = filter === "ALL" 
    ? drills 
    : drills.filter(drill => drill.pillar === filter);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PlayerProfileHeader playerId={selectedPlayerId} />
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Drill Library</h1>
        <p className="text-muted-foreground">
          Targeted exercises to improve your swing
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Card className="p-4">
          <PlayerSelector
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
          />
        </Card>

        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="recommended">
              <Lightbulb className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="anchor">
              <Target className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="engine">
              <Zap className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="whip">
              <Waves className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommended" className="space-y-4 mt-6">
            <DrillRecommendations userId={userId} playerId={selectedPlayerId || undefined} />
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {loading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading drills...</p>
                </Card>
              ) : drills.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No drills found</p>
                </Card>
              ) : (
                drills.map(drill => (
                  <DrillCard 
                    key={drill.id} 
                    drill={drill}
                    onViewDrill={(id) => {
                      toast.info("Drill details coming soon!");
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="anchor" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {loading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading drills...</p>
                </Card>
              ) : drills.filter(d => d.pillar === 'ANCHOR').length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No ANCHOR drills found</p>
                </Card>
              ) : (
                drills.filter(d => d.pillar === 'ANCHOR').map(drill => (
                  <DrillCard 
                    key={drill.id} 
                    drill={drill}
                    onViewDrill={(id) => {
                      toast.info("Drill details coming soon!");
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="engine" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {loading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading drills...</p>
                </Card>
              ) : drills.filter(d => d.pillar === 'ENGINE').length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No ENGINE drills found</p>
                </Card>
              ) : (
                drills.filter(d => d.pillar === 'ENGINE').map(drill => (
                  <DrillCard 
                    key={drill.id} 
                    drill={drill}
                    onViewDrill={(id) => {
                      toast.info("Drill details coming soon!");
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="whip" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {loading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading drills...</p>
                </Card>
              ) : drills.filter(d => d.pillar === 'WHIP').length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No WHIP drills found</p>
                </Card>
              ) : (
                drills.filter(d => d.pillar === 'WHIP').map(drill => (
                  <DrillCard 
                    key={drill.id} 
                    drill={drill}
                    onViewDrill={(id) => {
                      toast.info("Drill details coming soon!");
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
