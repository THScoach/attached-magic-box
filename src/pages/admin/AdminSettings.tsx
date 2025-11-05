import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Palette, Save } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // Return existing settings or defaults
      return data || {
        user_id: user.id,
        organization_name: '',
        organization_logo_url: '',
        primary_color: '#FFD700',
        secondary_color: '#FF6B35',
        email_notifications: {
          new_uploads: true,
          grade_declines: true,
          weekly_summary: true,
          daily_digest: false
        }
      };
    },
    enabled: !!user?.id
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          ...updatedSettings,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setHasChanges(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (settings) {
      saveMutation.mutate(settings);
    }
  };

  const updateSetting = (field: string, value: any) => {
    setHasChanges(true);
    queryClient.setQueryData(['admin-settings', user?.id], {
      ...settings,
      [field]: value
    });
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setHasChanges(true);
    const currentNotifications = settings?.email_notifications as any || {};
    queryClient.setQueryData(['admin-settings', user?.id], {
      ...settings,
      email_notifications: {
        ...currentNotifications,
        [key]: value
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-background max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your coach dashboard preferences</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Organization</CardTitle>
          </div>
          <CardDescription>Configure your organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={settings?.organization_name || ''}
              onChange={(e) => updateSetting('organization_name', e.target.value)}
              placeholder="Enter your organization name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="org-logo">Organization Logo URL</Label>
            <Input
              id="org-logo"
              value={settings?.organization_logo_url || ''}
              onChange={(e) => updateSetting('organization_logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Branding</CardTitle>
          </div>
          <CardDescription>Customize your dashboard colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={settings?.primary_color || '#FFD700'}
                  onChange={(e) => updateSetting('primary_color', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={settings?.primary_color || '#FFD700'}
                  onChange={(e) => updateSetting('primary_color', e.target.value)}
                  placeholder="#FFD700"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={settings?.secondary_color || '#FF6B35'}
                  onChange={(e) => updateSetting('secondary_color', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={settings?.secondary_color || '#FF6B35'}
                  onChange={(e) => updateSetting('secondary_color', e.target.value)}
                  placeholder="#FF6B35"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>New Video Uploads</Label>
              <p className="text-sm text-muted-foreground">Get notified when athletes upload new swings</p>
            </div>
            <Switch
              checked={(settings?.email_notifications as any)?.new_uploads ?? true}
              onCheckedChange={(checked) => updateNotificationSetting('new_uploads', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Grade Declines</Label>
              <p className="text-sm text-muted-foreground">Alert when player scores drop significantly</p>
            </div>
            <Switch
              checked={(settings?.email_notifications as any)?.grade_declines ?? true}
              onCheckedChange={(checked) => updateNotificationSetting('grade_declines', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Summary</Label>
              <p className="text-sm text-muted-foreground">Receive weekly team performance summaries</p>
            </div>
            <Switch
              checked={(settings?.email_notifications as any)?.weekly_summary ?? true}
              onCheckedChange={(checked) => updateNotificationSetting('weekly_summary', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Digest</Label>
              <p className="text-sm text-muted-foreground">Get daily activity summaries</p>
            </div>
            <Switch
              checked={(settings?.email_notifications as any)?.daily_digest ?? false}
              onCheckedChange={(checked) => updateNotificationSetting('daily_digest', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
