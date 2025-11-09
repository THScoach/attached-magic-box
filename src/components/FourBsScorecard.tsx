import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Lock, TrendingUp, BookOpen } from "lucide-react";
import { MembershipTier, getBCategoryInfo, BCategory, calculateBGrade, hasMetricAccess, METRIC_DEFINITIONS, categoryHasData, isEducationalOnly } from "@/lib/fourBsFramework";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FourBsScorecardProps {
  userTier: MembershipTier;
  metrics: Record<string, number>;
  analysisId?: string;
  compact?: boolean;
  bypassTierRestrictions?: boolean;
  playerId?: string;
}

export function FourBsScorecard({
  userTier,
  metrics,
  analysisId,
  compact = false,
  bypassTierRestrictions = false,
  playerId,
}: FourBsScorecardProps) {
  const navigate = useNavigate();
  const categories: BCategory[] = ['brain', 'body', 'bat', 'ball'];
  const [selectedCategory, setSelectedCategory] = useState<BCategory | null>(null);
  
  const handleCardClick = (category: BCategory) => {
    if (playerId) {
      navigate(`/player/${playerId}/${category}`);
    }
  };
  
  // Calculate grades for each B
  const categoryGrades: Record<BCategory, number> = {
    brain: calculateBGrade('brain', metrics, userTier),
    body: calculateBGrade('body', metrics, userTier),
    bat: calculateBGrade('bat', metrics, userTier),
    ball: calculateBGrade('ball', metrics, userTier),
  };

  // Calculate overall grade - only include categories with actual data
  const categoriesWithData = categories.filter((cat) => {
    if (bypassTierRestrictions) {
      // For admin view, check if data exists
      return categoryHasData(cat, metrics, 'elite');
    }
    // For normal users, check both tier access AND if data exists
    return categoryHasData(cat, metrics, userTier);
  });

  const availableGrades = categoriesWithData.map((cat) => categoryGrades[cat]).filter(g => g > 0);
  
  const overallGrade = availableGrades.length > 0
    ? Math.round(availableGrades.reduce((sum, g) => sum + g, 0) / availableGrades.length)
    : 0;

  const getGradeColor = (grade: number): string => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (grade: number): string => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  const getCategoryExplanation = (category: BCategory): { title: string; content: string } => {
    const info = getBCategoryInfo(category);
    const grade = categoryGrades[category];
    
    // Generate personalized explanation based on actual metrics
    let content = '';
    
    if (category === 'brain') {
      content = "The BRAIN represents pitch selection and swing decisions. This is about reading the pitch, deciding whether to swing, and selecting the right approach. Currently, this is an educational category focused on teaching decision-making concepts. Metrics for tracking pitch selection and swing decisions are coming in future updates.";
    } else {
      // Get metrics for this category
      const categoryMetrics = METRIC_DEFINITIONS
        .filter(m => m.category === category && hasMetricAccess(userTier, m))
        .filter(m => {
          const value = metrics[m.id];
          return value !== undefined && value !== null && !isNaN(value);
        });
      
      if (categoryMetrics.length === 0) {
        content = `No ${info.name.toLowerCase()} data available yet. Upload more videos or connect sensors to track your ${info.name.toLowerCase()} metrics.`;
      } else {
        const gradeLetter = getGradeLetter(grade);
        let gradeContext = '';
        
        if (grade >= 90) gradeContext = 'Outstanding work! Your metrics are in the elite range.';
        else if (grade >= 80) gradeContext = 'Great job! You\'re performing well above average.';
        else if (grade >= 70) gradeContext = 'Good performance with room to improve.';
        else if (grade >= 60) gradeContext = 'There\'s significant room for improvement.';
        else gradeContext = 'This needs immediate attention and focused training.';
        
        content = `**Your ${info.name} Grade: ${gradeLetter} (${grade}/100)**\n\n${gradeContext}\n\n**Key Metrics:**\n\n`;
        
        categoryMetrics.forEach(metric => {
          const value = metrics[metric.id];
          content += `• **${metric.name}:** ${value.toFixed(1)}${metric.unit}\n`;
          
          // Add context for specific metrics
          if (metric.id === 'tempo_ratio') {
            if (value >= 2.5 && value <= 3.5) {
              content += `  ✓ Excellent! Your tempo ratio of ${value.toFixed(1)} is in the optimal 3:1 range.\n`;
            } else if (value < 2.5) {
              content += `  ⚠️ Your tempo is too fast. Slow down your load phase for better timing.\n`;
            } else {
              content += `  ⚠️ Your tempo is too slow. Speed up your firing phase for more power.\n`;
            }
          } else if (metric.id === 'bat_speed' || metric.id === 'bat_speed_sensor') {
            if (value >= 70) {
              content += `  ✓ Elite bat speed! You're generating serious power.\n`;
            } else if (value >= 65) {
              content += `  ✓ Good bat speed. Focus on consistency and sequencing.\n`;
            } else {
              content += `  ⚠️ Work on rotational mechanics and kinematic sequencing to increase bat speed.\n`;
            }
          } else if (metric.id === 'kinematic_sequence') {
            if (value >= 85) {
              content += `  ✓ Excellent sequencing! Your body is firing in the proper order.\n`;
            } else {
              content += `  ⚠️ Work on firing your body parts in sequence: pelvis → torso → hands → bat.\n`;
            }
          } else if (metric.id === 'exit_velocity' || metric.id === 'exit_velocity_sensor') {
            if (value >= 90) {
              content += `  ✓ Elite exit velocity! You're crushing the ball.\n`;
            } else if (value >= 80) {
              content += `  ✓ Good power output. Keep developing strength and bat speed.\n`;
            } else {
              content += `  ⚠️ Focus on bat speed, barrel contact, and full body rotation.\n`;
            }
          } else if (metric.id === 'attack_angle' || metric.id === 'attack_angle_sensor') {
            if (value >= 5 && value <= 20) {
              content += `  ✓ Perfect attack angle for line drives and hard contact.\n`;
            } else if (value < 5) {
              content += `  ⚠️ Too steep/downward. Work on getting under the ball more.\n`;
            } else {
              content += `  ⚠️ Too uppercut. Flatten your swing path slightly.\n`;
            }
          }
          content += '\n';
        });
        
        content += `\n**What This Means:**\n`;
        if (category === 'body') {
          content += 'Your body mechanics drive everything else in your swing. Great body mechanics create the foundation for bat speed and hard contact.';
        } else if (category === 'bat') {
          content += 'Your bat path and speed determine the quality of contact. Optimal bat delivery creates consistent, hard-hit balls.';
        } else if (category === 'ball') {
          content += 'These are your results - the proof is in the pudding. High exit velocity and optimal launch angle lead to more hits and extra-base hits.';
        }
      }
    }
    
    return {
      title: `${info.icon} ${info.name.toUpperCase()} - ${info.description}`,
      content
    };
  };

  const renderCategory = (category: BCategory) => {
    const info = getBCategoryInfo(category);
    const grade = categoryGrades[category];
    
    // Check if this is educational-only (BRAIN)
    const educationalOnly = isEducationalOnly(category);
    
    // Check if we have actual data for this category
    const hasData = bypassTierRestrictions 
      ? categoryHasData(category, metrics, 'elite')
      : categoryHasData(category, metrics, userTier);
    
    const hasAccess = bypassTierRestrictions || METRIC_DEFINITIONS.filter((m) => m.category === category).some((m) => hasMetricAccess(userTier, m));

    // If educational-only category (BRAIN), show special card
    if (educationalOnly) {
      return (
        <Card 
          key={category} 
          className="hover:shadow-lg transition-shadow border-2 border-dashed border-primary/30 cursor-pointer"
          onClick={() => handleCardClick(category)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{info.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{info.name}</h3>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
              </div>
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-primary mb-1" />
                <div className="text-xs text-muted-foreground">Learn</div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-3 mb-2">
              <p className="text-sm text-foreground">
                <strong>Educational Content:</strong> Decision making and pitch selection concepts. No metrics tracked yet.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-primary">
              <span>Learn More</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      );
    }

    // If no data and no access, show locked state
    if (!hasData && !hasAccess) {
      // Category is completely locked
      return (
        <Card key={category} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-semibold">Premium Feature</p>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <h3 className="font-semibold">{info.name}</h3>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-muted-foreground blur-sm select-none">
                85
              </div>
            </div>
            <Progress value={85} className="h-2 opacity-50" />
          </CardContent>
        </Card>
      );
    }

    // If has access but no data, show "No Data" educational state
    if (hasAccess && !hasData) {
      let noDataMessage = "No data available yet";
      
      if (category === 'bat') {
        noDataMessage = "Upload a swing video or connect bat sensor to get bat metrics";
      } else if (category === 'ball') {
        noDataMessage = "Connect exit velocity sensor (HitTrax, Rapsodo, etc.) to track ball metrics";
      } else if (category === 'body') {
        noDataMessage = "Upload a swing video to analyze body mechanics";
      }
      
      return (
        <Card 
          key={category} 
          className="relative overflow-hidden border-2 border-dashed border-muted hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick(category)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl opacity-50">{info.icon}</span>
                <div>
                  <h3 className="font-semibold text-muted-foreground">{info.name}</h3>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
              </div>
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="bg-muted/30 rounded-lg p-3 mb-2">
              <p className="text-xs text-muted-foreground">
                {noDataMessage}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Educational Content</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card 
        key={category} 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleCardClick(category)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{info.icon}</span>
              <div>
                <h3 className="font-bold text-lg">{info.name}</h3>
                <p className="text-xs text-muted-foreground">{info.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-primary">
            <span>View Details</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">The 4 B's Score</h3>
          <div className={cn("text-3xl font-bold", getGradeColor(overallGrade))}>
            {getGradeLetter(overallGrade)}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const info = getBCategoryInfo(cat);
            const grade = categoryGrades[cat];
            const hasAccess = METRIC_DEFINITIONS.filter((m) => m.category === cat).some((m) => hasMetricAccess(userTier, m));
            
            return (
              <div key={cat} className="text-center p-2 rounded-lg bg-muted/30">
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className={cn("text-xl font-bold", hasAccess ? getGradeColor(grade) : "text-muted-foreground")}>
                  {hasAccess ? getGradeLetter(grade) : <Lock className="h-4 w-4 mx-auto" />}
                </div>
                <div className="text-xs text-muted-foreground">{info.name}</div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl">THE 4 B's SCORECARD</CardTitle>
          <p className="text-sm text-muted-foreground">
            🧠 BRAIN makes the decision → 💪 BODY executes the movement → 🏏 BAT delivers the tool → ⚾ BALL creates the result
          </p>
        </CardHeader>
      </Card>

      {/* Category Cards - Order: BRAIN → BODY → BAT → BALL */}
      <div className="grid gap-4">
        {categories.map((cat) => renderCategory(cat))}
      </div>

      {/* Category Explanation Dialog */}
      <Dialog open={selectedCategory !== null} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedCategory && getCategoryExplanation(selectedCategory).title}
            </DialogTitle>
            <DialogDescription className="text-base pt-4 text-foreground whitespace-pre-line">
              {selectedCategory && getCategoryExplanation(selectedCategory).content}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
