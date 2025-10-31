import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CoachMessage {
  id: string;
  message_type: string;
  trigger_reason?: string | null;
  message_content: string;
  cta_text?: string | null;
  cta_action?: string | null;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
  user_id: string;
  player_id?: string | null;
}

export function useCoachMessages() {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadMessages();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('coach-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coach_messages'
        },
        (payload) => {
          console.log('New coach message:', payload);
          const newMessage = payload.new as CoachMessage;
          setMessages(prev => [newMessage, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: 'Coach Rick',
            description: newMessage.message_content.substring(0, 50) + '...',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'coach_messages'
        },
        (payload) => {
          const updatedMessage = payload.new as CoachMessage;
          setMessages(prev =>
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
          if (updatedMessage.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setMessages(data || []);
      setUnreadCount(data?.filter(m => !m.is_read).length || 0);
    } catch (error) {
      console.error('Error loading coach messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('coach_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev =>
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_read: true, read_at: new Date().toISOString() } 
            : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('coach_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setMessages(prev =>
        prev.map(msg => ({ ...msg, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    messages,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: loadMessages,
  };
}
