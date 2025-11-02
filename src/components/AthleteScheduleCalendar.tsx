import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month' | 'year' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const getCoachId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCoachId(user.id);
      }
    };
    getCoachId();
  }, []);

  const dateRange = useMemo(() => {
    switch (view) {
      case 'day':
        return {
          start: selectedDate || currentDate,
          end: selectedDate || currentDate
        };
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
  }, [view, currentDate, selectedDate]);

  const { items, loading, addItem, updateItem, reload } = useCalendarItems(userId, playerId, dateRange.start, dateRange.end);

  useEffect(() => {
    loadPrograms();
    loadAnalyses();
  }, [userId, playerId, dateRange]);

  const loadPrograms = async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('player_id', playerId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
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
    let allItems: any[] = [];
    
    // Calendar items
    if (filterType === 'all' || !['program', 'analysis'].includes(filterType)) {
      const calendarItems = items.filter(item => item.scheduled_date === dateStr);
      allItems = [...allItems, ...calendarItems];
    }
    
    // Programs
    if (filterType === 'all' || filterType === 'program') {
      const programsForDate = programs.filter(program => {
        const start = new Date(program.start_date);
        const end = new Date(program.end_date);
        return date >= start && date <= end;
      });

      const programItems = programsForDate.map(program => ({
        ...program,
        id: `program-${program.id}`,
        title: `${program.focus_pillar} Program`,
        item_type: 'program',
        scheduled_date: dateStr
      }));
      
      allItems = [...allItems, ...programItems];
    }

    // Analyses
    if (filterType === 'all' || filterType === 'analysis') {
      const analysesForDate = analyses.filter(analysis => {
        const analysisDate = format(new Date(analysis.created_at), 'yyyy-MM-dd');
        return analysisDate === dateStr;
      });

      const analysisItems = analysesForDate.map(analysis => ({
        ...analysis,
        id: `analysis-${analysis.id}`,
        title: `Swing Analysis`,
        description: `H.I.T.S: ${analysis.overall_score.toFixed(0)} • ${analysis.video_type}`,
        item_type: 'analysis',
        scheduled_date: dateStr,
        status: 'completed'
      }));
      
      allItems = [...allItems, ...analysisItems];
    }

    return allItems;
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
              onClick={(e) => {
                e.preventDefault();
                console.log('Day clicked:', day, 'Items:', dayItems);
                setSelectedDate(day);
                setView('day');
              }}
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
              onClick={(e) => {
                e.preventDefault();
                console.log('Week day clicked:', day);
                setSelectedDate(day);
                setView('day');
              }}
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

  const renderDayView = () => {
    if (!selectedDate) return null;
    
    const dayItems = getItemsForDate(selectedDate);
    const isTodayDate = isToday(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "text-2xl font-bold",
            isTodayDate && "text-primary"
          )}>
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        {dayItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No activities scheduled for this day
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayItems.map((item) => (
              <Card 
                key={item.id}
                className={cn(
                  item.item_type === 'analysis' && "cursor-pointer hover:shadow-md transition-all"
                )}
                onClick={() => {
                  if (item.item_type === 'analysis') {
                    const analysisId = item.id.replace('analysis-', '');
                    navigate(`/player/${playerId}/analysis/${analysisId}`);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{item.title}</h4>
                        <Badge variant={
                          item.item_type === 'analysis' ? 'default' :
                          item.item_type === 'program' ? 'secondary' :
                          item.status === 'completed' ? 'default' :
                          item.status === 'cancelled' ? 'destructive' :
                          'secondary'
                        }>
                          {item.item_type === 'analysis' ? 'Analysis' :
                           item.item_type === 'program' ? 'Program' :
                           item.status || item.item_type}
                        </Badge>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                      )}
                      
                      {item.scheduled_time && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Time:</span> {item.scheduled_time}
                          {item.duration && ` (${item.duration} min)`}
                        </p>
                      )}
                      
                      {item.item_type === 'analysis' && (
                        <Badge variant="outline" className="mt-2">Click to view details</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
              <Button variant="outline" size="sm" onClick={() => {
                setCurrentDate(new Date());
                setView('month');
              }}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateCalendar('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateCalendar('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold ml-2">
                {view === 'day' && selectedDate 
                  ? format(selectedDate, 'MMMM d, yyyy')
                  : view === 'year' 
                  ? format(currentDate, 'yyyy') 
                  : format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="program">Program</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="habit">Habit</SelectItem>
                  <SelectItem value="coaching">Coaching</SelectItem>
                </SelectContent>
              </Select>

              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Calendar View */}
          {loading || dataLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <>
              {view === 'day' && renderDayView()}
              {view === 'month' && renderMonthView()}
              {view === 'week' && renderWeekView()}
            </>
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
