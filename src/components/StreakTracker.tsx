import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDays?: string[]; // ISO date strings of last 30 days
}

export function StreakTracker({ 
  currentStreak, 
  longestStreak,
  lastPracticeDays = [
    '2024-10-20', '2024-10-21', '2024-10-22', '2024-10-23', '2024-10-24', // 5 day current streak
    '2024-10-18', '2024-10-17', '2024-10-16', '2024-10-15', // some gaps
    '2024-10-10', '2024-10-09', '2024-10-08',
  ]
}: StreakTrackerProps) {
  // Generate last 28 days (4 weeks)
  const generateCalendar = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const isPracticeDay = lastPracticeDays.includes(dateString);
      const isToday = i === 0;
      
      days.push({
        date: dateString,
        day: date.getDate(),
        practiced: isPracticeDay,
        isToday,
      });
    }
    
    return days;
  };

  const calendar = generateCalendar();
  const fireEmojis = Math.min(Math.floor(currentStreak / 3), 10); // Max 10 fire emojis

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5" />
        <h3 className="text-xl font-bold">Practice Streak</h3>
      </div>

      {/* Current Streak Display */}
      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-primary mb-2">
          {currentStreak}
        </div>
        <div className="text-sm text-muted-foreground mb-3">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </div>
        
        {/* Fire Emojis */}
        <div className="flex justify-center items-center gap-1 mb-4">
          {Array.from({ length: fireEmojis }).map((_, i) => (
            <span 
              key={i} 
              className="text-2xl animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              🔥
            </span>
          ))}
          {fireEmojis === 0 && (
            <span className="text-muted-foreground text-sm">Keep practicing to build your streak!</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">Current Streak</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <div className="text-2xl font-bold text-amber-500">{longestStreak}</div>
          <div className="text-xs text-muted-foreground">Longest Streak</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        <div className="text-sm font-semibold mb-3">Last 28 Days</div>
        <div className="grid grid-cols-7 gap-2">
          {calendar.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-all duration-200 ${
                day.practiced
                  ? 'bg-green-500 text-white font-bold shadow-md'
                  : 'bg-muted/30 text-muted-foreground'
              } ${
                day.isToday ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              title={day.date}
            >
              <div className="text-xs">{day.day}</div>
              {day.practiced && <div className="text-xs">✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Practiced</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-muted/30"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-muted/30 ring-2 ring-primary"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Motivation */}
      {currentStreak >= 7 && (
        <div className="mt-4 p-3 bg-green-500/10 rounded-lg text-center">
          <div className="text-sm font-bold text-green-500">
            🔥 You're on fire! Keep it up!
          </div>
        </div>
      )}
      {currentStreak === 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-center">
          <div className="text-sm font-bold text-blue-500">
            💪 Start your streak today!
          </div>
        </div>
      )}
    </Card>
  );
}
