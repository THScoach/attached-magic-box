import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConsistencyScoreCardProps {
  exitVeloStdDev: number;
  avgExitVelo: number;
  launchAngleStdDev: number;
  avgLaunchAngle: number;
}

export function ConsistencyScoreCard({
  exitVeloStdDev,
  avgExitVelo,
  launchAngleStdDev,
  avgLaunchAngle,
}: ConsistencyScoreCardProps) {
  const getExitVeloGrade = (stdDev: number) => {
    if (stdDev < 5) return { grade: 'A+', variant: 'default' as const, color: 'text-success' };
    if (stdDev < 8) return { grade: 'B', variant: 'default' as const, color: 'text-primary' };
    return { grade: 'C', variant: 'destructive' as const, color: 'text-destructive' };
  };

  const getLaunchAngleGrade = (stdDev: number) => {
    if (stdDev < 10) return { grade: 'A+', variant: 'default' as const, color: 'text-success' };
    if (stdDev < 15) return { grade: 'B', variant: 'default' as const, color: 'text-primary' };
    return { grade: 'C', variant: 'destructive' as const, color: 'text-destructive' };
  };

  const evGrade = getExitVeloGrade(exitVeloStdDev);
  const laGrade = getLaunchAngleGrade(launchAngleStdDev);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl">Consistency Score</CardTitle>
        <p className="text-sm text-muted-foreground">
          How repeatable is your swing? Lower standard deviation = more consistent.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exit Velo Consistency */}
          <Card className="bg-muted/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Exit Velo Consistency</h3>
                <Badge variant={evGrade.variant}>
                  {evGrade.grade}
                </Badge>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-5xl font-bold">±{exitVeloStdDev.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground mt-2">mph standard deviation</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average EV:</span>
                  <span className="font-semibold">{avgExitVelo.toFixed(1)} mph</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Typical Range:</span>
                  <span className="font-semibold">
                    {(avgExitVelo - exitVeloStdDev).toFixed(1)} - {(avgExitVelo + exitVeloStdDev).toFixed(1)} mph
                  </span>
                </div>
              </div>
              
              {exitVeloStdDev < 5 && (
                <Alert className="mt-4 border-success bg-success/10">
                  <AlertTitle>⚡ Elite Consistency!</AlertTitle>
                  <AlertDescription>
                    Your exit velocity is very consistent. You're generating similar bat speed on every swing!
                  </AlertDescription>
                </Alert>
              )}
              
              {exitVeloStdDev > 8 && (
                <Alert className="mt-4 border-destructive bg-destructive/10">
                  <AlertTitle>⚠️ Work on Consistency</AlertTitle>
                  <AlertDescription>
                    Your exit velocity varies too much. Focus on consistent bat speed and contact quality.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          {/* Launch Angle Consistency */}
          <Card className="bg-muted/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Launch Angle Consistency</h3>
                <Badge variant={laGrade.variant}>
                  {laGrade.grade}
                </Badge>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-5xl font-bold">±{launchAngleStdDev.toFixed(1)}°</p>
                <p className="text-sm text-muted-foreground mt-2">degree standard deviation</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average LA:</span>
                  <span className="font-semibold">{avgLaunchAngle.toFixed(1)}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Typical Range:</span>
                  <span className="font-semibold">
                    {(avgLaunchAngle - launchAngleStdDev).toFixed(1)}° - {(avgLaunchAngle + launchAngleStdDev).toFixed(1)}°
                  </span>
                </div>
              </div>
              
              {launchAngleStdDev < 10 && (
                <Alert className="mt-4 border-success bg-success/10">
                  <AlertTitle>⚡ Elite Consistency!</AlertTitle>
                  <AlertDescription>
                    Your launch angles are very consistent. You have a repeatable swing path!
                  </AlertDescription>
                </Alert>
              )}
              
              {launchAngleStdDev > 15 && (
                <Alert className="mt-4 border-destructive bg-destructive/10">
                  <AlertTitle>⚠️ Work on Swing Path</AlertTitle>
                  <AlertDescription>
                    Your launch angles vary too much. Focus on a consistent swing path and attack angle.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
