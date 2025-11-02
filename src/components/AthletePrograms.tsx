import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Target, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Program {
  id: string;
  focus_pillar: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface AthleteProgramsProps {
  playerId: string;
  userId: string;
}

export function AthletePrograms({ playerId, userId }: AthleteProgramsProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [focusPillar, setFocusPillar] = useState<string>('anchor');
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );

  useEffect(() => {
    loadPrograms();
  }, [userId, playerId]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Deduplicate: only show one program per pillar (most recent active one)
      const uniquePrograms = (data || []).reduce((acc, program) => {
        const existing = acc.find(p => p.focus_pillar === program.focus_pillar);
        if (!existing) {
          // Add first program for this pillar
          acc.push(program);
        } else if (program.is_active && !existing.is_active) {
          // Replace inactive with active program
          const index = acc.indexOf(existing);
          acc[index] = program;
        }
        return acc;
      }, [] as Program[]);
      
      setPrograms(uniquePrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProgram = async () => {
    try {
      setCreating(true);

      // We need an analysis_id, so we'll use a placeholder or the latest analysis
      const { data: latestAnalysis } = await supabase
        .from('swing_analyses')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestAnalysis) {
        toast.error('No analysis found. Upload a swing first.');
        return;
      }

      // Deactivate any existing active program with the same pillar
      const { error: deactivateError } = await supabase
        .from('training_programs')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('focus_pillar', focusPillar)
        .eq('is_active', true);

      if (deactivateError) throw deactivateError;

      // Create new active program
      const { error } = await supabase
        .from('training_programs')
        .insert({
          user_id: userId,
          analysis_id: latestAnalysis.id,
          focus_pillar: focusPillar,
          start_date: startDate,
          end_date: endDate,
          is_active: true
        });

      if (error) throw error;

      toast.success('Program assigned successfully');
      setShowCreateDialog(false);
      loadPrograms();
    } catch (error) {
      console.error('Error creating program:', error);
      toast.error('Failed to assign program');
    } finally {
      setCreating(false);
    }
  };

  const toggleProgramStatus = async (programId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('training_programs')
        .update({ is_active: !currentStatus })
        .eq('id', programId);

      if (error) throw error;

      toast.success(`Program ${currentStatus ? 'deactivated' : 'activated'}`);
      loadPrograms();
    } catch (error) {
      console.error('Error updating program:', error);
      toast.error('Failed to update program');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Training Programs
            </CardTitle>
            <Button onClick={() => setShowCreateDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Assign Program
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading programs...</p>
            ) : programs.length > 0 ? (
              <div className="space-y-3">
                {programs.map((program) => (
                  <Card key={program.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={program.is_active ? 'default' : 'secondary'}>
                              {program.focus_pillar}
                            </Badge>
                            {program.is_active && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(program.start_date), 'MMM d')} - {format(new Date(program.end_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProgramStatus(program.id, program.is_active)}
                        >
                          {program.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No programs assigned yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Program Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Training Program</DialogTitle>
            <DialogDescription>
              Create a new training program for this athlete
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pillar">Focus Pillar</Label>
              <Select value={focusPillar} onValueChange={setFocusPillar}>
                <SelectTrigger>
                  <SelectValue placeholder="Select focus pillar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anchor">Anchor</SelectItem>
                  <SelectItem value="engine">Engine</SelectItem>
                  <SelectItem value="whip">Whip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createProgram} disabled={creating}>
              {creating ? 'Creating...' : 'Assign Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
