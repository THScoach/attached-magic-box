import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";
import { useUserGoals } from "@/hooks/useUserGoals";

interface GoalSettingModalProps {
  playerId?: string;
}

const metricOptions = {
  bat: [
    { name: "Bat Speed", unit: "mph" },
    { name: "Attack Angle", unit: "°" },
    { name: "Time In Zone", unit: "s" },
  ],
  body: [
    { name: "Sequence Efficiency", unit: "%" },
    { name: "Tempo Ratio", unit: ":1" },
    { name: "Power Distribution", unit: "%" },
  ],
  ball: [
    { name: "Exit Velocity", unit: "mph" },
    { name: "Hard Hit Percentage", unit: "%" },
    { name: "Launch Angle", unit: "°" },
  ],
  brain: [
    { name: "Reaction Time", unit: "ms" },
    { name: "Swing Decision", unit: "%" },
    { name: "Focus Score", unit: "%" },
  ],
};

export function GoalSettingModal({ playerId }: GoalSettingModalProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<'bat' | 'body' | 'ball' | 'brain'>('bat');
  const [metricName, setMetricName] = useState("");
  const [unit, setUnit] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");

  const { createGoal } = useUserGoals(playerId);

  const handleMetricChange = (value: string) => {
    setMetricName(value);
    const metric = metricOptions[category].find(m => m.name === value);
    if (metric) {
      setUnit(metric.unit);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createGoal({
      player_id: playerId || null,
      metric_name: metricName,
      metric_category: category,
      current_value: parseFloat(currentValue),
      target_value: parseFloat(targetValue),
      unit,
      deadline: deadline || null,
    });

    setOpen(false);
    // Reset form
    setMetricName("");
    setCurrentValue("");
    setTargetValue("");
    setDeadline("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Target className="mr-2 h-4 w-4" />
          Set New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set a New Goal</DialogTitle>
          <DialogDescription>
            Choose a metric and set your target. We'll track your progress!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bat">🏏 Bat</SelectItem>
                <SelectItem value="body">💪 Body</SelectItem>
                <SelectItem value="ball">⚾ Ball</SelectItem>
                <SelectItem value="brain">🧠 Brain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Metric</Label>
            <Select value={metricName} onValueChange={handleMetricChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions[category].map((metric) => (
                  <SelectItem key={metric.name} value={metric.name}>
                    {metric.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Value</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  required
                />
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Value</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  required
                />
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deadline (Optional)</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Create Goal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
