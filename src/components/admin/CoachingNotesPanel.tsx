import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pin, Trash2, Edit2, X } from "lucide-react";
import { format } from "date-fns";

interface CoachingNotesPanelProps {
  athleteId: string;
  athleteEmail: string;
  analysisId?: string;
}

type NoteType = 'general' | 'swing_analysis' | 'progress' | 'concern' | 'strength' | 'goal';

interface CoachingNote {
  id: string;
  note_content: string;
  note_type: NoteType;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  analysis_id: string | null;
}

const noteTypeColors: Record<NoteType, string> = {
  general: "bg-muted",
  swing_analysis: "bg-primary/10 text-primary",
  progress: "bg-green-500/10 text-green-700 dark:text-green-400",
  concern: "bg-destructive/10 text-destructive",
  strength: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  goal: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

const noteTypeLabels: Record<NoteType, string> = {
  general: "General",
  swing_analysis: "Swing Analysis",
  progress: "Progress",
  concern: "Concern",
  strength: "Strength",
  goal: "Goal",
};

export function CoachingNotesPanel({ athleteId, athleteEmail, analysisId }: CoachingNotesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("general");
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['coaching-notes', athleteId, analysisId],
    queryFn: async () => {
      let query = supabase
        .from('coaching_notes')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (analysisId) {
        query = query.eq('analysis_id', analysisId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CoachingNote[];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('coaching_notes').insert({
        coach_id: user.id,
        athlete_id: athleteId,
        note_content: noteContent,
        note_type: noteType,
        analysis_id: analysisId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-notes', athleteId] });
      setNoteContent("");
      setNoteType("general");
      setIsAdding(false);
      toast.success("Note added");
    },
    onError: () => toast.error("Failed to add note"),
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CoachingNote> }) => {
      const { error } = await supabase
        .from('coaching_notes')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-notes', athleteId] });
      setEditingId(null);
      setNoteContent("");
      toast.success("Note updated");
    },
    onError: () => toast.error("Failed to update note"),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coaching_notes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-notes', athleteId] });
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });

  const handleSave = () => {
    if (!noteContent.trim()) return;
    
    if (editingId) {
      updateNoteMutation.mutate({
        id: editingId,
        updates: { note_content: noteContent, note_type: noteType },
      });
    } else {
      addNoteMutation.mutate();
    }
  };

  const startEdit = (note: CoachingNote) => {
    setEditingId(note.id);
    setNoteContent(note.note_content);
    setNoteType(note.note_type);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNoteContent("");
    setNoteType("general");
    setIsAdding(false);
  };

  const togglePin = (note: CoachingNote) => {
    updateNoteMutation.mutate({
      id: note.id,
      updates: { is_pinned: !note.is_pinned },
    });
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading notes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Coaching Notes</CardTitle>
            <CardDescription>Private notes for {athleteEmail}</CardDescription>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(noteTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your coaching note..."
              rows={4}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                {editingId ? "Update" : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {notes && notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={noteTypeColors[note.note_type]}>
                      {noteTypeLabels[note.note_type]}
                    </Badge>
                    {note.is_pinned && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePin(note)}
                      className="h-8 w-8 p-0"
                    >
                      <Pin className={`h-4 w-4 ${note.is_pinned ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(note)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.note_content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No notes yet. Add your first coaching note above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
