import { useState, useEffect } from "react";
import { Bell, Check, Settings, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { formatDistanceToNow } from "date-fns";

export function RealtimeNotificationCenter() {
  const [user, setUser] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const {
    notifications,
    unreadCount,
    preferences,
    permission,
    requestNotificationPermission,
    markAsRead,
    markAllAsRead,
    updatePreferences,
  } = useRealtimeNotifications(user?.id);

  const handleEnableBrowserNotifications = async () => {
    const enabled = await requestNotificationPermission();
    if (enabled) {
      await updatePreferences({ browser_notifications: true });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return "🏆";
      case "message":
        return "💬";
      case "schedule":
        return "📅";
      case "report":
        return "📊";
      default:
        return "🔔";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              {permission !== "granted" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnableBrowserNotifications}
                >
                  Enable
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <>
              {unreadCount > 0 && (
                <div className="px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={markAllAsRead}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark all as read
                  </Button>
                </div>
              )}
              <ScrollArea className="h-[400px]">
                {notifications.slice(0, 20).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start p-4 cursor-pointer ${
                      !notification.is_read ? "bg-accent/50" : ""
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.is_read && (
                            <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Manage your notification preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show desktop notifications
                  </p>
                </div>
                <Switch
                  checked={preferences?.browser_notifications && permission === "granted"}
                  onCheckedChange={(checked) => {
                    if (checked && permission !== "granted") {
                      handleEnableBrowserNotifications();
                    } else {
                      updatePreferences({ browser_notifications: checked });
                    }
                  }}
                  disabled={permission === "denied"}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound for notifications
                  </p>
                </div>
                <Switch
                  checked={preferences?.sound_enabled || false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ sound_enabled: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Notification Types</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Messages</p>
                  <p className="text-xs text-muted-foreground">
                    Coach messages and communications
                  </p>
                </div>
                <Switch
                  checked={preferences?.notify_on_messages || false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ notify_on_messages: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Achievements</p>
                  <p className="text-xs text-muted-foreground">
                    Milestones and achievements
                  </p>
                </div>
                <Switch
                  checked={preferences?.notify_on_achievements || false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ notify_on_achievements: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Schedule</p>
                  <p className="text-xs text-muted-foreground">
                    Practice times and events
                  </p>
                </div>
                <Switch
                  checked={preferences?.notify_on_schedule || false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ notify_on_schedule: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Reports</p>
                  <p className="text-xs text-muted-foreground">
                    Progress reports and analytics
                  </p>
                </div>
                <Switch
                  checked={preferences?.notify_on_reports || false}
                  onCheckedChange={(checked) =>
                    updatePreferences({ notify_on_reports: checked })
                  }
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
