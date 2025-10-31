import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { Send, MessageSquare } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  sender: "coach" | "athlete";
  content: string;
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "coach",
    content: "Great work on your tempo this week! Let's focus on maintaining that rhythm in live AB situations.",
    timestamp: "Today 2:45 PM"
  },
  {
    id: "2",
    sender: "athlete",
    content: "Thanks Coach! Should I keep doing the same drills or switch it up?",
    timestamp: "Today 3:10 PM"
  },
  {
    id: "3",
    sender: "coach",
    content: "Keep the foundation drills for another week, but add some game-speed reps. Upload those swings when you can.",
    timestamp: "Today 3:15 PM"
  }
];

export function MessageCenter() {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      // TODO: Implement message sending
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <Card className="p-6 flex flex-col h-[500px]">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Coach Messages</h3>
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-4">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "athlete" ? "flex-row-reverse" : ""}`}
            >
              {message.sender === "coach" && (
                <CoachRickAvatar size="xs" className="flex-shrink-0" />
              )}
              <div className={`flex-1 ${message.sender === "athlete" ? "flex justify-end" : ""}`}>
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-lg ${
                    message.sender === "coach"
                      ? "bg-muted border border-border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === "coach" ? "text-muted-foreground" : "opacity-80"
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
