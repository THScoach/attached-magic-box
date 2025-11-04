import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Mail, Plus, Trash2 } from "lucide-react";
import { useReportSchedules } from "@/hooks/useReportSchedules";
import { format, addDays, addMonths } from "date-fns";

interface ReportScheduleManagerProps {
  userId: string;
  playerId?: string;
}

export function ReportScheduleManager({ userId, playerId }: ReportScheduleManagerProps) {
  const { schedules, createSchedule, updateSchedule, deleteSchedule } = useReportSchedules(userId);
  const [isOpen, setIsOpen] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [emailDelivery, setEmailDelivery] = useState(false);

  const handleCreateSchedule = async () => {
    const nextDate = frequency === 'weekly' 
      ? addDays(new Date(), 7) 
      : addMonths(new Date(), 1);

    await createSchedule({
      user_id: userId,
      player_id: playerId || null,
      frequency,
      next_generation_date: nextDate.toISOString(),
      is_active: true,
      email_delivery: emailDelivery
    });

    setIsOpen(false);
  };

  const toggleSchedule = async (id: string, currentStatus: boolean) => {
    await updateSchedule(id, { is_active: !currentStatus });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Report Schedules</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Report Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-delivery">Email Delivery</Label>
                <Switch
                  id="email-delivery"
                  checked={emailDelivery}
                  onCheckedChange={setEmailDelivery}
                />
              </div>

              <Button onClick={handleCreateSchedule} className="w-full">
                Create Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {schedules.length === 0 ? (
          <Card className="p-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No scheduled reports yet</p>
            <Button variant="outline" onClick={() => setIsOpen(true)}>
              Create Your First Schedule
            </Button>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${schedule.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Clock className={`h-5 w-5 ${schedule.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium capitalize">{schedule.frequency} Report</p>
                    <p className="text-sm text-muted-foreground">
                      Next: {format(new Date(schedule.next_generation_date), 'MMM d, yyyy')}
                    </p>
                    {schedule.email_delivery && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        Email enabled
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={schedule.is_active}
                    onCheckedChange={() => toggleSchedule(schedule.id, schedule.is_active)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}