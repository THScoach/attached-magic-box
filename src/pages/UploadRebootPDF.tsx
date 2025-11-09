import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";

export default function UploadRebootPDF() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [swingType, setSwingType] = useState<'practice' | 'drill' | 'game'>('practice');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a PDF file');
      return;
    }
    setFile(selectedFile || null);
  };

  const handleUpload = async () => {
    if (!file || !playerId) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    toast.loading('Processing Reboot Motion report...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload PDF to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/reboot-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('reboot-pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reboot-pdfs')
        .getPublicUrl(fileName);

      // Parse PDF using edge function
      const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-reboot-pdf', {
        body: { 
          pdfUrl: publicUrl,
          playerId: playerId,
          swingType: swingType,
          notes: notes
        }
      });

      if (parseError) throw parseError;

      toast.dismiss();
      toast.success('Reboot report uploaded successfully!');
      
      // Navigate to the player profile reboot tab
      navigate(`/player/${playerId}`, { state: { tab: 'reboot' } });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload report', {
        description: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/player/${playerId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Player
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Upload Reboot PDF</CardTitle>
            <CardDescription>
              Upload a Reboot Motion PDF report for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">PDF File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Swing Type */}
            <div className="space-y-2">
              <Label htmlFor="swing-type">Swing Type</Label>
              <Select value={swingType} onValueChange={(value: any) => setSwingType(value)} disabled={uploading}>
                <SelectTrigger id="swing-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="drill">Drill</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={uploading}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this analysis..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={uploading}
                rows={3}
              />
            </div>

            {/* Upload Button */}
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
