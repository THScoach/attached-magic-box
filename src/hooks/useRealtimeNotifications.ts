import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationPreferences {
  browser_notifications: boolean;
  sound_enabled: boolean;
  notify_on_messages: boolean;
  notify_on_achievements: boolean;
  notify_on_schedule: boolean;
  notify_on_reports: boolean;
}

export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!userId) return;

    // Load preferences
    loadPreferences();

    // Load initial notifications
    loadNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Show notification
          handleNewNotification(newNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
          );
          
          // Update unread count
          if (updatedNotification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadPreferences = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // Create default preferences if they don't exist
        if (error.code === "PGRST116") {
          const { data: newPrefs } = await supabase
            .from("notification_preferences")
            .insert({ user_id: userId })
            .select()
            .single();
          
          setPreferences(newPrefs);
        }
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const loadNotifications = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleNewNotification = async (notification: Notification) => {
    if (!preferences) return;

    // Check if this notification type is enabled
    const shouldNotify =
      (notification.type === "message" && preferences.notify_on_messages) ||
      (notification.type === "achievement" && preferences.notify_on_achievements) ||
      (notification.type === "schedule" && preferences.notify_on_schedule) ||
      (notification.type === "report" && preferences.notify_on_reports);

    if (!shouldNotify) return;

    // Show toast notification
    toast.success(notification.title, {
      description: notification.message,
    });

    // Play sound if enabled
    if (preferences.sound_enabled) {
      playNotificationSound();
    }

    // Show browser notification if enabled and permitted
    if (preferences.browser_notifications && permission === "granted") {
      showBrowserNotification(notification);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.error("Error playing notification sound:", error);
      });
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ("Notification" in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/hits-favicon.png",
        badge: "/hits-favicon.png",
        tag: notification.id,
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      setPermission("granted");
      return true;
    }

    if (Notification.permission !== "denied") {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Notifications enabled");
        return true;
      } else {
        toast.error("Notifications denied");
        return false;
      }
    }

    toast.error("Notifications are blocked. Please enable them in your browser settings.");
    return false;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state immediately for better UX
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      toast.success("Notification preferences updated");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  return {
    notifications,
    unreadCount,
    preferences,
    permission,
    requestNotificationPermission,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    reload: loadNotifications,
  };
}
