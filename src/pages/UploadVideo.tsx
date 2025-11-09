import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function UploadVideo() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [swingType, setSwingType] = useState<'practice' | 'drill' | 'game'>('practice');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      toast.error('File size must be under 500MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !playerId) {
      toast.error("Please select a video file");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      toast.loading('Uploading video...');

      // Upload video to storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      toast.dismiss();
      toast.loading('Analyzing video...');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Call analysis edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-swing', {
        body: { 
          videoUrl: publicUrl,
          playerId: playerId,
          swingType: swingType,
          notes: notes,
          fileName: fileName
        }
      });

      if (analysisError) throw analysisError;

      toast.dismiss();
      toast.success('Video analyzed successfully!');
      
      // Navigate to analysis result
      if (analysisData?.analysisId) {
        navigate(`/result/${analysisData.analysisId}`);
      } else {
        navigate(`/player/${playerId}`, { state: { tab: 'video' } });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload video', {
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
            <CardTitle>Upload Video</CardTitle>
            <CardDescription>
              Upload a swing video for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                240fps recommended (min 120fps). We'll do our best with any frame rate!
              </AlertDescription>
            </Alert>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Video File</Label>
              <div 
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
                onClick={() => document.getElementById('file')?.click()}
              >
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {file ? file.name : 'Click to upload video'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file 
                      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
                      : 'Drag and drop or click to select'
                    }
                  </p>
                </div>
                <Input
                  id="file"
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/webm"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
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
                placeholder="Add any notes about this swing..."
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
                  Analyzing...
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
