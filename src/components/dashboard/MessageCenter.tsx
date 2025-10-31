import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { MessageSquare, CheckCircle } from "lucide-react";
import { useCoachMessages } from "@/hooks/useCoachMessages";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function MessageCenter() {
  const { messages, loading, unreadCount, markAsRead, markAllAsRead } = useCoachMessages();
  const navigate = useNavigate();

  const handleCTA = (messageId: string, action?: string) => {
    markAsRead(messageId);
    if (action) {
      navigate(action);
    }
  };

  return (
    <Card className="p-6 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Coach Rick Messages</h3>
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {messages.length > 0 && unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 pr-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CoachRickAvatar size="sm" className="mb-3" />
            <p className="text-sm text-muted-foreground">
              No messages yet. Coach Rick will reach out when it's time to level up.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.is_read ? 'opacity-60' : ''}`}
              >
                <CoachRickAvatar size="xs" className="flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-muted border border-border p-3 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {message.message_type === 'motivation' && '💪 Motivation'}
                        {message.message_type === 'accountability' && '⚡ Accountability'}
                        {message.message_type === 'micro_tip' && '💡 Tip'}
                      </Badge>
                      {!message.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.message_content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                    {message.cta_text && (
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => handleCTA(message.id, message.cta_action)}
                      >
                        {message.cta_text}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
