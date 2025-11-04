import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pin, Trash2, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";

interface CoachingNote {
  id: string;
  coach_id: string;
  athlete_id: string;
  player_id: string | null;
  analysis_id: string | null;
  note_content: string;
  note_type: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface CoachingNotesPanelProps {
  athleteId: string;
  athleteEmail: string;
}

const NOTE_TYPES = [
  { value: "general", label: "General" },
  { value: "swing_analysis", label: "Swing Analysis" },
  { value: "progress", label: "Progress" },
  { value: "concern", label: "Concern" },
  { value: "strength", label: "Strength" },
  { value: "goal", label: "Goal" },
];

export function CoachingNotesPanel({ athleteId, athleteEmail }: CoachingNotesPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["coaching-notes", athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_notes")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachingNote[];
    },
  });

  const createNote = useMutation({
    mutationFn: async (note: { content: string; type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase.from("coaching_notes").insert([{
        coach_id: user.id,
        athlete_id: athleteId,
        note_content: note.content,
        note_type: note.type,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-notes", athleteId] });
      setNewNote("");
      toast.success("Note added");
    },
    onError: () => toast.error("Failed to add note"),
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("coaching_notes")
        .update({ note_content: content })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-notes", athleteId] });
      setEditingId(null);
      toast.success("Note updated");
    },
    onError: () => toast.error("Failed to update note"),
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("coaching_notes")
        .update({ is_pinned: !isPinned })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-notes", athleteId] });
      toast.success("Note updated");
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coaching_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-notes", athleteId] });
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    createNote.mutate({ content: newNote, type: noteType });
  };

  const startEdit = (note: CoachingNote) => {
    setEditingId(note.id);
    setEditContent(note.note_content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = (id: string) => {
    if (!editContent.trim()) return;
    updateNote.mutate({ id, content: editContent });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-muted",
      swing_analysis: "bg-primary/20",
      progress: "bg-green-500/20",
      concern: "bg-destructive/20",
      strength: "bg-blue-500/20",
      goal: "bg-purple-500/20",
    };
    return colors[type] || "bg-muted";
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading notes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coaching Notes</CardTitle>
        <CardDescription>Private notes for {athleteEmail}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a coaching note..."
              className="flex-1 min-h-[60px]"
            />
          </div>
          <Button type="submit" disabled={!newNote.trim() || createNote.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </form>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notes yet. Add your first coaching observation above.
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border ${note.is_pinned ? "border-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(note.note_type)}>
                      {NOTE_TYPES.find((t) => t.value === note.note_type)?.label}
                    </Badge>
                    {note.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePin.mutate({ id: note.id, isPinned: note.is_pinned })}
                    >
                      <Pin className={`h-4 w-4 ${note.is_pinned ? "fill-current" : ""}`} />
                    </Button>
                    {editingId === note.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => saveEdit(note.id)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(note)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNote.mutate(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === note.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{note.note_content}</p>
                )}

                <div className="text-xs text-muted-foreground mt-2">
                  {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                  {note.updated_at !== note.created_at && " (edited)"}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
