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
    video_type: "none",
    video_url: "",
    instructions_video_url: "",
    thumbnail_url: "",
    target_area: "",
    equipment_needed: "",
    skill_level: "beginner"
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
      instructions_video_url: formData.instructions_video_url || null,
      thumbnail_url: formData.thumbnail_url || null,
      target_area: formData.target_area || null,
      equipment_needed: formData.equipment_needed ? formData.equipment_needed.split(',').map(e => e.trim()) : null,
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
      video_type: "none",
      video_url: "",
      instructions_video_url: "",
      thumbnail_url: "",
      target_area: "",
      equipment_needed: "",
      skill_level: "beginner"
    });
    setIsEditing(false);
    setEditingId(null);
    loadDrills();
  };

  const handleEdit = (drill: any) => {
    setFormData({
      name: drill.name,
      pillar: drill.pillar,
      difficulty: drill.difficulty,
      duration: drill.duration,
      description: drill.description,
      instructions: drill.instructions || "",
      video_type: drill.video_type || "none",
      video_url: drill.video_url || "",
      instructions_video_url: drill.instructions_video_url || "",
      thumbnail_url: drill.thumbnail_url || "",
      target_area: drill.target_area || "",
      equipment_needed: drill.equipment_needed ? drill.equipment_needed.join(', ') : "",
      skill_level: drill.skill_level || "beginner"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_area">Target Area</Label>
                <Input
                  id="target_area"
                  placeholder="e.g., Hip rotation, Lower body stability"
                  value={formData.target_area}
                  onChange={(e) => setFormData({ ...formData, target_area: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="skill_level">Skill Level</Label>
                <Select
                  value={formData.skill_level}
                  onValueChange={(value) => setFormData({ ...formData, skill_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="equipment">Equipment Needed (comma-separated)</Label>
              <Input
                id="equipment"
                placeholder="e.g., Bat, Tee, Medicine ball"
                value={formData.equipment_needed}
                onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="video_type">Video Type</Label>
              <Select
                value={formData.video_type}
                onValueChange={(value) => setFormData({ ...formData, video_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Video</SelectItem>
                  <SelectItem value="link">YouTube/Vimeo Link</SelectItem>
                  <SelectItem value="upload">Upload Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.video_type === 'link' && (
              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>
            )}

            {formData.video_type === 'upload' && (
              <div>
                <Label>Upload Video</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload drill videos to swing-videos bucket manually, then paste the URL here
                </p>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>
            )}

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
