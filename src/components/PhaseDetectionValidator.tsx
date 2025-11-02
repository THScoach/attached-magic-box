import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  validatePhaseDetection, 
  runEdgeCaseTests, 
  GROUND_TRUTH_PLAYERS,
  PhaseMarkers 
} from "@/lib/phaseDetectionTests";
import { CheckCircle2, XCircle, AlertTriangle, Play, FileText } from "lucide-react";

interface PhaseDetectionValidatorProps {
  loadStartTiming: number;
  fireStartTiming: number;
  pelvisTiming: number;
  tempoRatio: number;
}

export function PhaseDetectionValidator({
  loadStartTiming,
  fireStartTiming,
  pelvisTiming,
  tempoRatio
}: PhaseDetectionValidatorProps) {
  const [showReport, setShowReport] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(0); // Freeman by default

  const markers: PhaseMarkers = {
    loadStart: loadStartTiming,
    fireStart: fireStartTiming,
    contact: 0,
    pelvisPeak: pelvisTiming
  };

  const groundTruth = GROUND_TRUTH_PLAYERS[selectedPlayer];
  const validation = validatePhaseDetection(markers, groundTruth);
  const edgeCaseTests = runEdgeCaseTests();

  const getResultIcon = (passed: boolean, severity: string) => {
    if (passed) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (severity === 'critical') return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'critical') return <Badge variant="destructive">Critical</Badge>;
    if (severity === 'warning') return <Badge variant="secondary">Warning</Badge>;
    return <Badge variant="outline">Info</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Phase Detection Validation</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReport(!showReport)}
          >
            {showReport ? "Hide Report" : "Show Report"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Player Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Compare Against:</label>
          <div className="flex flex-wrap gap-2">
            {GROUND_TRUTH_PLAYERS.map((player, index) => (
              <Button
                key={player.name}
                variant={selectedPlayer === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlayer(index)}
              >
                {player.name}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {groundTruth.playerType} • Expected Tempo: {groundTruth.expectedTempo}:1
          </p>
        </div>

        {/* Overall Score */}
        <Alert className={validation.overallPass ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {validation.overallPass ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-semibold">
                  Validation {validation.overallPass ? "PASSED" : "FAILED"}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{validation.score}/100</div>
                <div className="text-xs text-muted-foreground">Accuracy Score</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Detected Values */}
        <div className="mt-4 grid grid-cols-2 gap-3 p-4 bg-muted rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">Detected Tempo</div>
            <div className="text-lg font-bold">{tempoRatio.toFixed(2)}:1</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Expected Range</div>
            <div className="text-lg font-bold">
              {groundTruth.tempoRange[0]}-{groundTruth.tempoRange[1]}:1
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Load Duration</div>
            <div className="text-lg font-bold">{loadStartTiming - fireStartTiming}ms</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Fire Duration</div>
            <div className="text-lg font-bold">{fireStartTiming}ms</div>
          </div>
        </div>

        {/* Detailed Test Results */}
        {showReport && (
          <div className="mt-6 space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Play className="h-4 w-4" />
                Validation Tests
              </h3>
              <div className="space-y-3">
                {validation.results.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getResultIcon(result.passed, result.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{result.testName}</span>
                        {getSeverityBadge(result.severity)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Expected: {result.expected}</div>
                        <div>Actual: {result.actual}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge Case Tests */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Edge Case Tests
              </h3>
              <div className="space-y-2">
                {edgeCaseTests.map((test, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-muted rounded">
                    {getResultIcon(test.passed, test.severity)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{test.testName}</div>
                      <div className="text-xs text-muted-foreground">{test.actual}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Citations */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Ground Truth Sources</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Welch et al. (1995) - MLB biomechanical benchmarks</p>
                <p>• Fortenbaugh (2011) - Phase timing and tempo ratios</p>
                <p>• Reboot Motion database - Elite player profiles</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
