import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";

interface MetricTrendChartProps {
  title: string;
  data: Array<{
    date: string;
    value: number;
    grade?: number;
  }>;
  metricName: string;
  color?: string;
  unit?: string;
}

export function MetricTrendChart({ 
  title, 
  data, 
  metricName, 
  color = "hsl(var(--primary))",
  unit = ""
}: MetricTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available yet. Complete more swings to see trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTrend = () => {
    if (data.length < 2) return { icon: Minus, change: 0, label: "Not enough data" };
    
    const recent = data.slice(-5);
    const older = data.slice(-10, -5);
    
    if (older.length === 0) return { icon: Minus, change: 0, label: "Not enough data" };
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 2) return { icon: TrendingUp, change, label: "Improving", color: "text-success" };
    if (change < -2) return { icon: TrendingDown, change, label: "Declining", color: "text-destructive" };
    return { icon: Minus, change, label: "Stable", color: "text-muted-foreground" };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;
  
  const chartData = data.map(d => ({
    ...d,
    displayDate: format(new Date(d.date), "MMM d"),
  }));

  const latestValue = data[data.length - 1]?.value || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <TrendIcon className={`h-4 w-4 ${trend.color}`} />
            <span className={`text-sm font-medium ${trend.color}`}>
              {Math.abs(trend.change).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{latestValue.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="displayDate" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
