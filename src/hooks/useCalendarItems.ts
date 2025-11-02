import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type CalendarItemRow = Database['public']['Tables']['calendar_items']['Row'];

export interface CalendarItem {
  id: string;
  user_id: string;
  player_id: string | null;
  coach_id: string | null;
  item_type: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  duration: number | null;
  status: string;
  completed_at: string | null;
  metadata: any;
  created_at: string;
}

export function useCalendarItems(userId: string, playerId: string | null, startDate: Date, endDate: Date) {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('calendar_items')
        .select('*')
        .eq('user_id', userId)
        .gte('scheduled_date', format(startDate, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(endDate, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (playerId) {
        query = query.eq('player_id', playerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading calendar items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [userId, playerId, startDate, endDate]);

  const addItem = async (item: Omit<CalendarItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      
      await loadItems();
    } catch (error) {
      console.error('Error adding calendar item:', error);
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<CalendarItem>) => {
    try {
      const { error } = await supabase
        .from('calendar_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadItems();
    } catch (error) {
      console.error('Error updating calendar item:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadItems();
    } catch (error) {
      console.error('Error deleting calendar item:', error);
      throw error;
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    reload: loadItems
  };
}
