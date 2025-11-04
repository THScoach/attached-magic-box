import { useState } from "react";
import { useTeamChallenges } from "@/hooks/useTeamChallenges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Trophy, TrendingUp, Target, Calendar, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

const challengeTypeIcons = {
  most_swings: Users,
  highest_score: Trophy,
  most_improved: TrendingUp,
  consistency: Target,
};

const challengeTypeLabels = {
  most_swings: "Most Swings",
  highest_score: "Highest Score",
  most_improved: "Most Improved",
  consistency: "Consistency",
};

export function TeamChallengeManager() {
  const { challenges, createChallenge, updateChallenge, deleteChallenge } = useTeamChallenges();
  const isLoading = false;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    challenge_type: "most_swings" as const,
    start_date: "",
    end_date: "",
    metric_target: "",
    rules: "",
    prizes: null as any,
    is_public: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingChallenge) {
        updateChallenge({
          id: editingChallenge.id,
          updates: formData,
        });
        toast.success("Challenge updated successfully");
      } else {
        createChallenge(formData);
        toast.success("Challenge created successfully");
      }
      
      setIsCreateOpen(false);
      setEditingChallenge(null);
      setFormData({
        title: "",
        description: "",
        challenge_type: "most_swings",
        start_date: "",
        end_date: "",
        metric_target: "",
        rules: "",
        prizes: null as any,
        is_public: false,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to save challenge");
    }
  };

  const handleEdit = (challenge: any) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description || "",
      challenge_type: challenge.challenge_type,
      start_date: format(new Date(challenge.start_date), "yyyy-MM-dd"),
      end_date: format(new Date(challenge.end_date), "yyyy-MM-dd"),
      metric_target: challenge.metric_target || "",
      rules: challenge.rules || "",
      prizes: challenge.prizes || null,
      is_public: challenge.is_public || false,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;
    
    try {
      deleteChallenge(id);
      toast.success("Challenge deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete challenge");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading challenges...</div>;
  }

  const activeCount = challenges?.filter((c) => c.status === "active").length || 0;
  const upcomingCount = challenges?.filter((c) => c.status === "upcoming").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Challenges</h2>
          <p className="text-muted-foreground">Create and manage competitive challenges for your athletes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingChallenge(null);
            setFormData({
              title: "",
              description: "",
              challenge_type: "most_swings",
              start_date: "",
              end_date: "",
              metric_target: "",
              rules: "",
              prizes: null as any,
              is_public: false,
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingChallenge ? "Edit Challenge" : "Create New Challenge"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Challenge Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Spring Training Challenge"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the challenge..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Challenge Type *</Label>
                <Select
                  value={formData.challenge_type}
                  onValueChange={(value: any) => setFormData({ ...formData, challenge_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most_swings">Most Swings</SelectItem>
                    <SelectItem value="highest_score">Highest Score</SelectItem>
                    <SelectItem value="most_improved">Most Improved</SelectItem>
                    <SelectItem value="consistency">Consistency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric_target">Target Metric (optional)</Label>
                <Input
                  id="metric_target"
                  value={formData.metric_target}
                  onChange={(e) => setFormData({ ...formData, metric_target: e.target.value })}
                  placeholder="e.g., 100 swings, 85 avg score"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingChallenge ? "Update Challenge" : "Create Challenge"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{challenges?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {challenges?.map((challenge) => {
          const Icon = challengeTypeIcons[challenge.challenge_type as keyof typeof challengeTypeIcons];
          const statusColor = challenge.status === "active" ? "default" : challenge.status === "upcoming" ? "secondary" : "outline";

          return (
            <Card key={challenge.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{challenge.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant={statusColor as any}>{challenge.status}</Badge>
                        <span className="text-xs">
                          {challengeTypeLabels[challenge.challenge_type as keyof typeof challengeTypeLabels]}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(challenge)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(challenge.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenge.description && (
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(challenge.start_date), "MMM d")} - {format(new Date(challenge.end_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>View participants</span>
                    </div>
                  </div>
                  {challenge.metric_target && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Target: </span>
                      <span className="font-medium">{challenge.metric_target}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {challenges?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No challenges yet</h3>
              <p className="text-muted-foreground mb-4">Create your first team challenge to engage your athletes</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Challenge
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
