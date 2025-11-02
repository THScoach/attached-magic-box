import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, TrendingUp, Database, Upload, Plus, Target, Calendar, CheckCircle2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExternalData {
  id: string;
  data_source: string;
  session_date: string;
  extracted_metrics: any;
}

interface Program {
  id: string;
  focus_pillar: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface AthleteItemsProps {
  playerId: string;
  userId: string;
}

export function AthleteItems({ playerId, userId }: AthleteItemsProps) {
  const [externalData, setExternalData] = useState<ExternalData[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  
  // Program form state
  const [focusPillar, setFocusPillar] = useState<string>('anchor');
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );

  useEffect(() => {
    loadExternalData();
    loadPrograms();
  }, [playerId, userId]);

  const loadExternalData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('external_session_data')
        .select('*')
        .eq('player_id', playerId)
        .eq('user_id', userId)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExternalData(data || []);
    } catch (error) {
      console.error('Error loading external data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!dataSource) {
      toast.error('Please enter data source');
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${playerId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('session_data')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('session_data')
        .getPublicUrl(fileName);

      // Call edge function to process
      const { error: processError } = await supabase.functions.invoke('extract-session-data', {
        body: {
          file_url: publicUrl,
          data_source: dataSource,
          player_id: playerId,
          user_id: userId
        }
      });

      if (processError) throw processError;

      toast.success('File uploaded successfully');
      setShowUploadDialog(false);
      setFile(null);
      setDataSource('');
      loadExternalData();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const createProgram = async () => {
    try {
      setCreating(true);

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
      setShowProgramDialog(false);
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

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('trackman') || lowerSource.includes('rapsodo') || 
        lowerSource.includes('blast') || lowerSource.includes('hittrax')) {
      return <Database className="h-4 w-4" />;
    }
    return <Wrench className="h-4 w-4" />;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Training Programs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Training Programs
            </CardTitle>
            <Button onClick={() => setShowProgramDialog(true)} size="sm">
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

        {/* Equipment & Tools Data */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Equipment & Tools Data
            </CardTitle>
            <Button onClick={() => setShowUploadDialog(true)} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Report
            </Button>
          </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading data...</p>
          ) : externalData.length > 0 ? (
            <div className="space-y-3">
              {externalData.map((data) => (
                <Card key={data.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(data.data_source)}
                          <Badge variant="secondary">{data.data_source}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(data.session_date).toLocaleDateString()}
                        </p>
                        {data.extracted_metrics && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(data.extracted_metrics).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No equipment data uploaded yet</p>
              <p className="text-xs mt-1">Data from TrackMan, Rapsodo, Blast, HitTrax will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Upload Dialog */}
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Equipment Data</DialogTitle>
          <DialogDescription>
            Upload data files from TrackMan, Rapsodo, Blast, HitTrax, etc.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TrackMan">TrackMan</SelectItem>
                <SelectItem value="Rapsodo">Rapsodo</SelectItem>
                <SelectItem value="Blast Motion">Blast Motion</SelectItem>
                <SelectItem value="HitTrax">HitTrax</SelectItem>
                <SelectItem value="Diamond Kinetics">Diamond Kinetics</SelectItem>
                <SelectItem value="4D Motion">4D Motion</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: CSV, PDF, Images
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleFileUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Assign Program Dialog */}
    <Dialog open={showProgramDialog} onOpenChange={setShowProgramDialog}>
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
          <Button variant="outline" onClick={() => setShowProgramDialog(false)}>
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
