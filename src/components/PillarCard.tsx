import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Anchor, Settings, Zap, ChevronDown, ChevronUp, CheckCircle, AlertCircle, XCircle, Flame, Target, Activity, Dumbbell, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { JointDataViewer } from "@/components/JointDataViewer";
import { DrillCard } from "@/components/DrillCard";
import type { FrameJointData } from "@/lib/poseAnalysis";
import { getDrillsByPillar, scheduleDrillsToCalendar } from "@/lib/scheduleDrills";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ComponentMetric {
  name: string;
  score: number;
  currentValue?: string;
  optimalRange?: string;
  percentile?: number;
  status: string;
}

interface PillarCardProps {
  pillar: "ANCHOR" | "ENGINE" | "WHIP";
  score: number;
  subtitle: string;
  className?: string;
  components?: ComponentMetric[];
  jointData?: FrameJointData[];
  videoWidth?: number;
  videoHeight?: number;
}

const pillarConfig = {
  ANCHOR: {
    icon: Anchor,
    color: "text-anchor-foreground",
    bg: "bg-anchor",
    border: "border-anchor",
    progress: "bg-anchor",
    tooltip: "Stability & Ground Force - Foundation of power generation"
  },
  ENGINE: {
    icon: Settings,
    color: "text-engine-foreground",
    bg: "bg-engine",
    border: "border-engine",
    progress: "bg-engine",
    tooltip: "Tempo & Sequence - Optimal timing and kinetic chain"
  },
  WHIP: {
    icon: Zap,
    color: "text-whip-foreground",
    bg: "bg-whip",
    border: "border-whip",
    progress: "bg-whip",
    tooltip: "Release & Acceleration - Bat speed through contact zone"
  }
};

export function PillarCard({ pillar, score, subtitle, className, components = [], jointData = [], videoWidth = 1920, videoHeight = 1080 }: PillarCardProps) {
  const config = pillarConfig[pillar];
  const Icon = config.icon;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showJointData, setShowJointData] = useState(false);
  const [showDrills, setShowDrills] = useState(false);
  const [drills, setDrills] = useState<any[]>([]);
  const [loadingDrills, setLoadingDrills] = useState(false);
  const [schedulingDrills, setSchedulingDrills] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500/10";
    if (score >= 70) return "bg-yellow-500/10";
    if (score >= 50) return "bg-orange-500/10";
    return "bg-red-500/10";
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (score >= 70) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusLabel = (score: number) => {
    if (score >= 90) return "Elite";
    if (score >= 70) return "Advanced";
    if (score >= 50) return "Developing";
    return "Needs Work";
  };

  const handleShowJointData = () => {
    if (jointData.length === 0) {
      toast.info("No joint tracking data available for this analysis");
      return;
    }
    setShowJointData(!showJointData);
  };

  const handleShowDrills = async () => {
    if (!showDrills && drills.length === 0) {
      setLoadingDrills(true);
      const result = await getDrillsByPillar(pillar, 5);
      if (result.success) {
        setDrills(result.drills);
      } else {
        toast.error("Failed to load drills");
      }
      setLoadingDrills(false);
    }
    setShowDrills(!showDrills);
  };

  const handleScheduleDrills = async () => {
    if (drills.length === 0) {
      toast.error("No drills available to schedule");
      return;
    }

    setSchedulingDrills(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to schedule drills");
        return;
      }

      // Get current player from session storage if available
      const selectedPlayerId = sessionStorage.getItem('selected_player_id');

      const result = await scheduleDrillsToCalendar({
        userId: user.id,
        playerId: selectedPlayerId,
        drillIds: drills.map(d => d.id),
        drillNames: drills.map(d => d.name),
        pillar: pillar,
        weeksAhead: 4,
        sessionsPerWeek: 4
      });

      if (result.success) {
        toast.success(`${pillar} drills scheduled!`, {
          description: "4 sessions per week for the next 4 weeks added to your calendar"
        });
      } else {
        toast.error("Failed to schedule drills", {
          description: result.error
        });
      }
    } catch (error) {
      console.error('Error scheduling drills:', error);
      toast.error("An error occurred while scheduling");
    } finally {
      setSchedulingDrills(false);
    }
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-lg border-2",
      config.border,
      className
    )}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-lg", config.bg)}>
              <Icon className={cn("h-6 w-6", config.color)} />
            </div>
            <div>
              <h3 className={cn("font-bold text-lg", config.color)}>{pillar}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn("text-3xl font-bold", getScoreColor(score))}>
              {score}
            </div>
            <Badge variant="outline" className={cn(getScoreBg(score), getScoreColor(score))}>
              {getStatusIcon(score)}
              <span className="ml-1">{getStatusLabel(score)}</span>
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Score</span>
            <span className="font-medium">{score}/100</span>
          </div>
          <Progress value={score} className="h-2 bg-muted">
            <div 
              className={cn("h-full transition-all", config.bg)} 
              style={{ width: `${score}%` }}
            />
          </Progress>
        </div>

        {components && components.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full mt-4 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <span className="text-sm font-medium">View Components</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Expanded Component Breakdown */}
      {isExpanded && components && components.length > 0 && (
        <div className="border-t px-6 py-4 space-y-4 bg-muted/30">
          {components.map((component, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {getStatusIcon(component.score)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{component.name}</h4>
                      <span className={cn("text-sm font-bold", getScoreColor(component.score))}>
                        {component.score}/100
                      </span>
                    </div>
                    
                    {component.currentValue && (
                      <p className="text-xs text-muted-foreground">
                        Current: <span className="font-medium text-foreground">{component.currentValue}</span>
                      </p>
                    )}
                    
                    {component.optimalRange && (
                      <p className="text-xs text-muted-foreground">
                        Optimal: <span className="text-muted-foreground/80">{component.optimalRange}</span>
                      </p>
                    )}
                    
                    {component.percentile && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {component.percentile}th percentile
                      </Badge>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {component.status}
                    </p>
                  </div>
                </div>
              </div>
              
              <Progress value={component.score} className="h-1.5">
                <div 
                  className={cn(
                    "h-full transition-all",
                    component.score >= 90 ? "bg-green-500" :
                    component.score >= 70 ? "bg-yellow-500" :
                    component.score >= 50 ? "bg-orange-500" : "bg-red-500"
                  )} 
                  style={{ width: `${component.score}%` }}
                />
              </Progress>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowJointData}
              className="w-full justify-start"
              disabled={jointData.length === 0}
            >
              <Activity className="h-4 w-4 mr-2" />
              {showJointData ? "Hide Joint Information" : "View Joint Information"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowDrills}
              className="w-full justify-start"
              disabled={loadingDrills}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              {loadingDrills ? "Loading..." : showDrills ? "Hide Drill Recommendations" : "View Drill Recommendations"}
            </Button>

            {showDrills && drills.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleScheduleDrills}
                className="w-full justify-start"
                disabled={schedulingDrills}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {schedulingDrills ? "Scheduling..." : "Add to Calendar (4x/week)"}
              </Button>
            )}
          </div>

          {/* Joint Data Viewer */}
          {showJointData && jointData.length > 0 && (
            <div className="pt-4 border-t">
              <JointDataViewer 
                frameData={jointData}
                videoWidth={videoWidth}
                videoHeight={videoHeight}
              />
            </div>
          )}

          {/* Drill Recommendations */}
          {showDrills && (
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-semibold text-sm">Recommended Drills for {pillar}</h4>
              {drills.length > 0 ? (
                drills.map(drill => (
                  <DrillCard 
                    key={drill.id}
                    drill={drill}
                    onViewDrill={(id) => {
                      toast.info("Drill details coming soon!");
                    }}
                  />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No drills available for this pillar yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
