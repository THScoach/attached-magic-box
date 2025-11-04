import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface XPLevelSystemProps {
  currentXP: number;
  currentLevel: number;
  xpForNextLevel?: number;
  recentXPGains?: Array<{
    activity: string;
    xp: number;
    time: string;
  }>;
}

export function XPLevelSystem({ 
  currentXP, 
  currentLevel,
  xpForNextLevel = 1000 + (currentLevel * 200), // Scaling XP requirement
  recentXPGains = [
    { activity: "Recorded swing", xp: 50, time: "2 min ago" },
    { activity: "Unlocked achievement", xp: 100, time: "1 hour ago" },
    { activity: "5-day streak", xp: 150, time: "Today" },
    { activity: "Improved H.I.T.S. score", xp: 75, time: "Yesterday" },
  ]
}: XPLevelSystemProps) {
  // Calculate XP for current level
  const xpForCurrentLevel = currentLevel > 1 ? 1000 + ((currentLevel - 1) * 200) : 0;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (xpInCurrentLevel / xpNeededForLevel) * 100;
  
  // Get level tier
  const getLevelTier = (level: number) => {
    if (level >= 50) return { name: "Legend", color: "text-purple-500", icon: "👑" };
    if (level >= 30) return { name: "Master", color: "text-amber-500", icon: "⭐" };
    if (level >= 15) return { name: "Expert", color: "text-blue-500", icon: "💎" };
    if (level >= 5) return { name: "Advanced", color: "text-green-500", icon: "🚀" };
    return { name: "Rookie", color: "text-gray-500", icon: "⚾" };
  };
  
  const tier = getLevelTier(currentLevel);
  const nextMilestone = [5, 15, 30, 50].find(m => m > currentLevel) || 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-xl font-bold">Level Progress</h3>
        </div>
        <Badge variant="secondary" className={`text-lg ${tier.color}`}>
          {tier.icon} {tier.name}
        </Badge>
      </div>

      {/* Level Display */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg">
              {currentLevel}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="text-2xl font-bold">{currentLevel}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Next Level</div>
            <div className="text-2xl font-bold text-primary">{currentLevel + 1}</div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-6" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{xpInCurrentLevel} XP</span>
            <span className="text-muted-foreground">
              {xpNeededForLevel - xpInCurrentLevel} XP to level {currentLevel + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Total XP */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg mb-6 text-center">
        <div className="text-sm text-muted-foreground mb-1">Total XP Earned</div>
        <div className="text-3xl font-bold text-primary">{currentXP.toLocaleString()}</div>
      </div>

      {/* Milestone Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold">Next Milestone</span>
          <span className={tier.color}>Level {nextMilestone}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentLevel / nextMilestone) * 100}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-right mt-1">
          {nextMilestone - currentLevel} levels away
        </div>
      </div>

      {/* Recent XP Gains */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Recent Activity</h4>
        <div className="space-y-2">
          {recentXPGains.slice(0, 4).map((gain, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <div className="text-sm font-medium">{gain.activity}</div>
                  <div className="text-xs text-muted-foreground">{gain.time}</div>
                </div>
              </div>
              <Badge variant="secondary" className="text-green-500">
                +{gain.xp} XP
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* XP Guide */}
      <div className="mt-6 p-4 bg-accent/50 rounded-lg">
        <div className="font-semibold text-sm mb-2">💡 How to earn XP:</div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Record a swing: +50 XP</li>
          <li>• Daily practice: +25 XP</li>
          <li>• Unlock achievement: +100 XP</li>
          <li>• Improve score: +75 XP</li>
          <li>• Week streak: +150 XP</li>
        </ul>
      </div>
    </Card>
  );
}
