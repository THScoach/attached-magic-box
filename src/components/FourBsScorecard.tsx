import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Lock, TrendingUp, BookOpen } from "lucide-react";
import { MembershipTier, getBCategoryInfo, BCategory, calculateBGrade, hasMetricAccess, METRIC_DEFINITIONS, categoryHasData, isEducationalOnly } from "@/lib/fourBsFramework";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FourBsScorecardProps {
  userTier: MembershipTier;
  metrics: Record<string, number>;
  analysisId?: string;
  compact?: boolean;
  bypassTierRestrictions?: boolean;
}

export function FourBsScorecard({
  userTier,
  metrics,
  analysisId,
  compact = false,
  bypassTierRestrictions = false,
}: FourBsScorecardProps) {
  const categories: BCategory[] = ['brain', 'body', 'bat', 'ball'];
  const [selectedCategory, setSelectedCategory] = useState<BCategory | null>(null);
  
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
    switch (category) {
      case 'brain':
        return {
          title: "🧠 BRAIN - Decision Making",
          content: "The BRAIN represents pitch selection and swing decisions. This is about reading the pitch, deciding whether to swing, and selecting the right approach. Currently, this is an educational category focused on teaching decision-making concepts. Metrics for tracking pitch selection and swing decisions are coming in future updates."
        };
      case 'body':
        return {
          title: "💪 BODY - Movement Mechanics",
          content: "The BODY grade measures how well your body executes the swing. This includes weight transfer, rotation sequencing, balance, and overall movement quality. The grade is calculated from video analysis using computer vision to track your body mechanics through each phase of the swing. Key metrics include center of mass movement, hip-shoulder separation, and kinematic sequencing."
        };
      case 'bat':
        return {
          title: "🏏 BAT - Tool Delivery",
          content: "The BAT grade evaluates how effectively you deliver the bat through the hitting zone. This includes bat speed, bat path efficiency, attack angle, and time in the hitting zone. Metrics can come from video analysis or bat sensors (Blast Motion, Diamond Kinetics, etc.). A high BAT grade means you're creating optimal conditions for hard contact."
        };
      case 'ball':
        return {
          title: "⚾ BALL - Result Quality",
          content: "The BALL grade measures the quality of contact and ball flight. This includes exit velocity, launch angle, and batted ball outcomes. Data comes from sensors like HitTrax, Rapsodo, TrackMan, or other ball-tracking technology. The BALL grade shows the ultimate result - how hard and how well you're hitting the baseball."
        };
    }
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
          onClick={() => setSelectedCategory(category)}
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
        <Card key={category} className="relative overflow-hidden border-2 border-dashed border-muted">
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
        onClick={() => setSelectedCategory(category)}
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
              <div className={cn("text-4xl font-bold", getGradeColor(grade))}>
                {getGradeLetter(grade)}
              </div>
              <div className="text-xs text-muted-foreground">{grade}/100</div>
            </div>
          </div>

          <Progress value={grade} className="h-2 mb-2" />

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
      {/* Overall Score Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-2xl">THE 4 B's SCORECARD</CardTitle>
          <p className="text-sm text-muted-foreground">
            🧠 BRAIN makes the decision → 💪 BODY executes the movement → 🏏 BAT delivers the tool → ⚾ BALL creates the result
          </p>
        </CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Grade</p>
            <div className="flex items-center gap-3">
              <span className={cn("text-5xl font-bold", getGradeColor(overallGrade))}>
                {getGradeLetter(overallGrade)}
              </span>
              <div>
                <Progress value={overallGrade} className="w-32 h-3 mb-1" />
                <p className="text-xs text-muted-foreground">{overallGrade}/100</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
          </Badge>
        </div>
      </Card>

      {/* Category Cards - Order: BRAIN → BODY → BAT → BALL */}
      <div className="grid gap-4">
        {categories.map((cat) => renderCategory(cat))}
      </div>

      {/* Category Explanation Dialog */}
      <Dialog open={selectedCategory !== null} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedCategory && getCategoryExplanation(selectedCategory).title}
            </DialogTitle>
            <DialogDescription className="text-base pt-4 text-foreground">
              {selectedCategory && getCategoryExplanation(selectedCategory).content}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
