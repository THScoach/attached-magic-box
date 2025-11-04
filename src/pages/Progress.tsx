import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { BatMetricsView } from "@/components/BatMetricsView";
import { BodyMetricsView } from "@/components/BodyMetricsView";
import { BallMetricsView } from "@/components/BallMetricsView";
import { BrainMetricsView } from "@/components/BrainMetricsView";
import { AchievementBadges } from "@/components/AchievementBadges";
import { StreakTracker } from "@/components/StreakTracker";
import { XPLevelSystem } from "@/components/XPLevelSystem";
import { Leaderboard } from "@/components/Leaderboard";
import { calculateGrade } from "@/lib/gradingSystem";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { useProgressMetrics } from "@/hooks/useProgressMetrics";
import { useGamificationData } from "@/hooks/useGamificationData";
import { useHistoricalMetrics } from "@/hooks/useHistoricalMetrics";
import { MetricTrendChart } from "@/components/MetricTrendChart";
import { BenchmarkComparison } from "@/components/BenchmarkComparison";
import { Loader2 } from "lucide-react";

export default function Progress() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'overview';
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const tabs = ['overview', 'bat', 'body', 'ball', 'brain', 'gamification'];

  // Fetch real metrics data
  const {
    batMetrics,
    bodyMetrics,
    ballMetrics,
    brainMetrics,
    stats,
    progressData,
    loading,
  } = useProgressMetrics();

  // Fetch real gamification data
  const {
    data: gamificationData,
    loading: gamificationLoading,
  } = useGamificationData();

  // Fetch historical trends
  const { metrics: historicalMetrics, loading: historicalLoading } = useHistoricalMetrics();

  if (loading || gamificationLoading || historicalLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Sync carousel to tab changes
  useEffect(() => {
    if (!carouselApi) return;
    const index = tabs.indexOf(activeTab);
    if (index !== -1) {
      carouselApi.scrollTo(index);
    }
  }, [activeTab, carouselApi]);

  // Sync tab to carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const index = carouselApi.selectedScrollSnap();
      setActiveTab(tabs[index]);
      setSearchParams({ category: tabs[index] });
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, setSearchParams]);

  // Use real data or fallback to sample data if no data exists yet
  const displayBatMetrics = batMetrics || {
    batSpeed: 72,
    attackAngle: 12,
    timeInZone: 0.15,
    level: 'highSchool',
    batSpeedGrade: calculateGrade(75),
    attackAngleGrade: calculateGrade(90),
    timeInZoneGrade: calculateGrade(85),
    personalBest: 74,
  };

  const displayBodyMetrics = bodyMetrics || {
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

  const displayBallMetrics = ballMetrics || {
    exitVelocity: 92,
    level: 'highSchool',
    exitVelocityGrade: calculateGrade(92),
    flyBallPercentage: 35,
    lineDrivePercentage: 50,
    groundBallPercentage: 15,
    launchAngleGrade: calculateGrade(95),
    hardHitPercentage: 65,
    totalSwings: 20,
    hardHitCount: 13,
    hardHitGrade: calculateGrade(95),
  };

  const displayBrainMetrics = brainMetrics || {
    reactionTime: 165,
    reactionTimeGrade: calculateGrade(85),
    goodSwingsPercentage: 75,
    goodTakesPercentage: 68,
    chaseRate: 28,
    swingDecisionGrade: calculateGrade(88),
    totalPitches: 100,
    focusScore: 82,
    focusGrade: calculateGrade(82),
    consistencyRating: 78,
  };

  const displayProgressData = progressData.length > 0 ? progressData : [
    { date: 'Oct 1', hits: 68, anchor: 75, engine: 65, whip: 64 },
    { date: 'Oct 5', hits: 70, anchor: 78, engine: 67, whip: 66 },
    { date: 'Oct 10', hits: 72, anchor: 80, engine: 68, whip: 68 },
    { date: 'Oct 15', hits: 71, anchor: 79, engine: 69, whip: 66 },
    { date: 'Oct 20', hits: 74, anchor: 83, engine: 71, whip: 68 },
    { date: 'Oct 25', hits: 75, anchor: 85, engine: 72, whip: 68 },
  ];

  const displayStats = stats || {
    totalSwings: 0,
    avgHitsScore: 0,
    improvement: 0,
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Stats</TabsTrigger>
            <TabsTrigger value="bat" className="text-xs sm:text-sm">🏏</TabsTrigger>
            <TabsTrigger value="body" className="text-xs sm:text-sm">💪</TabsTrigger>
            <TabsTrigger value="ball" className="text-xs sm:text-sm">⚾</TabsTrigger>
            <TabsTrigger value="brain" className="text-xs sm:text-sm">🧠</TabsTrigger>
            <TabsTrigger value="gamification" className="text-xs sm:text-sm">🏆</TabsTrigger>
          </TabsList>

          <Carousel 
            setApi={setCarouselApi}
            className="w-full"
            opts={{
              align: "start",
              loop: false,
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <TabsContent value="overview" className="space-y-6 mt-0">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Swings</p>
            <p className="text-3xl font-bold">{displayStats.totalSwings}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg H.I.T.S.</p>
            <p className="text-3xl font-bold text-primary">{displayStats.avgHitsScore}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Improvement</p>
            <p className="text-3xl font-bold text-green-500">
              {displayStats.improvement > 0 ? '+' : ''}{displayStats.improvement}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Focus Area</p>
            <p className="text-xl font-bold text-engine">{displayStats.focusArea}</p>
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
            <LineChart data={displayProgressData}>
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
              </CarouselItem>

              <CarouselItem>
          <TabsContent value="bat" className="mt-0">
            <BatMetricsView {...displayBatMetrics} />
          </TabsContent>
              </CarouselItem>

              <CarouselItem>
          <TabsContent value="body" className="mt-0">
            <BodyMetricsView {...displayBodyMetrics} />
          </TabsContent>
              </CarouselItem>

              <CarouselItem>
          <TabsContent value="ball" className="mt-0">
            <BallMetricsView {...displayBallMetrics} />
          </TabsContent>
              </CarouselItem>

              <CarouselItem>
          <TabsContent value="brain" className="mt-0">
            <BrainMetricsView {...displayBrainMetrics} />
          </TabsContent>
              </CarouselItem>

              <CarouselItem>
          <TabsContent value="gamification" className="space-y-6 mt-0">
            <XPLevelSystem 
              currentXP={gamificationData?.currentXP || 0}
              currentLevel={gamificationData?.currentLevel || 1}
            />
            
            <StreakTracker 
              currentStreak={gamificationData?.currentStreak || 0}
              longestStreak={gamificationData?.longestStreak || 0}
              lastPracticeDays={gamificationData?.practiceDays || []}
            />
            
            <AchievementBadges />
            
            <Leaderboard />
          </TabsContent>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </Tabs>

        {/* Historical Trends Section */}
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Historical Trends</h2>
            <p className="text-muted-foreground">Track your improvement over time</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <MetricTrendChart
              title="Bat Speed"
              data={historicalMetrics.batSpeed}
              metricName="Bat Speed"
              color="hsl(var(--chart-1))"
              unit="mph"
            />
            <MetricTrendChart
              title="Exit Velocity"
              data={historicalMetrics.exitVelocity}
              metricName="Exit Velocity"
              color="hsl(var(--chart-2))"
              unit="mph"
            />
            <MetricTrendChart
              title="Sequence Efficiency"
              data={historicalMetrics.sequenceEfficiency}
              metricName="Sequence Efficiency"
              color="hsl(var(--chart-3))"
              unit="%"
            />
            <MetricTrendChart
              title="Reaction Time"
              data={historicalMetrics.reactionTime}
              metricName="Reaction Time"
              color="hsl(var(--chart-4))"
              unit="ms"
            />
            <MetricTrendChart
              title="Attack Angle"
              data={historicalMetrics.attackAngle}
              metricName="Attack Angle"
              color="hsl(var(--chart-5))"
              unit="°"
            />
            <MetricTrendChart
              title="Tempo Ratio"
              data={historicalMetrics.tempoRatio}
              metricName="Tempo Ratio"
              color="hsl(var(--primary))"
              unit=":1"
            />
          </div>
        </div>

        {/* Benchmark Comparisons Section */}
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Benchmark Comparisons</h2>
            <p className="text-muted-foreground">See how you stack up against different skill levels</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <BenchmarkComparison
              metricName="Bat Speed"
              userValue={displayBatMetrics.batSpeed}
              unit="mph"
              benchmarks={{
                youth: 50,
                highSchool: 65,
                college: 75,
                pro: 85,
              }}
            />
            <BenchmarkComparison
              metricName="Exit Velocity"
              userValue={displayBallMetrics.exitVelocity}
              unit="mph"
              benchmarks={{
                youth: 60,
                highSchool: 75,
                college: 90,
                pro: 100,
              }}
            />
            <BenchmarkComparison
              metricName="Reaction Time"
              userValue={displayBrainMetrics.reactionTime}
              unit="ms"
              benchmarks={{
                youth: 250,
                highSchool: 220,
                college: 200,
                pro: 180,
              }}
              higherIsBetter={false}
            />
            <BenchmarkComparison
              metricName="Attack Angle"
              userValue={displayBatMetrics.attackAngle}
              unit="°"
              benchmarks={{
                youth: 8,
                highSchool: 12,
                college: 15,
                pro: 18,
              }}
            />
            <BenchmarkComparison
              metricName="Sequence Efficiency"
              userValue={displayBodyMetrics.sequenceEfficiency}
              unit="%"
              benchmarks={{
                youth: 70,
                highSchool: 80,
                college: 87,
                pro: 92,
              }}
            />
            <BenchmarkComparison
              metricName="Tempo Ratio"
              userValue={displayBodyMetrics.tempoRatio}
              unit=":1"
              benchmarks={{
                youth: 2.0,
                highSchool: 2.5,
                college: 2.8,
                pro: 3.0,
              }}
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
