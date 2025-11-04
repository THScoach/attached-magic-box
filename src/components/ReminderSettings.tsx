import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, Clock } from "lucide-react";

export function ReminderSettings() {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('practice_reminders_enabled')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setRemindersEnabled(data.practice_reminders_enabled ?? true);
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ practice_reminders_enabled: enabled })
        .eq('id', user.id);

      if (error) throw error;

      setRemindersEnabled(enabled);
      toast({
        title: enabled ? "Reminders enabled" : "Reminders disabled",
        description: enabled 
          ? "You'll receive notifications for upcoming practice sessions"
          : "Practice reminders have been turned off",
      });
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Practice Reminders</CardTitle>
        </div>
        <CardDescription>
          Get notified about upcoming training sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reminders">Enable Reminders</Label>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Notified 24 hours before scheduled sessions
            </div>
          </div>
          <Switch
            id="reminders"
            checked={remindersEnabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
