import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  scheduled_date: string;
  task_type: string;
  description: string | null;
  status: string;
}

interface AthleteScheduleCalendarProps {
  playerId: string;
  userId: string;
}

export function AthleteScheduleCalendar({ playerId, userId }: AthleteScheduleCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [playerId, date]);

  const loadSchedule = async () => {
    if (!date) return;

    try {
      setLoading(true);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('player_id', playerId)
        .gte('scheduled_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      const formattedEvents = (data || []).map((task: any) => ({
        id: task.id,
        title: task.task_type || 'Task',
        scheduled_date: task.scheduled_date,
        task_type: task.task_type,
        description: task.notes,
        status: task.status
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (targetDate: Date) => {
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    return events.filter(event => event.scheduled_date === dateStr);
  };

  const selectedDateEvents = date ? getEventsForDate(date) : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  hasEvent: (day) => getEventsForDate(day).length > 0
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: 'bold',
                    textDecoration: 'underline'
                  }
                }}
              />
            </div>

            {/* Events for Selected Date */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : selectedDateEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <Badge variant={
                            event.status === 'completed' ? 'default' :
                            event.status === 'late' ? 'destructive' :
                            'secondary'
                          }>
                            {event.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No events scheduled for this date
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
