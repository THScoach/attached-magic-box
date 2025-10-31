import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

interface Athlete {
  id: string;
  name: string;
  status: "active" | "trial" | "needs_attention";
  lastActivity: string;
  grindScore: number;
  programCompletion: number;
}

const mockAthletes: Athlete[] = [
  { id: "1", name: "Mike Torres", status: "active", lastActivity: "2 hours ago", grindScore: 85, programCompletion: 92 },
  { id: "2", name: "Sarah Johnson", status: "active", lastActivity: "5 hours ago", grindScore: 78, programCompletion: 88 },
  { id: "3", name: "Jake Williams", status: "needs_attention", lastActivity: "8 days ago", grindScore: 45, programCompletion: 30 },
  { id: "4", name: "Emily Chen", status: "trial", lastActivity: "1 day ago", grindScore: 92, programCompletion: 100 },
  { id: "5", name: "Marcus Brown", status: "active", lastActivity: "1 day ago", grindScore: 88, programCompletion: 95 }
];

const getStatusBadge = (status: Athlete["status"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>;
    case "trial":
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Trial</Badge>;
    case "needs_attention":
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Needs Attention</Badge>;
  }
};

export function AthleteListManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | Athlete["status"]>("all");

  const filteredAthletes = mockAthletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || athlete.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Athlete Management</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={selectedFilter} onValueChange={(v) => setSelectedFilter(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">
            All ({mockAthletes.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            <UserCheck className="h-4 w-4 mr-2" />
            Active ({mockAthletes.filter(a => a.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="trial">
            <Clock className="h-4 w-4 mr-2" />
            Trial ({mockAthletes.filter(a => a.status === "trial").length})
          </TabsTrigger>
          <TabsTrigger value="needs_attention">
            <AlertCircle className="h-4 w-4 mr-2" />
            Needs Attention ({mockAthletes.filter(a => a.status === "needs_attention").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedFilter} className="space-y-3">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-sm">
                  {athlete.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{athlete.name}</p>
                    {getStatusBadge(athlete.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">Last activity: {athlete.lastActivity}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">GRIND</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-primary">{athlete.grindScore}</p>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="text-lg font-bold">{athlete.programCompletion}%</p>
                </div>
                <Button size="sm" variant="outline">View Profile</Button>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
