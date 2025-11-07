import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Calendar, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, nextMonday, setHours, setMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export function ZoomMeetingManager() {
  const [zoomLink, setZoomLink] = useState("https://us06web.zoom.us/j/6345738989?pwd=QkhxK0YzaHk3MTNTcmpjQjQwYmxrdz09");
  const [meetingPassword, setMeetingPassword] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getNextMondayAt7PMCST = () => {
    const now = new Date();
    const next = nextMonday(now);
    const cstTime = fromZonedTime(setMinutes(setHours(next, 19), 0), 'America/Chicago');
    return cstTime;
  };

  const scheduleRecurringMeetings = async () => {
    if (!zoomLink) {
      toast.error("Please provide a Zoom meeting link");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get all students
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .neq("id", user.id);

      if (profilesError) throw profilesError;

      // Schedule next 8 Mondays
      const meetings = [];
      for (let i = 0; i < 8; i++) {
        const meetingDate = addDays(getNextMondayAt7PMCST(), i * 7);
        
        // Create calendar items for each student
        const calendarItems = profiles?.map(profile => ({
          user_id: profile.id,
          coach_id: user.id,
          item_type: 'live_meeting',
          title: 'Weekly Zoom Coaching Session',
          description: `Join us for our weekly group coaching session!\n\nZoom Link: ${zoomLink}\n${meetingPassword ? `Password: ${meetingPassword}` : ''}`,
          scheduled_date: format(meetingDate, 'yyyy-MM-dd'),
          scheduled_time: '19:00',
          duration: 60,
          status: 'scheduled',
          metadata: {
            meetingType: 'zoom',
            zoomLink,
            password: meetingPassword,
            timezone: 'America/Chicago',
            recurring: true
          }
        }));

        if (calendarItems) {
          meetings.push(...calendarItems);
        }
      }

      const { error: insertError } = await supabase
        .from("calendar_items")
        .insert(meetings);

      if (insertError) throw insertError;

      toast.success("Recurring Zoom meetings scheduled for next 8 weeks!");
      setZoomLink("");
      setMeetingPassword("");
    } catch (error) {
      console.error("Error scheduling meetings:", error);
      toast.error("Failed to schedule meetings");
    } finally {
      setLoading(false);
    }
  };

  const sendReminderToAll = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const nextMeeting = getNextMondayAt7PMCST();

      // Get all students
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name")
        .neq("id", user.id);

      if (profilesError) throw profilesError;

      // Send notifications to all students
      const notifications = profiles?.map(profile => ({
        user_id: profile.id,
        type: 'meeting_reminder',
        title: 'Zoom Meeting Reminder',
        message: `Reminder: Weekly coaching session ${format(nextMeeting, 'EEEE, MMMM d')} at 7:00 PM CST.\n${customMessage || 'See you there!'}`,
      }));

      if (notifications) {
        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (notifError) throw notifError;
      }

      toast.success(`Reminders sent to ${profiles?.length || 0} students`);
      setCustomMessage("");
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast.error("Failed to send reminders");
    } finally {
      setLoading(false);
    }
  };

  const cancelNextMeeting = async () => {
    if (!customMessage) {
      toast.error("Please provide a cancellation message");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const nextMeeting = getNextMondayAt7PMCST();
      const dateStr = format(nextMeeting, 'yyyy-MM-dd');

      // Update calendar items to cancelled
      const { error: updateError } = await supabase
        .from("calendar_items")
        .update({ 
          status: 'cancelled',
          description: `CANCELLED\n\n${customMessage}`
        })
        .eq("coach_id", user.id)
        .eq("scheduled_date", dateStr)
        .eq("item_type", "live_meeting");

      if (updateError) throw updateError;

      // Get all students
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name")
        .neq("id", user.id);

      if (profilesError) throw profilesError;

      // Send cancellation notifications
      const notifications = profiles?.map(profile => ({
        user_id: profile.id,
        type: 'meeting_cancelled',
        title: '🚫 Meeting Cancelled',
        message: `The Zoom meeting scheduled for ${format(nextMeeting, 'EEEE, MMMM d')} at 7:00 PM CST has been cancelled.\n\n${customMessage}`,
      }));

      if (notifications) {
        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (notifError) throw notifError;
      }

      toast.success("Meeting cancelled and students notified");
      setCustomMessage("");
    } catch (error) {
      console.error("Error cancelling meeting:", error);
      toast.error("Failed to cancel meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Recurring Zoom Meetings Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zoom-link">Zoom Meeting Link</Label>
            <Input
              id="zoom-link"
              placeholder="https://zoom.us/j/..."
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting-password">Meeting Password (Optional)</Label>
            <Input
              id="meeting-password"
              placeholder="Meeting password"
              value={meetingPassword}
              onChange={(e) => setMeetingPassword(e.target.value)}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Recurring Schedule:</p>
            <p className="text-sm text-muted-foreground">
              Every Monday at 7:00 PM CST
            </p>
          </div>

          <Button
            className="w-full"
            onClick={scheduleRecurringMeetings}
            disabled={loading || !zoomLink}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Next 8 Weeks
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Meeting Reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-message">Custom Message (Optional)</Label>
            <Textarea
              id="reminder-message"
              placeholder="Add a custom message to the reminder..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            className="w-full"
            onClick={sendReminderToAll}
            disabled={loading}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Reminder to All Students
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <X className="h-5 w-5" />
            Cancel Next Meeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancellation-message">Cancellation Message *</Label>
            <Textarea
              id="cancellation-message"
              placeholder="Explain why the meeting is cancelled..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={cancelNextMeeting}
            disabled={loading || !customMessage}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Meeting & Notify Students
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
