import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserCheck, AlertCircle, Clock, TrendingUp, Upload, Eye, UserCircle } from "lucide-react";
import { useState } from "react";

interface Athlete {
  id: string;
  name: string;
  status: "active" | "trial" | "needs_attention";
  lastActivity: string;
  sequenceScore: number;
  anchorScore: number;
  engineScore: number;
  whipScore: number;
}

const mockAthletes: Athlete[] = [
  { id: "1", name: "Mike Torres", status: "active", lastActivity: "2 hours ago", sequenceScore: 85, anchorScore: 82, engineScore: 78, whipScore: 88 },
  { id: "2", name: "Sarah Johnson", status: "active", lastActivity: "5 hours ago", sequenceScore: 78, anchorScore: 75, engineScore: 80, whipScore: 79 },
  { id: "3", name: "Jake Williams", status: "needs_attention", lastActivity: "8 days ago", sequenceScore: 45, anchorScore: 48, engineScore: 42, whipScore: 46 },
  { id: "4", name: "Emily Chen", status: "trial", lastActivity: "1 day ago", sequenceScore: 92, anchorScore: 90, engineScore: 93, whipScore: 92 },
  { id: "5", name: "Marcus Brown", status: "active", lastActivity: "1 day ago", sequenceScore: 88, anchorScore: 85, engineScore: 90, whipScore: 89 }
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Athlete Roster</h3>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Athletes</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="needs-attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{athlete.name}</p>
                    {getStatusBadge(athlete.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-anchor"></span>
                      <span className="font-medium">{athlete.anchorScore}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-engine"></span>
                      <span className="font-medium">{athlete.engineScore}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-whip"></span>
                      <span className="font-medium">{athlete.whipScore}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">Sequence: {athlete.sequenceScore}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right mr-4">
                  <p className="text-sm font-medium">Last Activity</p>
                  <p className="text-xs text-muted-foreground">{athlete.lastActivity}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
