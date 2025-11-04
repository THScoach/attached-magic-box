import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  achievements?: Achievement[];
}

const defaultAchievements: Achievement[] = [
  {
    id: "first_swing",
    name: "First Steps",
    description: "Record your first swing",
    icon: "🎯",
    unlocked: true,
  },
  {
    id: "ten_swings",
    name: "Getting Started",
    description: "Record 10 swings",
    icon: "📊",
    unlocked: true,
  },
  {
    id: "fifty_swings",
    name: "Dedicated",
    description: "Record 50 swings",
    icon: "💪",
    unlocked: false,
    progress: 47,
    maxProgress: 50,
  },
  {
    id: "hundred_club",
    name: "100 MPH Club",
    description: "Reach 100+ mph exit velocity",
    icon: "🚀",
    unlocked: false,
    progress: 92,
    maxProgress: 100,
  },
  {
    id: "week_streak",
    name: "Week Warrior",
    description: "Practice 7 days in a row",
    icon: "🔥",
    unlocked: false,
    progress: 5,
    maxProgress: 7,
  },
  {
    id: "month_streak",
    name: "Month Master",
    description: "Practice 30 days in a row",
    icon: "⭐",
    unlocked: false,
    progress: 5,
    maxProgress: 30,
  },
  {
    id: "all_a_grade",
    name: "Perfect Report Card",
    description: "Get all A grades in one swing",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "tempo_master",
    name: "Tempo Master",
    description: "Achieve perfect 3:1 tempo ratio",
    icon: "⏱️",
    unlocked: false,
  },
  {
    id: "elite_sequence",
    name: "Kinetic Chain King",
    description: "100% sequence efficiency",
    icon: "⚡",
    unlocked: true,
  },
  {
    id: "discipline",
    name: "Plate Discipline",
    description: "Chase rate below 20%",
    icon: "🧠",
    unlocked: false,
    progress: 28,
    maxProgress: 20,
  },
  {
    id: "consistency",
    name: "Mr. Consistent",
    description: "5 consecutive swings above 80 H.I.T.S.",
    icon: "📈",
    unlocked: false,
    progress: 3,
    maxProgress: 5,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Practice before 8 AM",
    icon: "🌅",
    unlocked: false,
  },
];

export function AchievementBadges({ achievements = defaultAchievements }: AchievementBadgesProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">🏆 Achievements</h3>
        <Badge variant="secondary" className="text-sm">
          {unlockedCount}/{totalCount}
        </Badge>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-primary/60 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
              achievement.unlocked
                ? 'border-primary bg-primary/5 hover:scale-105 cursor-pointer'
                : 'border-muted bg-muted/30 opacity-60'
            }`}
          >
            {/* Icon */}
            <div className="text-4xl mb-2 text-center">
              {achievement.unlocked ? achievement.icon : <Lock className="w-8 h-8 mx-auto text-muted-foreground" />}
            </div>

            {/* Name */}
            <div className="text-xs font-bold text-center mb-1 line-clamp-2">
              {achievement.name}
            </div>

            {/* Description */}
            <div className="text-xs text-muted-foreground text-center line-clamp-2">
              {achievement.description}
            </div>

            {/* Progress Bar (if not unlocked and has progress) */}
            {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-center text-muted-foreground mt-1">
                  {achievement.progress}/{achievement.maxProgress}
                </div>
              </div>
            )}

            {/* Unlocked Badge */}
            {achievement.unlocked && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
