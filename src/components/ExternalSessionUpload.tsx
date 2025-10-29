import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface ExternalSessionUploadProps {
  playerId: string;
  onUploadComplete?: () => void;
}

export function ExternalSessionUpload({ playerId, onUploadComplete }: ExternalSessionUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dataSource, setDataSource] = useState<string>("blast_motion");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a screenshot");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload screenshot to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${playerId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Extract data from screenshot using edge function
      const { data: extractedData, error: extractError } = await supabase.functions
        .invoke('extract-session-data', {
          body: { imageUrl: publicUrl, dataSource }
        });

      if (extractError) throw extractError;

      if (!extractedData?.success) {
        throw new Error('Failed to extract data from screenshot');
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('external_session_data' as any)
        .insert({
          user_id: user.id,
          player_id: playerId,
          data_source: dataSource,
          screenshot_url: publicUrl,
          extracted_metrics: extractedData.metrics,
          notes: notes || null
        });

      if (dbError) throw dbError;

      toast.success("Session data uploaded and extracted successfully");
      setSelectedFile(null);
      setNotes("");
      onUploadComplete?.();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload session data");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload External Session Data</CardTitle>
        <CardDescription>
          Upload screenshots from Blast Motion, HitTrax, Rapsodo, or other tracking systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="data-source">Data Source</Label>
          <Select value={dataSource} onValueChange={setDataSource}>
            <SelectTrigger id="data-source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blast_motion">Blast Motion</SelectItem>
              <SelectItem value="hittrax">HitTrax</SelectItem>
              <SelectItem value="rapsodo">Rapsodo</SelectItem>
              <SelectItem value="trackman">TrackMan</SelectItem>
              <SelectItem value="manual">Manual Entry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="screenshot">Screenshot</Label>
          <Input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes about this session..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={uploading}
          />
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Extract Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
