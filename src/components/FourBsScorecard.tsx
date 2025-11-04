import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LetterGrade, getGradeColor, getGradeIcon } from "@/lib/gradingSystem";

interface CategoryScore {
  grade: LetterGrade;
  percentage: number;
  metrics: {
    label: string;
    value: string;
    status: 'good' | 'warning' | 'bad';
  }[];
}

interface FourBsScorecardProps {
  overallGrade: LetterGrade;
  ballScore?: CategoryScore;
  batScore: CategoryScore;
  bodyScore: CategoryScore;
  brainScore?: CategoryScore;
  showBall?: boolean;
  showBrain?: boolean;
}

export function FourBsScorecard({
  overallGrade,
  ballScore,
  batScore,
  bodyScore,
  brainScore,
  showBall = false,
  showBrain = false,
}: FourBsScorecardProps) {
  const renderCategory = (
    emoji: string,
    title: string,
    score: CategoryScore | undefined,
    link: string
  ) => {
    if (!score) return null;

    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <div className={`text-3xl font-bold ${getGradeColor(score.grade)}`}>
            {score.grade}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {score.metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{metric.label}:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{metric.value}</span>
                <span className={
                  metric.status === 'good' ? 'text-green-500' :
                  metric.status === 'warning' ? 'text-yellow-500' :
                  'text-red-500'
                }>
                  {getGradeIcon(metric.status === 'good' ? 'A' : metric.status === 'warning' ? 'B' : 'D')}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Progress value={score.percentage} className="h-2 mb-3" />

        <Link
          to={link}
          className="flex items-center justify-between text-sm text-primary hover:underline"
        >
          <span>View Details</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <h2 className="text-2xl font-bold mb-2">THE 4 B's SCORECARD</h2>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Overall Grade:</span>
          <span className={`text-4xl font-bold ${getGradeColor(overallGrade)}`}>
            {overallGrade}
          </span>
        </div>
      </Card>

      {showBall && renderCategory("⚾", "BALL (Output)", ballScore, "/progress")}
      {renderCategory("🏏", "BAT (Tool)", batScore, "/progress")}
      {renderCategory("💪", "BODY (Mechanics)", bodyScore, "/progress")}
      {showBrain && renderCategory("🧠", "BRAIN (Mental)", brainScore, "/progress")}
    </div>
  );
}
