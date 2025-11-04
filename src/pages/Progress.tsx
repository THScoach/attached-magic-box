import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { BatMetricsView } from "@/components/BatMetricsView";
import { BodyMetricsView } from "@/components/BodyMetricsView";
import { BallMetricsView } from "@/components/BallMetricsView";
import { calculateGrade } from "@/lib/gradingSystem";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Progress() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'overview';

  // Sample data for BAT metrics
  const sampleBatMetrics = {
    batSpeed: 72,
    attackAngle: 12,
    timeInZone: 0.15,
    level: 'highSchool',
    batSpeedGrade: calculateGrade(75),
    attackAngleGrade: calculateGrade(90),
    timeInZoneGrade: calculateGrade(85),
    personalBest: 74,
    lastWeekSpeed: 69,
  };

  // Sample data for BODY metrics
  const sampleBodyMetrics = {
    legsPeakVelocity: 700,
    corePeakVelocity: 900,
    armsPeakVelocity: 1050,
    batPeakVelocity: 2400,
    sequenceEfficiency: 87,
    sequenceGrade: calculateGrade(87),
    legsPower: 65,
    corePower: 25,
    armsPower: 10,
    powerGrade: calculateGrade(82),
    loadTime: 0.35,
    launchTime: 0.20,
    tempoRatio: 1.75,
    tempoGrade: calculateGrade(90),
    isCorrectSequence: true,
  };

  // Sample data for BALL metrics
  const sampleBallMetrics = {
    exitVelocity: 92,
    level: 'highSchool',
    exitVelocityGrade: calculateGrade(92),
    exitVelocityImprovement: 5,
    flyBallPercentage: 35,
    lineDrivePercentage: 50,
    groundBallPercentage: 15,
    launchAngleGrade: calculateGrade(95),
    hardHitPercentage: 65,
    totalSwings: 20,
    hardHitCount: 13,
    hardHitGrade: calculateGrade(95),
  };

  // Mock progress data
  const progressData = [
    { date: 'Oct 1', hits: 68, anchor: 75, engine: 65, whip: 64 },
    { date: 'Oct 5', hits: 70, anchor: 78, engine: 67, whip: 66 },
    { date: 'Oct 10', hits: 72, anchor: 80, engine: 68, whip: 68 },
    { date: 'Oct 15', hits: 71, anchor: 79, engine: 69, whip: 66 },
    { date: 'Oct 20', hits: 74, anchor: 83, engine: 71, whip: 68 },
    { date: 'Oct 25', hits: 75, anchor: 85, engine: 72, whip: 68 },
  ];

  const stats = {
    totalSwings: 47,
    avgHitsScore: 75,
    improvement: 7,
    bestPillar: 'ANCHOR',
    focusArea: 'ENGINE'
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your improvement over time
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Tabs defaultValue={initialCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bat">🏏</TabsTrigger>
            <TabsTrigger value="body">💪</TabsTrigger>
            <TabsTrigger value="ball">⚾</TabsTrigger>
            <TabsTrigger value="brain">🧠</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Swings</p>
            <p className="text-3xl font-bold">{stats.totalSwings}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg H.I.T.S.</p>
            <p className="text-3xl font-bold text-primary">{stats.avgHitsScore}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Improvement</p>
            <p className="text-3xl font-bold text-green-500">+{stats.improvement}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Focus Area</p>
            <p className="text-xl font-bold text-engine">{stats.focusArea}</p>
          </Card>
        </div>

        {/* Trend Chart */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Score Trends</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">7D</Button>
              <Button size="sm" variant="default">30D</Button>
              <Button size="sm" variant="outline">90D</Button>
              <Button size="sm" variant="outline">All</Button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" domain={[50, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="hits" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="H.I.T.S. Score"
              />
              <Line 
                type="monotone" 
                dataKey="anchor" 
                stroke="hsl(var(--anchor))" 
                strokeWidth={2}
                name="ANCHOR"
              />
              <Line 
                type="monotone" 
                dataKey="engine" 
                stroke="hsl(var(--engine))" 
                strokeWidth={2}
                name="ENGINE"
              />
              <Line 
                type="monotone" 
                dataKey="whip" 
                stroke="hsl(var(--whip))" 
                strokeWidth={2}
                name="WHIP"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Insights */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-bold mb-3">Key Insights</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <p className="text-sm">
                Your <span className="font-bold text-anchor">ANCHOR</span> score has improved by 10 points this month!
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">→</span>
              <p className="text-sm">
                <span className="font-bold text-whip">WHIP</span> has plateaued. Try the recommended drills to break through.
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">↗</span>
              <p className="text-sm">
                You're practicing consistently! Keep up the 5-day streak.
              </p>
            </li>
          </ul>
        </Card>

            {/* Action Button */}
            <Button 
              size="lg"
              className="w-full"
              onClick={() => window.location.href = '/analyze'}
            >
              Record New Swing
            </Button>
          </TabsContent>

          <TabsContent value="bat">
            <BatMetricsView {...sampleBatMetrics} />
          </TabsContent>

          <TabsContent value="body">
            <BodyMetricsView {...sampleBodyMetrics} />
          </TabsContent>

          <TabsContent value="ball">
            <BallMetricsView {...sampleBallMetrics} />
          </TabsContent>

          <TabsContent value="brain">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">🧠 BRAIN Metrics</h2>
              <p className="text-muted-foreground">Coming in Phase 5...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
