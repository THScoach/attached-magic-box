import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, addWeeks, addYears, subMonths, subWeeks, subYears, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfYear, endOfYear } from "date-fns";
import { useCalendarItems } from "@/hooks/useCalendarItems";
import { AddCalendarItemModal } from "./AddCalendarItemModal";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AthleteScheduleCalendarProps {
  playerId: string;
  userId: string;
  isCoachView?: boolean;
}

export function AthleteScheduleCalendar({ playerId, userId, isCoachView = false }: AthleteScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [coachId, setCoachId] = useState<string | null>(null);

  useEffect(() => {
    const getCoachId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCoachId(user.id);
      }
    };
    getCoachId();
  }, []);

  const getDateRange = () => {
    switch (view) {
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        };
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      case 'year':
        return {
          start: startOfYear(currentDate),
          end: endOfYear(currentDate)
        };
    }
  };

  const dateRange = getDateRange();
  const { items, loading, addItem, updateItem, reload } = useCalendarItems(userId, playerId, dateRange.start, dateRange.end);

  const navigate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'week':
        setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(direction === 'next' ? addYears(currentDate, 1) : subYears(currentDate, 1));
        break;
    }
  };

  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return items.filter(item => item.scheduled_date === dateStr);
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return (
      <div className="grid grid-cols-7 gap-px bg-border">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="bg-card p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dayItems = getItemsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "bg-card p-2 min-h-24 text-left hover:bg-accent transition-colors",
                !isCurrentMonth && "opacity-50",
                isSelected && "ring-2 ring-primary",
                isTodayDate && "bg-primary/5"
              )}
            >
              <div className={cn(
                "text-sm font-medium mb-1",
                isTodayDate && "text-primary font-bold"
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayItems.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    className="text-xs p-1 rounded truncate bg-primary/10 text-primary border-l-2 border-primary"
                  >
                    {item.title}
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayItems.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate) });
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayItems = getItemsForDate(day);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "border rounded-lg p-4 text-left hover:border-primary transition-colors",
                isSelected && "border-primary bg-primary/5",
                isTodayDate && "border-primary"
              )}
            >
              <div className={cn(
                "text-lg font-bold mb-2",
                isTodayDate && "text-primary"
              )}>
                {format(day, 'EEE d')}
              </div>
              <div className="space-y-2">
                {dayItems.map(item => (
                  <div
                    key={item.id}
                    className="text-sm p-2 rounded bg-primary/10 text-primary border-l-2 border-primary"
                  >
                    <div className="font-medium">{item.title}</div>
                    {item.scheduled_time && (
                      <div className="text-xs opacity-70">{item.scheduled_time}</div>
                    )}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const selectedDateItems = selectedDate ? getItemsForDate(selectedDate) : [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Schedule
            </CardTitle>
            {isCoachView && (
              <Button onClick={() => setAddModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold ml-2">
                {view === 'year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="program">Program</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="habit">Habit</SelectItem>
                  <SelectItem value="coaching">Coaching</SelectItem>
                </SelectContent>
              </Select>

              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Calendar View */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <>
              {view === 'month' && renderMonthView()}
              {view === 'week' && renderWeekView()}
              {view === 'year' && (
                <div className="text-center py-8 text-muted-foreground">Year view coming soon</div>
              )}
            </>
          )}

          {/* Selected Date Details */}
          {selectedDate && selectedDateItems.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedDateItems.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                          {item.scheduled_time && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.scheduled_time} {item.duration && `(${item.duration} min)`}
                            </p>
                          )}
                        </div>
                        <Badge variant={
                          item.status === 'completed' ? 'default' :
                          item.status === 'cancelled' ? 'destructive' :
                          'secondary'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <AddCalendarItemModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdd={addItem}
        userId={userId}
        playerId={playerId}
        coachId={coachId}
      />
    </>
  );
}
