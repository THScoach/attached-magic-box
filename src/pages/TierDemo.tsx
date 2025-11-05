import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FourBsScorecard } from "@/components/FourBsScorecard";
import { MembershipTier, TIER_ACCESS, getAvailableMetrics, getLockedMetrics } from "@/lib/fourBsFramework";
import { Lock, Check, AlertCircle } from "lucide-react";

export default function TierDemo() {
  const [selectedTier, setSelectedTier] = useState<MembershipTier>('free');

  // Mock metrics data for testing
  const mockMetrics = {
    // BRAIN metrics
    swing_decision_rate: 85,
    chase_rate: 25,
    timing_consistency: 80,

    // BODY metrics
    kinematic_sequence: 88,
    tempo_ratio: 2.8,
    hip_shoulder_separation: 45,
    weight_transfer: 12,
    ground_force: 123,

    // BAT metrics
    bat_speed: 72,
    attack_angle: 12,
    ideal_attack_angle_rate: 60,
    swing_path_tilt: 32,
    time_in_zone: 150,

    // BALL metrics
    exit_velocity: 85,
    launch_angle: 15,
    barrel_rate: 8,
    hard_hit_rate: 65,
  };

  const tiers: MembershipTier[] = ['free', 'challenge', 'diy', 'elite'];
  const tierInfo = TIER_ACCESS[selectedTier];
  const availableMetrics = getAvailableMetrics(selectedTier);
  const lockedMetrics = getLockedMetrics(selectedTier);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">4 B's Framework - Tier Testing</h1>
          <p className="text-muted-foreground">
            Select a tier to see what metrics are available at each level
          </p>
        </div>

        {/* Tier Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Membership Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tiers.map((tier) => {
                const info = TIER_ACCESS[tier];
                return (
                  <Button
                    key={tier}
                    variant={selectedTier === tier ? "default" : "outline"}
                    className="h-auto flex flex-col items-start p-4"
                    onClick={() => setSelectedTier(tier)}
                  >
                    <div className="font-bold text-lg mb-1">
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </div>
                    <div className="text-xs opacity-80">{info.price}</div>
                    <div className="text-xs mt-2 opacity-60">
                      {typeof info.swingsPerMonth === 'number'
                        ? `${info.swingsPerMonth} swings/month`
                        : 'Unlimited swings'}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tier Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Available Metrics ({availableMetrics.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['brain', 'body', 'bat', 'ball'].map((category) => {
                  const categoryMetrics = availableMetrics.filter(
                    (m) => m.category === category
                  );
                  const categoryIcon = {
                    brain: '🧠',
                    body: '💪',
                    bat: '🏏',
                    ball: '⚾',
                  }[category];

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <span>{categoryIcon}</span>
                        {category.toUpperCase()} ({categoryMetrics.length})
                      </h4>
                      {categoryMetrics.length === 0 ? (
                        <p className="text-sm text-muted-foreground pl-8">
                          No metrics available
                        </p>
                      ) : (
                        <ul className="space-y-1 pl-8">
                          {categoryMetrics.map((metric) => (
                            <li
                              key={metric.id}
                              className="text-sm flex items-start gap-2"
                            >
                              <span className="text-green-600">✓</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span>{metric.icon}</span>
                                  <span className="font-medium">{metric.name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {metric.dataSource === 'camera' && '📹 Camera'}
                                  {metric.dataSource === 'ai_estimated' && (
                                    <span className="flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      AI Estimated (~{metric.accuracy}% accuracy)
                                    </span>
                                  )}
                                  {['blast_motion', 'reboot_motion', 'hittrax', 'rapsodo'].includes(
                                    metric.dataSource
                                  ) && (
                                    <span className="flex items-center gap-1">
                                      <Check className="h-3 w-3 text-green-600" />
                                      Sensor Verified ({metric.accuracy}% accuracy)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Locked Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-600" />
                Locked Metrics ({lockedMetrics.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lockedMetrics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">All Metrics Unlocked!</p>
                  <p className="text-sm">
                    You have access to all available metrics at this tier.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {['brain', 'body', 'bat', 'ball'].map((category) => {
                    const categoryMetrics = lockedMetrics.filter(
                      (m) => m.category === category
                    );
                    const categoryIcon = {
                      brain: '🧠',
                      body: '💪',
                      bat: '🏏',
                      ball: '⚾',
                    }[category];

                    if (categoryMetrics.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <span>{categoryIcon}</span>
                          {category.toUpperCase()} ({categoryMetrics.length})
                        </h4>
                        <ul className="space-y-1 pl-8">
                          {categoryMetrics.map((metric) => (
                            <li
                              key={metric.id}
                              className="text-sm flex items-start gap-2 opacity-60"
                            >
                              <Lock className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span>{metric.icon}</span>
                                  <span className="font-medium">{metric.name}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Requires {metric.requiredTier.charAt(0).toUpperCase() + metric.requiredTier.slice(1)} tier
                                </Badge>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tier Features */}
        <Card>
          <CardHeader>
            <CardTitle>
              {tierInfo.tier.charAt(0).toUpperCase() + tierInfo.tier.slice(1)} Tier Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Access Level</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    {tierInfo.brainAccess ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-orange-600" />
                    )}
                    🧠 BRAIN: {tierInfo.brainAccess ? 'Full Access' : 'Locked'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    💪 BODY: {tierInfo.bodyAccess.charAt(0).toUpperCase() + tierInfo.bodyAccess.slice(1)}
                  </li>
                  <li className="flex items-center gap-2">
                    {tierInfo.batAccess === 'none' ? (
                      <Lock className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    🏏 BAT: {tierInfo.batAccess === 'none' ? 'Locked' : tierInfo.batAccess.charAt(0).toUpperCase() + tierInfo.batAccess.slice(1)}
                  </li>
                  <li className="flex items-center gap-2">
                    {tierInfo.ballAccess === 'none' ? (
                      <Lock className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    ⚾ BALL: {tierInfo.ballAccess === 'none' ? 'Locked' : tierInfo.ballAccess.charAt(0).toUpperCase() + tierInfo.ballAccess.slice(1)}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="space-y-1 text-sm">
                  {tierInfo.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Scorecard Preview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Live Scorecard Preview</h2>
          <FourBsScorecard
            userTier={selectedTier}
            metrics={mockMetrics}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
}
