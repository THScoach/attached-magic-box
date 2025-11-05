import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getPlatformInfo, SensorPlatform } from "@/lib/sensorIntegration";

interface SensorIntegrationStatusProps {
  connectedPlatforms: SensorPlatform[];
  availablePlatforms: SensorPlatform[];
}

export function SensorIntegrationStatus({ 
  connectedPlatforms, 
  availablePlatforms 
}: SensorIntegrationStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensor Integrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availablePlatforms.map((platform) => {
            const info = getPlatformInfo(platform);
            const isConnected = connectedPlatforms.includes(platform);

            return (
              <div
                key={platform}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <p className="font-medium">{info.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isConnected ? 'Connected' : 'Available'}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Not Connected
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
