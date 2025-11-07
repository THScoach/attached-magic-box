import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, Video, X, Send, Edit, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScheduledMeeting {
  id: string;
  title: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  metadata: {
    zoom_link?: string;
    zoom_password?: string;
    timezone?: string;
  } | null;
}

export default function AdminCalendar() {
  const navigate = useNavigate();
  const [zoomLink, setZoomLink] = useState("https://us06web.zoom.us/j/6345738989?pwd=QkhxK0YzaHk3MTNTcmpjQjQwYmxrdz09");
  const [zoomPassword, setZoomPassword] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<ScheduledMeeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  useEffect(() => {
    loadUpcomingMeetings();
  }, []);

  const loadUpcomingMeetings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("calendar_items")
        .select("*")
        .eq("item_type", "live_meeting")
        .eq("coach_id", user.id)
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      
      // Cast metadata to proper type
      const meetings = (data || []).map(item => ({
        ...item,
        metadata: item.metadata as ScheduledMeeting['metadata']
      }));
      
      setUpcomingMeetings(meetings);
    } catch (error) {
      console.error("Error loading meetings:", error);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const scheduleRecurringMeetings = async () => {
    if (!zoomLink.trim()) {
      toast.error("Please enter a Zoom link");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Schedule for next 8 Mondays at 7:00 PM CST
      // Create meetings for the coach - athletes will get them automatically via trigger when added
      const meetings = [];
      const timezone = "America/Chicago";
      
      for (let i = 0; i < 8; i++) {
        const today = new Date();
        const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilMonday + (i * 7));
        
        const zonedDate = toZonedTime(nextMonday, timezone);
        const dateStr = format(zonedDate, "yyyy-MM-dd");

        meetings.push({
          user_id: user.id,
          coach_id: user.id,
          item_type: "live_meeting",
          title: "Weekly Live Coaching Session",
          description: "Join Coach Rick for the weekly group coaching session",
          scheduled_date: dateStr,
          scheduled_time: "19:00:00",
          duration: 60,
          status: "scheduled",
          metadata: {
            zoom_link: zoomLink,
            zoom_password: zoomPassword || null,
            timezone: timezone,
          },
        });
      }

      const { error } = await supabase
        .from("calendar_items")
        .insert(meetings);

      if (error) throw error;

      toast.success(`Scheduled 8 weekly meetings. Athletes will automatically see them when added to your roster.`);
      setZoomLink("");
      setZoomPassword("");
      loadUpcomingMeetings();
    } catch (error: any) {
      console.error("Error scheduling meetings:", error);
      toast.error(error.message || "Failed to schedule meetings");
    } finally {
      setLoading(false);
    }
  };

  const sendReminderToAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get next scheduled meeting
      const { data: nextMeeting, error: meetingError } = await supabase
        .from("calendar_items")
        .select("*")
        .eq("item_type", "live_meeting")
        .eq("status", "scheduled")
        .eq("coach_id", user.id)
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (meetingError || !nextMeeting) {
        toast.error("No upcoming meetings found");
        return;
      }

      // Get all unique athletes who have this meeting
      const { data: athleteMeetings, error: athleteError } = await supabase
        .from("calendar_items")
        .select("user_id")
        .eq("scheduled_date", nextMeeting.scheduled_date)
        .eq("scheduled_time", nextMeeting.scheduled_time)
        .eq("coach_id", user.id)
        .neq("user_id", user.id); // Exclude coach

      if (athleteError) throw athleteError;

      const studentIds = athleteMeetings?.map(m => m.user_id) || [];

      if (studentIds.length === 0) {
        toast.error("No athletes have been assigned this meeting yet");
        return;
      }

      // Send notifications
      const metadata = nextMeeting.metadata as ScheduledMeeting['metadata'];
      const notifications = studentIds.map(studentId => ({
        user_id: studentId,
        type: "meeting_reminder",
        title: "Upcoming Zoom Meeting",
        message: reminderMessage || `Reminder: Live coaching session on ${nextMeeting.scheduled_date} at ${nextMeeting.scheduled_time}. ${metadata?.zoom_link || ''}`,
        is_read: false,
      }));

      const { error } = await supabase
        .from("notifications")
        .insert(notifications);

      if (error) throw error;

      toast.success(`Sent reminders to ${notifications.length} athletes`);
      setReminderMessage("");
    } catch (error: any) {
      console.error("Error sending reminders:", error);
      toast.error(error.message || "Failed to send reminders");
    } finally {
      setLoading(false);
    }
  };

  const cancelNextMeeting = async () => {
    if (!cancelMessage.trim()) {
      toast.error("Please enter a cancellation message");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get next scheduled meeting date
      const { data: nextMeetings, error: meetingError } = await supabase
        .from("calendar_items")
        .select("scheduled_date")
        .eq("item_type", "live_meeting")
        .eq("status", "scheduled")
        .eq("coach_id", user.id)
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .limit(1);

      if (meetingError || !nextMeetings || nextMeetings.length === 0) {
        toast.error("No upcoming meetings found");
        return;
      }

      const nextMeetingDate = nextMeetings[0].scheduled_date;

      // Cancel all meetings on that date for this coach
      const { error: updateError } = await supabase
        .from("calendar_items")
        .update({ status: "cancelled" })
        .eq("item_type", "live_meeting")
        .eq("scheduled_date", nextMeetingDate)
        .eq("coach_id", user.id)
        .eq("status", "scheduled");

      if (updateError) throw updateError;

      // Get all unique athletes affected by this cancellation
      const { data: affectedMeetings, error: affectedError } = await supabase
        .from("calendar_items")
        .select("user_id")
        .eq("scheduled_date", nextMeetingDate)
        .eq("coach_id", user.id)
        .eq("status", "cancelled")
        .neq("user_id", user.id); // Exclude coach

      if (affectedError) throw affectedError;

      const studentIds = affectedMeetings?.map(m => m.user_id) || [];

      // Send cancellation notifications if there are athletes
      if (studentIds.length > 0) {
        const notifications = studentIds.map(studentId => ({
          user_id: studentId,
          type: "meeting_cancelled",
          title: "Meeting Cancelled",
          message: cancelMessage,
          is_read: false,
        }));

        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (notifError) throw notifError;

        toast.success(`Cancelled meeting on ${nextMeetingDate} and notified ${studentIds.length} athletes`);
      } else {
        toast.success(`Cancelled meeting on ${nextMeetingDate}`);
      }
      
      setCancelMessage("");
      loadUpcomingMeetings();
    } catch (error: any) {
      console.error("Error cancelling meeting:", error);
      toast.error(error.message || "Failed to cancel meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar Management</h1>
          <p className="text-muted-foreground">Manage Zoom meetings and private sessions</p>
        </div>
      </div>


      <Tabs defaultValue="zoom" className="space-y-6">
        <TabsList>
          <TabsTrigger value="zoom">
            <Video className="h-4 w-4 mr-2" />
            Zoom Meetings
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Upcoming Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zoom" className="space-y-6">
          {/* Schedule Recurring Meetings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Recurring Zoom Meetings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Schedule group coaching sessions every Monday at 7:00 PM CST for the next 8 weeks. 
              When you add athletes to your roster, they'll automatically receive all future scheduled meetings.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="zoomLink">Zoom Link</Label>
                <Input
                  id="zoomLink"
                  placeholder="https://zoom.us/j/..."
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="zoomPassword">Zoom Password (Optional)</Label>
                <Input
                  id="zoomPassword"
                  placeholder="Meeting password"
                  value={zoomPassword}
                  onChange={(e) => setZoomPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button onClick={scheduleRecurringMeetings} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule 8 Weeks
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Send Reminder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Send Meeting Reminder</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Send a reminder notification to all students about the next scheduled meeting
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reminderMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="reminderMessage"
                  placeholder="Don't forget about tomorrow's live coaching session!"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>
              <Button onClick={sendReminderToAll} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder to All
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Cancel Meeting */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cancel Next Meeting</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cancel the next scheduled meeting and notify all students
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cancelMessage">Cancellation Message</Label>
                <Textarea
                  id="cancelMessage"
                  placeholder="This week's session is cancelled due to..."
                  value={cancelMessage}
                  onChange={(e) => setCancelMessage(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>
              <Button
                onClick={cancelNextMeeting}
                disabled={loading}
                variant="destructive"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel & Notify Students
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Scheduled Events</h3>
            {loadingMeetings ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming meetings scheduled
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingMeetings.slice(0, 10).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{meeting.title}</h4>
                        <Badge
                          variant={
                            meeting.status === "scheduled"
                              ? "default"
                              : meeting.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(meeting.scheduled_date), "EEEE, MMMM d, yyyy")} at{" "}
                        {meeting.scheduled_time}
                      </p>
                    </div>
                    {meeting.metadata?.zoom_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(meeting.metadata.zoom_link, "_blank")}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
