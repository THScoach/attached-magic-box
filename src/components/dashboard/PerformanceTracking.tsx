import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const tempoData = [
  { date: "Oct 21", score: 68 },
  { date: "Oct 23", score: 72 },
  { date: "Oct 25", score: 75 },
  { date: "Oct 27", score: 73 },
  { date: "Oct 29", score: 78 },
  { date: "Oct 31", score: 80 }
];

const velocityData = [
  { date: "Oct 21", mph: 82 },
  { date: "Oct 23", mph: 84 },
  { date: "Oct 25", mph: 85 },
  { date: "Oct 27", mph: 83 },
  { date: "Oct 29", mph: 87 },
  { date: "Oct 31", mph: 88 }
];

const getTrendIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export function PerformanceTracking() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Performance Tracking</h3>
      
      <Tabs defaultValue="tempo" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="tempo">Tempo</TabsTrigger>
          <TabsTrigger value="velocity">Exit Velo</TabsTrigger>
          <TabsTrigger value="anchor">Anchor</TabsTrigger>
        </TabsList>

        <TabsContent value="tempo" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Tempo Score</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-primary">80</p>
                {getTrendIcon(5)}
                <span className="text-sm text-green-500">+5 from last week</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempoData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--engine))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--engine))', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Peak Exit Velocity</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-primary">88 mph</p>
                {getTrendIcon(3)}
                <span className="text-sm text-green-500">+3 mph from last week</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="mph" 
                stroke="hsl(var(--whip))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--whip))', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="anchor" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <span className="font-medium">Hip Hinge Depth</span>
              <div className="flex items-center gap-2">
                <div className="text-primary font-bold">85%</div>
                {getTrendIcon(2)}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <span className="font-medium">Weight Distribution</span>
              <div className="flex items-center gap-2">
                <div className="text-primary font-bold">72%</div>
                {getTrendIcon(-1)}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <span className="font-medium">Load Position</span>
              <div className="flex items-center gap-2">
                <div className="text-primary font-bold">90%</div>
                {getTrendIcon(5)}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
