import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

/**
 * GHL Booking Embed Placeholder Component
 * 
 * This component serves as a placeholder for the GoHighLevel calendar/booking embed.
 * To integrate:
 * 1. Get your calendar embed code from GoHighLevel
 * 2. Replace the placeholder content below with the iframe or script snippet
 * 3. Adjust styling as needed to match the design system
 * 
 * Example embed:
 * <iframe src="YOUR_GHL_CALENDAR_URL" width="100%" height="800" frameBorder="0"></iframe>
 */
export function GHLBookingEmbedPlaceholder() {
  return (
    <Card className="bg-black border-white/20">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Book Your Session</CardTitle>
        </div>
        <CardDescription>
          Schedule your in-person training with Coach Rick
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[600px] flex items-center justify-center bg-zinc-900 rounded-lg border-2 border-dashed border-white/10">
        <div className="text-center p-8 max-w-md">
          <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">GoHighLevel Calendar Embed</h3>
          <p className="text-gray-400 text-sm mb-4">
            This is a placeholder for the GoHighLevel calendar booking widget. Replace this component's content with your GHL calendar embed code.
          </p>
          <div className="bg-zinc-800 p-4 rounded text-left">
            <code className="text-xs text-green-400">
              {`<!-- TODO: Replace with GHL calendar embed -->`}
              <br />
              {`<iframe src="YOUR_GHL_CALENDAR_URL"...></iframe>`}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
