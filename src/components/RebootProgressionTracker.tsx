import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";

interface RebootProgressionTrackerProps {
  playerId: string;
  currentData?: any;
}

export function RebootProgressionTracker({ playerId, currentData }: RebootProgressionTrackerProps) {
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['reboot-progression', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_session_data')
        .select('*')
        .eq('player_id', playerId)
        .eq('data_source', 'reboot_motion')
        .order('session_date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading progression data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>Upload more Reboot reports to track improvements</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your first Reboot upload! Future uploads will show progress trends here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Parse metrics from historical data
  const progressionData = historicalData.map((session: any) => {
    const metrics = session.extracted_metrics || {};
    return {
      date: format(new Date(session.session_date), 'MMM dd'),
      fullDate: session.session_date,
      pelvisVelocity: metrics.kinematicSequence?.pelvis?.peakVelocity || 0,
      torsoVelocity: metrics.kinematicSequence?.torso?.peakVelocity || 0,
      comForward: metrics.centerOfMass?.maxForward || 0,
      xFactorSeparation: metrics.xFactor?.separation || 0,
      batVelocity: metrics.kinematicSequence?.bat?.peakVelocity || 0
    };
  });

  // Calculate trend
  const calculateTrend = (key: keyof typeof progressionData[0]) => {
    if (progressionData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = progressionData[progressionData.length - 1][key] as number;
    const previous = progressionData[progressionData.length - 2][key] as number;
    
    if (previous === 0) return { direction: 'stable', percentage: 0 };
    
    const change = ((recent - previous) / previous) * 100;
    
    if (Math.abs(change) < 2) return { direction: 'stable', percentage: 0 };
    return { 
      direction: change > 0 ? 'up' : 'down', 
      percentage: Math.abs(change) 
    };
  };

  const trends = {
    pelvisVelocity: calculateTrend('pelvisVelocity'),
    comForward: calculateTrend('comForward'),
    xFactorSeparation: calculateTrend('xFactorSeparation'),
    batVelocity: calculateTrend('batVelocity')
  };

  const TrendIcon = ({ direction }: { direction: string }) => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const TrendBadge = ({ trend, metric }: { trend: any, metric: string }) => {
    const isImprovement = 
      (metric === 'pelvisVelocity' || metric === 'xFactorSeparation' || metric === 'batVelocity') 
        ? trend.direction === 'up' 
        : trend.direction === 'stable';

    return (
      <div className="flex items-center gap-1">
        <TrendIcon direction={trend.direction} />
        {trend.percentage > 0 && (
          <span className={`text-xs font-medium ${
            isImprovement ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.percentage.toFixed(1)}%
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>
                Tracking {historicalData.length} session{historicalData.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Badge variant="outline">Trend Analysis</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Hip Velocity</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">
                  {progressionData[progressionData.length - 1].pelvisVelocity.toFixed(0)}°/s
                </p>
                <TrendBadge trend={trends.pelvisVelocity} metric="pelvisVelocity" />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">COM Forward</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">
                  {progressionData[progressionData.length - 1].comForward.toFixed(1)}%
                </p>
                <TrendBadge trend={trends.comForward} metric="comForward" />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">X-Factor</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">
                  {progressionData[progressionData.length - 1].xFactorSeparation.toFixed(1)}°
                </p>
                <TrendBadge trend={trends.xFactorSeparation} metric="xFactorSeparation" />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Bat Velocity</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">
                  {progressionData[progressionData.length - 1].batVelocity.toFixed(0)}°/s
                </p>
                <TrendBadge trend={trends.batVelocity} metric="batVelocity" />
              </div>
            </div>
          </div>

          {/* Trend Charts */}
          <div className="space-y-6">
            {/* Peak Velocities Chart */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Peak Velocities Over Time</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    label={{ value: '°/sec', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pelvisVelocity" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Hips"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="torsoVelocity" 
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Torso"
                    dot={{ fill: 'hsl(var(--chart-2))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="batVelocity" 
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="Bat"
                    dot={{ fill: 'hsl(var(--chart-3))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* COM & X-Factor Chart */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Weight Transfer & Coil</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="comForward" 
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    name="COM Forward %"
                    dot={{ fill: 'hsl(var(--chart-4))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="xFactorSeparation" 
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    name="X-Factor °"
                    dot={{ fill: 'hsl(var(--chart-5))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Improvement Summary */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-2">💡 Progress Insights</h4>
            <p className="text-sm text-muted-foreground">
              {progressionData.length < 3 
                ? "Keep uploading sessions to see detailed trend analysis. Aim for at least 3-4 sessions to track meaningful progress."
                : trends.pelvisVelocity.direction === 'up' && trends.xFactorSeparation.direction === 'up'
                  ? "Great progress! Your lower body is generating more power and your coil is improving."
                  : trends.pelvisVelocity.direction === 'down' || trends.batVelocity.direction === 'down'
                    ? "Recent session shows some regression. Review drills and maintain focus on fundamentals."
                    : "Consistency is key. Continue your current training program."
              }
            </p>
          </div>

          <p className="text-xs text-muted-foreground mt-4">Data Source: Reboot Motion Historical Analysis</p>
        </CardContent>
      </Card>
    </div>
  );
}
