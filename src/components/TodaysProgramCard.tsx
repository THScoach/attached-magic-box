import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Calendar, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TodaysProgramCardProps {
  program: {
    id: string;
    focus_pillar: string;
    day_number: number;
    is_checked_in_today: boolean;
    drills_count: number;
  } | null;
}

export function TodaysProgramCard({ program }: TodaysProgramCardProps) {
  const navigate = useNavigate();

  if (!program) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Ready to Start?</h3>
            <p className="text-sm text-muted-foreground">Complete an analysis to get your training program</p>
          </div>
        </div>
        <Button className="w-full" onClick={() => navigate('/reboot-analysis')}>
          Start Analysis
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Today's Training</h3>
            <p className="text-sm text-muted-foreground">Day {program.day_number} of 28</p>
          </div>
        </div>
        {program.is_checked_in_today && (
          <div className="flex items-center gap-1 text-green-500 text-sm">
            <Check className="h-4 w-4" />
            <span>Done!</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Focus Area</span>
          <span className="font-bold text-primary">{program.focus_pillar}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Drills</span>
          <span className="font-medium">{program.drills_count} exercises</span>
        </div>
      </div>

      <Button 
        className="w-full mt-4" 
        onClick={() => navigate('/training')}
        variant={program.is_checked_in_today ? "outline" : "default"}
      >
        {program.is_checked_in_today ? "View Program" : "Start Training"}
      </Button>
    </Card>
  );
}
