import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Message {
  id: string;
  message_content: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
}

interface AthleteCommunicationsProps {
  playerId: string;
  userId: string;
  athleteName: string;
}

export function AthleteCommunications({ playerId, userId, athleteName }: AthleteCommunicationsProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageType, setMessageType] = useState<'message' | 'email' | 'sms'>('message');
  const [messageContent, setMessageContent] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    loadMessages();
  }, [userId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);

      const { error } = await supabase.functions.invoke('send-coach-message', {
        body: {
          user_id: userId,
          player_id: playerId,
          message_type: messageType,
          message_content: messageContent,
          subject: subject || undefined,
          cta_text: undefined,
          cta_action: undefined
        }
      });

      if (error) throw error;

      toast.success('Message sent successfully');
      setMessageContent('');
      setSubject('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Send New Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Message to {athleteName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Type Selector */}
          <div className="flex gap-2">
            <Button
              variant={messageType === 'message' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('message')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              In-App
            </Button>
            <Button
              variant={messageType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('email')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              variant={messageType === 'sms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('sms')}
            >
              <Phone className="h-4 w-4 mr-2" />
              SMS
            </Button>
          </div>

          {/* Subject (for email) */}
          {messageType === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Message subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={sendMessage} disabled={sending} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          ) : messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{message.message_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm">{message.message_content}</p>
                      </div>
                      {!message.is_read && (
                        <Badge variant="destructive">Unread</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No messages yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
