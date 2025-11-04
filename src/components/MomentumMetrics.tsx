import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { SwingAnalysis } from "@/types/swing";
import { Activity, Zap, TrendingUp, Gauge } from "lucide-react";

interface MomentumMetricsProps {
  analysis: SwingAnalysis;
}

export function MomentumMetrics({ analysis }: MomentumMetricsProps) {
  const biomechanics = analysis.biomechanicsMetrics;

  if (!biomechanics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Bat Speed & Power */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Bat Speed & Power Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Bat Speed at Contact</div>
              <div className="text-2xl font-bold">{biomechanics.batSpeed?.toFixed(1)} mph</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Peak Bat Speed</div>
              <div className="text-2xl font-bold">{biomechanics.peakBatSpeed?.toFixed(1)} mph</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Peak Power
                <InfoTooltip content="Maximum power output during the swing, measured in horsepower. Elite hitters generate 2-4 HP." />
              </div>
              <div className="text-2xl font-bold">{biomechanics.peakPower?.toFixed(2)} HP</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Power: {biomechanics.averagePower?.toFixed(2)} HP</span>
              <span>Power at Contact: {biomechanics.powerAtContact?.toFixed(2)} HP</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Angular Velocities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Rotational Velocities
            <InfoTooltip content="Angular velocities show how fast each body segment is rotating. Proper sequencing is pelvis → torso → shoulders." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pelvis Angular Velocity</span>
                <span className="font-bold">{biomechanics.pelvisAngularVelocity?.toFixed(0)}°/s</span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                Peak: {biomechanics.peakPelvisVelocity?.toFixed(0)}°/s | MLB Avg: 714°/s
              </div>
              <Progress 
                value={Math.min(100, (biomechanics.peakPelvisVelocity / 714) * 100)} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Torso Angular Velocity</span>
                <span className="font-bold">{biomechanics.torsoAngularVelocity?.toFixed(0)}°/s</span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                Peak: {biomechanics.peakTorsoVelocity?.toFixed(0)}°/s | MLB Avg: 937°/s
              </div>
              <Progress 
                value={Math.min(100, (biomechanics.peakTorsoVelocity / 937) * 100)} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Shoulder Angular Velocity</span>
                <span className="font-bold">{biomechanics.shoulderAngularVelocity?.toFixed(0)}°/s</span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                MLB Range: 900-1200°/s
              </div>
              <Progress 
                value={Math.min(100, (biomechanics.shoulderAngularVelocity / 1200) * 100)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linear Momentum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Linear Momentum
            <InfoTooltip content="Linear momentum measures the forward movement of body segments. Higher values indicate more aggressive weight transfer." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Linear Momentum</div>
              <div className="text-xl font-bold">
                {biomechanics.totalLinearMomentum?.toFixed(2)} slug-ft/s
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Peak Linear Momentum</div>
              <div className="text-xl font-bold">
                {biomechanics.peakLinearMomentum?.toFixed(2)} slug-ft/s
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pelvis</span>
              <span>{biomechanics.pelvisLinearMomentum?.toFixed(2)} slug-ft/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Torso</span>
              <span>{biomechanics.torsoLinearMomentum?.toFixed(2)} slug-ft/s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rotational Momentum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Rotational Momentum
            <InfoTooltip content="Rotational momentum (angular momentum) measures the rotational force of body segments. Critical for generating bat speed." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Rotational Momentum</div>
            <div className="text-2xl font-bold">
              {biomechanics.totalRotationalMomentum?.toFixed(2)} slug-ft²/s
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pelvis Contribution</span>
              <span>{biomechanics.pelvisRotationalMomentum?.toFixed(2)} slug-ft²/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Torso Contribution</span>
              <span>{biomechanics.torsoRotationalMomentum?.toFixed(2)} slug-ft²/s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kinetic Energy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Kinetic Energy Distribution
            <InfoTooltip content="Shows how energy is distributed between linear (forward) movement and rotational movement." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Kinetic Energy</div>
            <div className="text-2xl font-bold">
              {biomechanics.totalKineticEnergy?.toFixed(2)} ft-lb
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Translational Energy</span>
                <span>{biomechanics.translationalKE?.toFixed(2)} ft-lb</span>
              </div>
              <Progress 
                value={(biomechanics.translationalKE / biomechanics.totalKineticEnergy) * 100} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Rotational Energy</span>
                <span>{biomechanics.rotationalKE?.toFixed(2)} ft-lb</span>
              </div>
              <Progress 
                value={(biomechanics.rotationalKE / biomechanics.totalKineticEnergy) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Efficiency Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>
                Energy Transfer Efficiency
                <InfoTooltip content="Measures how efficiently body energy transfers to the bat. Higher is better." />
              </span>
              <span className="font-bold">{biomechanics.energyTransferEfficiency?.toFixed(1)}%</span>
            </div>
            <Progress value={biomechanics.energyTransferEfficiency} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>
                Sequencing Efficiency
                <InfoTooltip content="Measures how well body segments fire in optimal sequence: pelvis → torso → bat." />
              </span>
              <span className="font-bold">{biomechanics.sequencingEfficiency?.toFixed(1)}%</span>
            </div>
            <Progress value={biomechanics.sequencingEfficiency} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>
                Momentum Retention
                <InfoTooltip content="Measures how well momentum is maintained throughout the swing. Elite hitters maintain 90%+." />
              </span>
              <span className="font-bold">{biomechanics.momentumRetention?.toFixed(1)}%</span>
            </div>
            <Progress value={biomechanics.momentumRetention} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
