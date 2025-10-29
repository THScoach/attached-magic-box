import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DrillFeedbackChatProps {
  analysisId: string;
  drillName?: string;
  onComplete: () => void;
}

export function DrillFeedbackChat({ analysisId, drillName, onComplete }: DrillFeedbackChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey! Great job completing that ${drillName || 'drill'}! I'd love to hear how it felt for you. Let's chat about it - this will help me give you even better recommendations next time. How did the drill feel?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory: Message[] = [...messages, { role: "user" as const, content: userMessage }];

      const { data, error } = await supabase.functions.invoke('coach-rick-chat', {
        body: {
          messages: conversationHistory,
          context: {
            mode: 'drill_feedback',
            analysisId,
            drillName
          }
        }
      });

      if (error) throw error;

      if (data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        
        // Check if Coach Rick is wrapping up (contains keywords suggesting conversation end)
        const isWrappingUp = data.response.toLowerCase().includes('keep up') || 
                            data.response.toLowerCase().includes('great talking') ||
                            data.response.toLowerCase().includes('see you next');
        
        if (isWrappingUp) {
          // Save the conversation
          await saveFeedback(conversationHistory.concat([{ role: "assistant", content: data.response }]));
          setConversationComplete(true);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFeedback = async (fullConversation: Message[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create a summary from the conversation
    const summary = fullConversation
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' | ');

    await supabase
      .from('drill_feedback_notes')
      .insert({
        user_id: user.id,
        analysis_id: analysisId,
        conversation: fullConversation as any,
        summary
      });

    toast.success("Feedback saved to your notes!");
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <CheckCircle className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Coach Rick - Drill Feedback</h3>
            <p className="text-sm text-muted-foreground">Let's talk about how that drill felt</p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-xs font-bold mb-1 text-blue-500">Coach Rick</div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!conversationComplete ? (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Share your thoughts..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleFinish}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Drill
          </Button>
        )}
      </div>
    </Card>
  );
}
