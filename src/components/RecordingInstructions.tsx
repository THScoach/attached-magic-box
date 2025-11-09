import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Video, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RecordingInstructions() {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <CardTitle>How to Record at 240fps</CardTitle>
        </div>
        <CardDescription>
          High frame rate video ensures accurate tempo analysis. Baseball swings are fast (400-600ms), so we need 240fps for 4.17ms precision per frame.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* iPhone Instructions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <h3 className="font-semibold text-lg">iPhone</h3>
          </div>
          <ol className="list-decimal list-inside space-y-2 pl-4 text-sm">
            <li>Open the <strong>Camera</strong> app on your iPhone</li>
            <li>Swipe left or right to select <strong>"Slo-Mo"</strong> mode</li>
            <li>Position your camera to capture the full swing</li>
            <li>Tap the red record button and record your swing</li>
            <li>Tap stop when done</li>
            <li>Upload the video here (video will automatically be 240fps)</li>
          </ol>
          <Alert>
            <AlertDescription className="text-xs">
              💡 <strong>Tip:</strong> Most iPhones from iPhone 8 and newer support 240fps in Slo-Mo mode. Check your phone's camera settings if you don't see this option.
            </AlertDescription>
          </Alert>
        </div>

        {/* Android Instructions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Android</h3>
          </div>
          <ol className="list-decimal list-inside space-y-2 pl-4 text-sm">
            <li>Open your device's <strong>Camera</strong> app</li>
            <li>Look for <strong>"More"</strong> or <strong>"Video"</strong> modes</li>
            <li>Select <strong>"Slow motion"</strong> or <strong>"High FPS"</strong> mode</li>
            <li>Tap the <Settings className="h-3 w-3 inline" /> settings icon</li>
            <li>Choose <strong>"240fps"</strong> or highest available frame rate</li>
            <li>Record your swing</li>
            <li>Upload the video here</li>
          </ol>
          <Alert>
            <AlertDescription className="text-xs">
              💡 <strong>Tip:</strong> Settings vary by manufacturer (Samsung, Google Pixel, etc.). Look for "Video size" or "Frame rate" in your camera settings.
            </AlertDescription>
          </Alert>
        </div>

        {/* General Tips */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold">Recording Tips for Best Results:</h3>
          <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Use a tripod or stable surface - no handheld recording</li>
            <li>Record in good lighting (outdoor or well-lit indoor)</li>
            <li>Position camera perpendicular to swing path</li>
            <li>Capture full body from stance to follow-through</li>
            <li>Keep camera stationary - don't pan or move during swing</li>
            <li>Record at 1080p or higher resolution if available</li>
          </ul>
        </div>

        {/* Frame Rate Comparison */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="font-semibold text-sm">Why 240fps Matters:</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="font-semibold text-destructive">30fps</div>
              <div className="text-muted-foreground">33.3ms per frame</div>
              <div className="text-xs mt-1">❌ Too imprecise</div>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="font-semibold text-yellow-700 dark:text-yellow-500">120fps</div>
              <div className="text-muted-foreground">8.3ms per frame</div>
              <div className="text-xs mt-1">⚠️ Acceptable</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="font-semibold text-green-700 dark:text-green-500">240fps</div>
              <div className="text-muted-foreground">4.2ms per frame</div>
              <div className="text-xs mt-1">✅ Perfect!</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
