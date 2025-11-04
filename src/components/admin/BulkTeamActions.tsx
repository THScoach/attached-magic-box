import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Calendar, Target, Dumbbell, Loader2 } from "lucide-react";

interface Athlete {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface BulkTeamActionsProps {
  athletes: Athlete[];
}

export function BulkTeamActions({ athletes }: BulkTeamActionsProps) {
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Message state
  const [messageType, setMessageType] = useState<"in_app" | "email">("in_app");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");

  // Schedule state
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleType, setScheduleType] = useState("practice");

  // Goal state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Drill state
  const [drillTitle, setDrillTitle] = useState("");
  const [drillDescription, setDrillDescription] = useState("");
  const [drillDueDate, setDrillDueDate] = useState("");

  const toggleAthlete = (athleteId: string) => {
    const newSelected = new Set(selectedAthletes);
    if (newSelected.has(athleteId)) {
      newSelected.delete(athleteId);
    } else {
      newSelected.add(athleteId);
    }
    setSelectedAthletes(newSelected);
  };

  const selectAll = () => {
    setSelectedAthletes(new Set(athletes.map(a => a.id)));
  };

  const deselectAll = () => {
    setSelectedAthletes(new Set());
  };

  const handleBulkMessage = async () => {
    if (selectedAthletes.size === 0) {
      toast.error("Please select at least one athlete");
      return;
    }
    if (!messageContent.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (const athleteId of selectedAthletes) {
        await supabase.functions.invoke("send-coach-message", {
          body: {
            userId: athleteId,
            messageType,
            messageContent,
            subject: messageType === "email" ? messageSubject : undefined,
          },
        });
      }

      toast.success(`Message sent to ${selectedAthletes.size} athlete(s)`);
      setMessageContent("");
      setMessageSubject("");
    } catch (error) {
      console.error("Error sending bulk messages:", error);
      toast.error("Failed to send messages");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkSchedule = async () => {
    if (selectedAthletes.size === 0) {
      toast.error("Please select at least one athlete");
      return;
    }
    if (!scheduleTitle || !scheduleDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (const athleteId of selectedAthletes) {
        await supabase.from("calendar_items").insert({
          user_id: athleteId,
          coach_id: user.id,
          title: scheduleTitle,
          scheduled_date: scheduleDate,
          scheduled_time: scheduleTime || null,
          item_type: scheduleType,
        });
      }

      toast.success(`Schedule created for ${selectedAthletes.size} athlete(s)`);
      setScheduleTitle("");
      setScheduleDate("");
      setScheduleTime("");
    } catch (error) {
      console.error("Error creating bulk schedule:", error);
      toast.error("Failed to create schedules");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkGoal = async () => {
    if (selectedAthletes.size === 0) {
      toast.error("Please select at least one athlete");
      return;
    }
    if (!goalTitle || !goalTarget) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (const athleteId of selectedAthletes) {
        await supabase.from("calendar_items").insert({
          user_id: athleteId,
          coach_id: user.id,
          title: `Goal: ${goalTitle}`,
          description: `Target: ${goalTarget}`,
          scheduled_date: goalDeadline || new Date().toISOString().split('T')[0],
          item_type: "goal",
        });
      }

      toast.success(`Goal set for ${selectedAthletes.size} athlete(s)`);
      setGoalTitle("");
      setGoalTarget("");
      setGoalDeadline("");
    } catch (error) {
      console.error("Error setting bulk goals:", error);
      toast.error("Failed to set goals");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDrill = async () => {
    if (selectedAthletes.size === 0) {
      toast.error("Please select at least one athlete");
      return;
    }
    if (!drillTitle || !drillDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (const athleteId of selectedAthletes) {
        await supabase.from("calendar_items").insert({
          user_id: athleteId,
          coach_id: user.id,
          title: drillTitle,
          description: drillDescription,
          scheduled_date: drillDueDate || new Date().toISOString().split('T')[0],
          item_type: "drill",
        });
      }

      toast.success(`Drill assigned to ${selectedAthletes.size} athlete(s)`);
      setDrillTitle("");
      setDrillDescription("");
      setDrillDueDate("");
    } catch (error) {
      console.error("Error assigning bulk drills:", error);
      toast.error("Failed to assign drills");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Athletes</CardTitle>
          <CardDescription>
            Choose athletes for bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={selectAll} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={deselectAll} variant="outline" size="sm">
              Deselect All
            </Button>
            <span className="ml-auto text-sm text-muted-foreground">
              {selectedAthletes.size} selected
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
            {athletes.map((athlete) => (
              <div
                key={athlete.id}
                className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                onClick={() => toggleAthlete(athlete.id)}
              >
                <Checkbox
                  checked={selectedAthletes.has(athlete.id)}
                  onCheckedChange={() => toggleAthlete(athlete.id)}
                />
                <Label className="cursor-pointer flex-1">
                  {athlete.first_name && athlete.last_name
                    ? `${athlete.first_name} ${athlete.last_name}`
                    : athlete.email.split('@')[0]}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="message" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="message">
            <Send className="h-4 w-4 mr-2" />
            Message
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="goal">
            <Target className="h-4 w-4 mr-2" />
            Goal
          </TabsTrigger>
          <TabsTrigger value="drill">
            <Dumbbell className="h-4 w-4 mr-2" />
            Drill
          </TabsTrigger>
        </TabsList>

        <TabsContent value="message">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Message</CardTitle>
              <CardDescription>
                Send a message to all selected athletes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Message Type</Label>
                <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app">In-App Message</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {messageType === "email" && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>

              <Button onClick={handleBulkMessage} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {selectedAthletes.size} Athlete(s)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Create Bulk Schedule</CardTitle>
              <CardDescription>
                Add a calendar item for all selected athletes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={scheduleType} onValueChange={setScheduleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="drill">Drill</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time (optional)</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleBulkSchedule} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule for {selectedAthletes.size} Athlete(s)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goal">
          <Card>
            <CardHeader>
              <CardTitle>Set Bulk Goal</CardTitle>
              <CardDescription>
                Assign a goal to all selected athletes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Name</Label>
                <Input
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g., Bat Speed"
                />
              </div>

              <div className="space-y-2">
                <Label>Target Value</Label>
                <Input
                  type="number"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="e.g., 75"
                />
              </div>

              <div className="space-y-2">
                <Label>Deadline (optional)</Label>
                <Input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                />
              </div>

              <Button onClick={handleBulkGoal} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Set Goal for {selectedAthletes.size} Athlete(s)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drill">
          <Card>
            <CardHeader>
              <CardTitle>Assign Bulk Drill</CardTitle>
              <CardDescription>
                Assign a drill to all selected athletes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Drill Name</Label>
                <Input
                  value={drillTitle}
                  onChange={(e) => setDrillTitle(e.target.value)}
                  placeholder="Drill title"
                />
              </div>

              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea
                  value={drillDescription}
                  onChange={(e) => setDrillDescription(e.target.value)}
                  placeholder="Drill instructions and details..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date (optional)</Label>
                <Input
                  type="date"
                  value={drillDueDate}
                  onChange={(e) => setDrillDueDate(e.target.value)}
                />
              </div>

              <Button onClick={handleBulkDrill} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Assign to {selectedAthletes.size} Athlete(s)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
