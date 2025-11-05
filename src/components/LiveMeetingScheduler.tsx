import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Video, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LiveMeetingSchedulerProps {
  userId: string;
  coachId?: string;
}

export function LiveMeetingScheduler({ userId, coachId }: LiveMeetingSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [meetingTime, setMeetingTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const scheduleMeeting = async () => {
    if (!selectedDate || !meetingTime || !title) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Create calendar item for the meeting
      const { error } = await supabase.from('calendar_items').insert({
        user_id: userId,
        coach_id: coachId,
        item_type: 'live_meeting',
        title,
        description,
        scheduled_date: selectedDate.toISOString().split('T')[0],
        scheduled_time: meetingTime,
        duration,
        status: 'scheduled',
        metadata: {
          meetingType: 'video_call',
          platform: 'zoom', // or other video platform
        },
      });

      if (error) throw error;

      toast.success('Live meeting scheduled successfully!');
      
      // Reset form
      setSelectedDate(undefined);
      setMeetingTime('');
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Schedule Live Meeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Meeting Title</Label>
          <Input
            id="title"
            placeholder="e.g., Weekly Check-in, Swing Review Session"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time">
              <Clock className="h-4 w-4 inline mr-1" />
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min={15}
              max={120}
              step={15}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Add meeting agenda or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          className="w-full"
          onClick={scheduleMeeting}
          disabled={loading || !selectedDate || !meetingTime || !title}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Meeting will include:</p>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span>HD video call</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Screen sharing capabilities</span>
            </li>
            <li className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Calendar reminders</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
