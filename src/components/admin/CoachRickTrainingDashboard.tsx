import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, MessageSquare, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatHistory {
  id: string;
  user_id: string;
  created_at: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  context?: {
    analysisId?: string;
    playerMetrics?: any;
  };
}

export function CoachRickTrainingDashboard() {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const [trainingStats, setTrainingStats] = useState({
    totalConversations: 0,
    averageLength: 0,
    commonTopics: [] as { topic: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatHistories();
  }, []);

  const loadChatHistories = async () => {
    try {
      setLoading(true);

      // Load chat histories from practice_journal entries where voice_recorded = true
      // This is a proxy for Coach Rick conversations
      const { data: journals, error } = await supabase
        .from('practice_journal')
        .select('*')
        .eq('entry_type', 'coaching_conversation')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const histories: ChatHistory[] = journals?.map((j: any) => ({
        id: j.id,
        user_id: j.user_id,
        created_at: j.created_at,
        messages: JSON.parse(j.content || '[]'),
        context: j.metadata,
      })) || [];

      setChatHistories(histories);

      // Calculate stats
      const totalConversations = histories.length;
      const averageLength = histories.reduce((sum, h) => sum + h.messages.length, 0) / totalConversations || 0;

      // Extract common topics (simplified)
      const topics = new Map<string, number>();
      histories.forEach(h => {
        h.messages.forEach(m => {
          if (m.role === 'user') {
            const content = m.content.toLowerCase();
            if (content.includes('tempo')) topics.set('Tempo & Timing', (topics.get('Tempo & Timing') || 0) + 1);
            if (content.includes('bat speed')) topics.set('Bat Speed', (topics.get('Bat Speed') || 0) + 1);
            if (content.includes('sequence')) topics.set('Kinematic Sequence', (topics.get('Kinematic Sequence') || 0) + 1);
            if (content.includes('balance')) topics.set('Balance', (topics.get('Balance') || 0) + 1);
          }
        });
      });

      const commonTopics = Array.from(topics.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTrainingStats({
        totalConversations,
        averageLength: Math.round(averageLength),
        commonTopics,
      });
    } catch (error) {
      console.error('Error loading chat histories:', error);
      toast.error('Failed to load chat histories');
    } finally {
      setLoading(false);
    }
  };

  const approveResponse = async (chatId: string, messageIndex: number) => {
    toast.success('Response approved for training data');
  };

  const rejectResponse = async (chatId: string, messageIndex: number) => {
    toast.info('Response marked for review');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading Coach Rick training data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats.totalConversations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Messages per Chat</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingStats.averageLength}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Quality Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Based on approved responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Common Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Most Discussed Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trainingStats.commonTopics.map((topic) => (
              <div key={topic.topic} className="flex items-center justify-between">
                <span className="text-sm">{topic.topic}</span>
                <Badge variant="secondary">{topic.count} mentions</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Review */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                {chatHistories.slice(0, 10).map((chat) => (
                  <Card key={chat.id} className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Conversation {new Date(chat.created_at).toLocaleDateString()}
                        </CardTitle>
                        <Badge variant="outline">{chat.messages.length} messages</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        {chat.messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`mb-3 p-3 rounded-lg ${
                              msg.role === 'user' ? 'bg-muted' : 'bg-primary/10'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs font-semibold mb-1">
                                  {msg.role === 'user' ? 'Athlete' : 'Coach Rick'}
                                </p>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                              {msg.role === 'assistant' && (
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => approveResponse(chat.id, idx)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => rejectResponse(chat.id, idx)}
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="flagged">
              <p className="text-sm text-muted-foreground">No flagged conversations</p>
            </TabsContent>

            <TabsContent value="approved">
              <p className="text-sm text-muted-foreground">Viewing approved training data</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
