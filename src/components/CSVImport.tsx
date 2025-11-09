import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface CSVImportProps {
  playerId: string;
  importType: "ball" | "bat";
  onSuccess?: () => void;
}

// Validation schemas
const ballMetricsSchema = z.object({
  exit_velocity: z.number().min(0).max(150),
  launch_angle: z.number().min(-90).max(90).optional(),
  distance: z.number().min(0).max(600).optional(),
  hard_hit_percentage: z.number().min(0).max(100).optional(),
  line_drive_percentage: z.number().min(0).max(100).optional(),
  fly_ball_percentage: z.number().min(0).max(100).optional(),
  ground_ball_percentage: z.number().min(0).max(100).optional(),
});

const batMetricsSchema = z.object({
  bat_speed: z.number().min(0).max(150),
  time_in_zone: z.number().min(0).max(1000).optional(),
  attack_angle: z.number().min(-90).max(90).optional(),
});

export default function CSVImport({ playerId, importType, onSuccess }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(["Please upload a CSV file"]);
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrors(["File size must be less than 10MB"]);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    
    // Parse and preview CSV
    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setPreview(parsed.slice(0, 5)); // Show first 5 rows
    } catch (error) {
      setErrors(["Failed to parse CSV file"]);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        // Try to parse as number if possible
        row[header] = !isNaN(Number(value)) ? Number(value) : value;
      });
      
      data.push(row);
    }

    return data;
  };

  const mapCSVToBallMetrics = (row: any) => {
    // Map common CSV column names to our schema
    return {
      exit_velocity: row['exit_velocity'] || row['exit_velo'] || row['exitvelocity'] || row['ev'],
      launch_angle: row['launch_angle'] || row['launchangle'] || row['la'],
      distance: row['distance'] || row['dist'],
      hard_hit_percentage: row['hard_hit_percentage'] || row['hardhit%'],
      line_drive_percentage: row['line_drive_percentage'] || row['ld%'],
      fly_ball_percentage: row['fly_ball_percentage'] || row['fb%'],
      ground_ball_percentage: row['ground_ball_percentage'] || row['gb%'],
    };
  };

  const mapCSVToBatMetrics = (row: any) => {
    return {
      bat_speed: row['bat_speed'] || row['batspeed'] || row['speed'],
      time_in_zone: row['time_in_zone'] || row['timeinzone'] || row['tiz'],
      attack_angle: row['attack_angle'] || row['attackangle'] || row['aa'],
    };
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    const validationErrors: string[] = [];

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to import data");
        setLoading(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < rows.length; i++) {
        try {
          if (importType === "ball") {
            const mapped = mapCSVToBallMetrics(rows[i]);
            const validated = ballMetricsSchema.parse(mapped);

            const { error } = await supabase.from("ball_metrics").insert({
              user_id: user.id,
              player_id: playerId,
              exit_velocity: validated.exit_velocity,
              launch_angle_grade: validated.launch_angle || null,
              hard_hit_percentage: validated.hard_hit_percentage || null,
              line_drive_percentage: validated.line_drive_percentage || null,
              fly_ball_percentage: validated.fly_ball_percentage || null,
              ground_ball_percentage: validated.ground_ball_percentage || null,
            });

            if (error) throw error;
          } else {
            const mapped = mapCSVToBatMetrics(rows[i]);
            const validated = batMetricsSchema.parse(mapped);

            const { error } = await supabase.from("bat_metrics").insert({
              user_id: user.id,
              player_id: playerId,
              bat_speed: validated.bat_speed,
              time_in_zone: validated.time_in_zone || 0,
              attack_angle: validated.attack_angle || 0,
            });

            if (error) throw error;
          }

          successCount++;
        } catch (error: any) {
          errorCount++;
          validationErrors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} records`);
        onSuccess?.();
      }

      if (errorCount > 0) {
        setErrors(validationErrors.slice(0, 10)); // Show first 10 errors
        toast.error(`Failed to import ${errorCount} records`);
      }
    } catch (error: any) {
      toast.error("Failed to import CSV: " + error.message);
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  const getExpectedColumns = () => {
    if (importType === "ball") {
      return [
        { name: "exit_velocity", required: true, example: "92.5" },
        { name: "launch_angle", required: false, example: "15.2" },
        { name: "distance", required: false, example: "320" },
        { name: "hard_hit_percentage", required: false, example: "65.5" },
        { name: "line_drive_percentage", required: false, example: "25.0" },
        { name: "fly_ball_percentage", required: false, example: "45.0" },
        { name: "ground_ball_percentage", required: false, example: "30.0" },
      ];
    } else {
      return [
        { name: "bat_speed", required: true, example: "72.3" },
        { name: "time_in_zone", required: false, example: "87" },
        { name: "attack_angle", required: false, example: "15.5" },
      ];
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import {importType === "ball" ? "Ball Tracking" : "Bat Sensor"} Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                {file ? file.name : "Click to upload CSV file"}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB
              </p>
            </label>
          </div>

          {/* Expected Format */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3">Expected CSV Format:</h4>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Column Name</th>
                    <th className="text-left p-2">Required</th>
                    <th className="text-left p-2">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {getExpectedColumns().map((col) => (
                    <tr key={col.name} className="border-b">
                      <td className="p-2 font-mono">{col.name}</td>
                      <td className="p-2">
                        {col.required ? (
                          <span className="text-red-500">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground">{col.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Note: Column names are case-insensitive. Alternative names are supported (e.g., "exit_velo", "ev").
            </p>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Preview (first 5 rows)
              </h4>
              <div className="overflow-x-auto bg-muted/30 rounded-lg p-3">
                <pre className="text-xs">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, i) => (
                    <p key={i} className="text-xs">{error}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Import Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="flex-1"
            >
              {loading ? "Importing..." : "Import Data"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setPreview([]);
                setErrors([]);
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
