import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mic, MicOff, Plus, Edit2, Trash2, Tag } from "lucide-react";
import { usePracticeJournal } from "@/hooks/usePracticeJournal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const moodEmojis = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  frustrated: "😤",
  tired: "😴",
};

export function PracticeJournal({ playerId }: { playerId?: string }) {
  const { entries, isLoading, createEntry, updateEntry, deleteEntry, transcribeAudio } = usePracticeJournal(playerId);
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    entry_type: "general" as const,
    mood: null as string | null,
    energy_level: null as number | null,
    focus_level: null as number | null,
    tags: [] as string[],
    voice_recorded: false,
  });
  const [tagInput, setTagInput] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        
        try {
          const transcription = await transcribeAudio(audioBlob);
          setFormData(prev => ({
            ...prev,
            content: prev.content ? `${prev.content}\n\n${transcription}` : transcription,
            voice_recorded: true,
          }));
          toast({
            title: "Transcription complete!",
            description: "Your voice note has been converted to text.",
          });
        } catch (error) {
          toast({
            title: "Transcription failed",
            description: "Please try again or type your entry manually.",
            variant: "destructive",
          });
        } finally {
          setIsTranscribing(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice recording.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your journal entry.",
        variant: "destructive",
      });
      return;
    }

    createEntry({
      ...formData,
      title: formData.title || null,
      mood: formData.mood as any,
      session_date: new Date().toISOString(),
      player_id: playerId || null,
      related_analysis_id: null,
    });

    setFormData({
      title: "",
      content: "",
      entry_type: "general",
      mood: null,
      energy_level: null,
      focus_level: null,
      tags: [],
      voice_recorded: false,
    });
    setIsDialogOpen(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Practice Journal</CardTitle>
            <CardDescription>Track your thoughts, feelings, and progress</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Journal Entry</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your entry a title..."
                  />
                </div>

                <div>
                  <Label htmlFor="entry_type">Entry Type</Label>
                  <Select
                    value={formData.entry_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, entry_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="pre_session">Pre-Session</SelectItem>
                      <SelectItem value="post_session">Post-Session</SelectItem>
                      <SelectItem value="drill_notes">Drill Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="What's on your mind? How did practice go?"
                    rows={6}
                    disabled={isTranscribing}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isTranscribing}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          {isTranscribing ? "Transcribing..." : "Voice Note"}
                        </>
                      )}
                    </Button>
                    {isRecording && <span className="text-sm text-destructive animate-pulse">Recording...</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mood">Mood</Label>
                    <Select
                      value={formData.mood || ""}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How are you feeling?" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(moodEmojis).map(([mood, emoji]) => (
                          <SelectItem key={mood} value={mood}>
                            {emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="energy">Energy Level (1-5)</Label>
                    <Input
                      id="energy"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.energy_level || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, energy_level: parseInt(e.target.value) || null }))}
                      placeholder="1-5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="focus">Focus Level (1-5)</Label>
                  <Input
                    id="focus"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.focus_level || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, focus_level: parseInt(e.target.value) || null }))}
                    placeholder="1-5"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tags..."
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isTranscribing}>
                    Save Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading entries...</p>
        ) : entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No journal entries yet. Start tracking your practice!</p>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="pre_session">Pre</TabsTrigger>
              <TabsTrigger value="post_session">Post</TabsTrigger>
              <TabsTrigger value="drill_notes">Drills</TabsTrigger>
            </TabsList>
            
            {['all', 'general', 'pre_session', 'post_session', 'drill_notes'].map(type => (
              <TabsContent key={type} value={type} className="space-y-4 mt-4">
                {entries
                  .filter(entry => type === 'all' || entry.entry_type === type)
                  .map(entry => (
                    <Card key={entry.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {entry.title && <CardTitle className="text-lg">{entry.title}</CardTitle>}
                            <CardDescription>
                              {format(new Date(entry.session_date), 'PPp')}
                              {entry.mood && ` • ${moodEmojis[entry.mood as keyof typeof moodEmojis]}`}
                              {entry.voice_recorded && " • 🎤"}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                        
                        {(entry.energy_level || entry.focus_level) && (
                          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                            {entry.energy_level && <span>Energy: {entry.energy_level}/5</span>}
                            {entry.focus_level && <span>Focus: {entry.focus_level}/5</span>}
                          </div>
                        )}
                        
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {entry.tags.map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
