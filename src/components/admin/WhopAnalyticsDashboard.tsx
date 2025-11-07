import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Trophy,
  Zap,
  Crown
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TIER_COLORS = {
  challenge: '#FF6B35',
  diy: '#3B82F6',
  elite: '#FFD700',
  free: '#6B7280',
};

export function WhopAnalyticsDashboard() {
  // Fetch all Whop subscribers
  const { data: whopSubscribers, isLoading } = useQuery({
    queryKey: ["whop-analytics"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, whop_user_id, whop_username, created_at")
        .not("whop_user_id", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get membership data for each profile
      const profileIds = profiles?.map(p => p.id) || [];
      const { data: memberships } = await supabase
        .from("user_memberships")
        .select("user_id, tier, status, created_at, expires_at, cancelled_at")
        .in("user_id", profileIds);

      return profiles?.map(profile => {
        const membership = memberships?.find(m => m.user_id === profile.id);
        return {
          ...profile,
          tier: membership?.tier || 'free',
          status: membership?.status || 'inactive',
          membershipCreated: membership?.created_at,
          expiresAt: membership?.expires_at,
          cancelledAt: membership?.cancelled_at,
        };
      }) || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Whop Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const totalSubscribers = whopSubscribers?.length || 0;
  const activeSubscribers = whopSubscribers?.filter(s => s.status === 'active').length || 0;
  const thisMonthSubscribers = whopSubscribers?.filter(s => {
    const created = new Date(s.created_at);
    const now = new Date();
    return created >= startOfMonth(now) && created <= endOfMonth(now);
  }).length || 0;

  // Tier distribution
  const tierDistribution = whopSubscribers?.reduce((acc, sub) => {
    acc[sub.tier] = (acc[sub.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const tierPieData = Object.entries(tierDistribution).map(([tier, count]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    value: count,
    color: TIER_COLORS[tier as keyof typeof TIER_COLORS],
  }));

  // Subscriber growth over last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'MMM dd');
    const count = whopSubscribers?.filter(s => {
      const created = new Date(s.created_at);
      return format(created, 'MMM dd yyyy') === format(date, 'MMM dd yyyy');
    }).length || 0;
    return { date: dateStr, subscribers: count };
  });

  // Calculate cumulative growth
  let cumulative = 0;
  const growthData = last30Days.map(day => {
    cumulative += day.subscribers;
    return { ...day, total: cumulative };
  });

  // Monthly recurring revenue estimate (rough calculation)
  const tierPricing = {
    challenge: 297,
    diy: 997,
    elite: 2997,
  };

  const estimatedMRR = whopSubscribers
    ?.filter(s => s.status === 'active' && s.tier !== 'free')
    .reduce((sum, sub) => {
      return sum + (tierPricing[sub.tier as keyof typeof tierPricing] || 0);
    }, 0) || 0;

  // Churn analysis
  const cancelledSubscribers = whopSubscribers?.filter(s => s.cancelledAt).length || 0;
  const churnRate = totalSubscribers > 0 
    ? ((cancelledSubscribers / totalSubscribers) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              {activeSubscribers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              New subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(estimatedMRR / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              {cancelledSubscribers} cancelled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
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
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Total Subscribers"
                />
                <Line 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="New Daily"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
            <CardDescription>Active subscriptions by tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tierPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {Object.entries(tierDistribution).map(([tier, count]) => (
                <Badge 
                  key={tier} 
                  variant="outline"
                  style={{ 
                    borderColor: TIER_COLORS[tier as keyof typeof TIER_COLORS],
                    color: TIER_COLORS[tier as keyof typeof TIER_COLORS]
                  }}
                >
                  {tier === 'challenge' && <Trophy className="h-3 w-3 mr-1" />}
                  {tier === 'diy' && <Zap className="h-3 w-3 mr-1" />}
                  {tier === 'elite' && <Crown className="h-3 w-3 mr-1" />}
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Whop Subscribers</CardTitle>
          <CardDescription>Latest 10 subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {whopSubscribers?.slice(0, 10).map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {subscriber.whop_username || subscriber.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(subscriber.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge 
                    variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                    style={{
                      backgroundColor: subscriber.status === 'active' 
                        ? TIER_COLORS[subscriber.tier as keyof typeof TIER_COLORS] + '20'
                        : undefined,
                      borderColor: subscriber.status === 'active'
                        ? TIER_COLORS[subscriber.tier as keyof typeof TIER_COLORS]
                        : undefined,
                    }}
                  >
                    {subscriber.tier}
                  </Badge>
                  <Badge variant={subscriber.status === 'active' ? 'default' : 'outline'}>
                    {subscriber.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
