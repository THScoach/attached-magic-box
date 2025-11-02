import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, LayoutGrid, FileText, RotateCw, Clock, Activity, FileCheck, Wrench, MessageSquare, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ITEM_TYPES = [
  { type: 'program', label: 'Program', icon: LayoutGrid, color: 'bg-teal-500' },
  { type: 'assessment', label: 'Assessment', icon: FileText, color: 'bg-gray-500' },
  { type: 'habit', label: 'Habit', icon: RotateCw, color: 'bg-sky-500' },
  { type: 'coaching', label: 'Coaching', icon: Clock, color: 'bg-yellow-500' },
  { type: 'tracking', label: 'Tracking', icon: Activity, color: 'bg-indigo-500' },
  { type: 'form', label: 'Form / Questionnaire', icon: FileCheck, color: 'bg-teal-600' },
  { type: 'tools', label: 'Tools', icon: Wrench, color: 'bg-gray-400' },
  { type: 'communication', label: 'Communications', icon: MessageSquare, color: 'bg-gray-800' },
  { type: 'event', label: 'Scheduled Event', icon: CalendarDays, color: 'bg-rose-400' },
] as const;

interface AddCalendarItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: any) => Promise<void>;
  userId: string;
  playerId?: string | null;
  coachId?: string | null;
}

export function AddCalendarItemModal({ open, onOpenChange, onAdd, userId, playerId, coachId }: AddCalendarItemModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [submitting, setSubmitting] = useState(false);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setStep('details');
  };

  const handleBack = () => {
    setStep('type');
    setSelectedType(null);
  };

  const handleSubmit = async () => {
    if (!selectedType || !title || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        user_id: userId,
        player_id: playerId || null,
        coach_id: coachId || null,
        item_type: selectedType,
        title,
        description: description || null,
        scheduled_date: format(date, 'yyyy-MM-dd'),
        scheduled_time: time || null,
        duration: duration ? parseInt(duration) : null,
        status: 'scheduled',
        metadata: {}
      });

      toast.success('Calendar item added successfully');
      onOpenChange(false);
      // Reset form
      setStep('type');
      setSelectedType(null);
      setTitle('');
      setDescription('');
      setDate(new Date());
      setTime('09:00');
      setDuration('60');
    } catch (error) {
      toast.error('Failed to add calendar item');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTypeInfo = ITEM_TYPES.find(t => t.type === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{step === 'type' ? 'Add' : `Add ${selectedTypeInfo?.label}`}</DialogTitle>
        </DialogHeader>

        {step === 'type' ? (
          <div className="grid grid-cols-3 gap-4 py-4">
            {ITEM_TYPES.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border hover:border-primary transition-colors"
              >
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white", color)}>
                  <Icon className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-center">{label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
