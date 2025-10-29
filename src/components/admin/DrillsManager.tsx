import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Drill {
  id: string;
  name: string;
  pillar: string;
  difficulty: number;
  duration: number;
  description: string;
  instructions: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
}

export function DrillsManager() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    pillar: "ANCHOR",
    difficulty: 1,
    duration: 10,
    description: "",
    instructions: "",
    video_url: "",
    thumbnail_url: "",
  });

  useEffect(() => {
    loadDrills();
  }, []);

  const loadDrills = async () => {
    const { data, error } = await supabase
      .from("drills")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load drills");
      return;
    }

    setDrills(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const drillData = {
      ...formData,
      difficulty: Number(formData.difficulty),
      duration: Number(formData.duration),
      instructions: formData.instructions || null,
      video_url: formData.video_url || null,
      thumbnail_url: formData.thumbnail_url || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("drills")
        .update(drillData)
        .eq("id", editingId);

      if (error) {
        toast.error("Failed to update drill");
        return;
      }
      toast.success("Drill updated successfully");
    } else {
      const { error } = await supabase.from("drills").insert([drillData]);

      if (error) {
        toast.error("Failed to create drill");
        return;
      }
      toast.success("Drill created successfully");
    }

    setFormData({
      name: "",
      pillar: "ANCHOR",
      difficulty: 1,
      duration: 10,
      description: "",
      instructions: "",
      video_url: "",
      thumbnail_url: "",
    });
    setIsEditing(false);
    setEditingId(null);
    loadDrills();
  };

  const handleEdit = (drill: Drill) => {
    setFormData({
      name: drill.name,
      pillar: drill.pillar,
      difficulty: drill.difficulty,
      duration: drill.duration,
      description: drill.description,
      instructions: drill.instructions || "",
      video_url: drill.video_url || "",
      thumbnail_url: drill.thumbnail_url || "",
    });
    setEditingId(drill.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this drill?")) return;

    const { error } = await supabase.from("drills").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete drill");
      return;
    }

    toast.success("Drill deleted successfully");
    loadDrills();
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case "ANCHOR": return "text-anchor";
      case "ENGINE": return "text-engine";
      case "WHIP": return "text-whip";
      default: return "text-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Drills Library</h2>
        <Button onClick={() => setIsEditing(!isEditing)}>
          <Plus className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Add Drill"}
        </Button>
      </div>

      {isEditing && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Drill Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="pillar">Pillar</Label>
                <Select
                  value={formData.pillar}
                  onValueChange={(value) => setFormData({ ...formData, pillar: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANCHOR">ANCHOR</SelectItem>
                    <SelectItem value="ENGINE">ENGINE</SelectItem>
                    <SelectItem value="WHIP">WHIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                <Input
                  id="difficulty"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions (optional)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              {editingId ? "Update Drill" : "Create Drill"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {drills.map((drill) => (
          <Card key={drill.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{drill.name}</h3>
                  <span className={`text-sm font-bold ${getPillarColor(drill.pillar)}`}>
                    {drill.pillar}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{drill.description}</p>
                {drill.instructions && (
                  <p className="text-sm mb-3">{drill.instructions}</p>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Difficulty: {drill.difficulty}/5</span>
                  <span>Duration: {drill.duration} min</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(drill)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(drill.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
