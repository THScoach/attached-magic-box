import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { Brain, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TRAINING_QUESTIONS = [
  "Tell me what you focus on when a hitter gets stuck pulling off.",
  "What's your go-to cue for fixing early extension?",
  "How do you explain sequence to a young hitter?",
  "What's the biggest timing mistake you see in amateur players?",
  "Describe your approach when a hitter loses their barrel feel.",
  "What's one thing coaches get wrong about launch angle?",
  "How do you help a hitter who's too rotational?",
  "What drill do you use most for improving tempo?",
];

export function CoachAITrainingInput() {
  const [question] = useState(
    TRAINING_QUESTIONS[Math.floor(Math.random() * TRAINING_QUESTIONS.length)]
  );
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Store in knowledge_base table
      const { error } = await supabase.from("knowledge_base").insert({
        category: "coach_training",
        title: question,
        content: answer,
        tags: ["coach_input", "ai_training"],
      });

      if (error) throw error;

      toast.success("Knowledge captured! This helps Coach Rick AI learn your voice.");
      setAnswer("");
    } catch (error) {
      console.error("Training input error:", error);
      toast.error("Failed to save training input");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Feed the AI</CardTitle>
            <CardDescription>
              Help Coach Rick AI learn your coaching language and approach
            </CardDescription>
          </div>
          <CoachRickAvatar size="xs" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Today's Question:</p>
          <p className="text-base font-semibold text-foreground/90 italic">"{question}"</p>
        </div>

        <Textarea
          placeholder="Type your coaching insight here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          className="resize-none"
        />

        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Your insights train the AI to communicate like you
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
