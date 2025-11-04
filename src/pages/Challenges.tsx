import { ChallengeLeaderboard } from "@/components/ChallengeLeaderboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Challenges() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Team Challenges</h1>
          <p className="text-muted-foreground">
            Compete with your teammates and track your progress
          </p>
        </div>

        <ChallengeLeaderboard />
      </div>
    </div>
  );
}
