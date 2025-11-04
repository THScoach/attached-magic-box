import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PracticeJournalEntry {
  id: string;
  user_id: string;
  player_id: string | null;
  session_date: string;
  entry_type: 'general' | 'pre_session' | 'post_session' | 'drill_notes';
  title: string | null;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'frustrated' | 'tired' | null;
  energy_level: number | null;
  focus_level: number | null;
  tags: string[];
  voice_recorded: boolean;
  related_analysis_id: string | null;
  created_at: string;
  updated_at: string;
}

export function usePracticeJournal(playerId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['practice-journal', playerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('practice_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (playerId) {
        query = query.eq('player_id', playerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PracticeJournalEntry[];
    },
  });

  const createEntry = useMutation({
    mutationFn: async (entry: Omit<PracticeJournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('practice_journal')
        .insert([{ ...entry, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-journal'] });
      toast({
        title: "Entry saved!",
        description: "Your journal entry has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PracticeJournalEntry> }) => {
      const { data, error } = await supabase
        .from('practice_journal')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-journal'] });
      toast({
        title: "Entry updated!",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('practice_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-journal'] });
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: { audio: base64Audio },
          });

          if (error) throw error;
          resolve(data.text);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob);
    });
  };

  return {
    entries: entries || [],
    isLoading,
    createEntry: createEntry.mutate,
    updateEntry: updateEntry.mutate,
    deleteEntry: deleteEntry.mutate,
    transcribeAudio,
  };
}
