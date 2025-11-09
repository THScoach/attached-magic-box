import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TempoDataSourceIndicatorProps {
  hitsTempoRatio: number;
  rebootTempoRatio?: number;
}

export function TempoDataSourceIndicator({ 
  hitsTempoRatio, 
  rebootTempoRatio 
}: TempoDataSourceIndicatorProps) {
  const hasComparison = rebootTempoRatio && Math.abs(hitsTempoRatio - rebootTempoRatio) > 0.3;
  const tempoDifference = hasComparison ? Math.abs(hitsTempoRatio - rebootTempoRatio) : 0;

  if (!hasComparison) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs bg-blue-50">
          📹 HITS Video Analysis
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs bg-blue-50">
          📹 HITS Video
        </Badge>
        <Badge variant="outline" className="text-xs bg-purple-50">
          📊 Reboot Sensors
        </Badge>
        <Badge variant="outline" className="text-xs bg-yellow-50">
          ⚠️ Different Sources
        </Badge>
      </div>

      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertDescription className="text-xs space-y-2">
          <p className="font-semibold text-yellow-900">
            Different Tempo Values Detected (Δ {tempoDifference.toFixed(2)})
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white rounded border border-yellow-300">
              <p className="text-xs text-muted-foreground">📹 HITS Video</p>
              <p className="text-xl font-bold text-blue-600">{hitsTempoRatio.toFixed(2)}:1</p>
            </div>
            <div className="p-2 bg-white rounded border border-yellow-300">
              <p className="text-xs text-muted-foreground">📊 Reboot Sensors</p>
              <p className="text-xl font-bold text-purple-600">{rebootTempoRatio?.toFixed(2)}:1</p>
            </div>
          </div>
          <p className="text-yellow-800">
            <strong>Why different?</strong> HITS uses video pose tracking; Reboot uses motion sensors. 
            Each system may define swing phases slightly differently. Both values are valid for their measurement approach.
          </p>
          <p className="text-yellow-800">
            💡 <strong>Tip:</strong> Use Reboot tempo for precise biomechanics. Use HITS tempo for overall swing timing patterns.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}