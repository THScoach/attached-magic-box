import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function CoachRickChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "What's up? Ready to work today? Let's get it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("coach-rick-chat", {
        body: { message: userMessage },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "Let's get it." },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <Button
        size="lg"
        className={cn(
          "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 h-16 w-16 rounded-full shadow-lg transition-all",
          isOpen && "scale-0"
        )}
        onClick={() => setIsOpen(true)}
      >
        <CoachRickAvatar size="xs" showBorder={false} className="h-12 w-12" />
      </Button>

      {/* Chat Window */}
      <Card
        className={cn(
          "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 shadow-2xl transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 bg-primary/10">
          <div className="flex items-center gap-3">
            <CoachRickAvatar size="xs" className="h-10 w-10" />
            <div>
              <h3 className="font-bold">Coach Rick</h3>
              <p className="text-xs text-muted-foreground">Always here to push you</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <CoachRickAvatar size="xs" className="h-8 w-8 shrink-0" />
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[80%]",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <CoachRickAvatar size="xs" className="h-8 w-8 shrink-0" />
                <div className="rounded-lg p-3 bg-muted">
                  <p className="text-sm">...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
            />
            <Button size="icon" onClick={sendMessage} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
