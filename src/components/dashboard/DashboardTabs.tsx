import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Upload, TrendingUp, Dumbbell, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PerformanceTracking } from "./PerformanceTracking";
import { AssignedWork } from "./AssignedWork";

export function DashboardTabs() {
  const navigate = useNavigate();

  return (
    <Tabs defaultValue="analyze" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="analyze" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Analyze</span>
        </TabsTrigger>
        <TabsTrigger value="progress" className="flex items-center gap-2">
          <LineChart className="h-4 w-4" />
          <span className="hidden sm:inline">Progress</span>
        </TabsTrigger>
        <TabsTrigger value="training" className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4" />
          <span className="hidden sm:inline">Training</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="analyze" className="space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Swing Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Today's Session</p>
                <p className="text-sm text-muted-foreground">5 swings analyzed</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/progress")}>
                View Details
              </Button>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/reboot-analysis")}
            >
              <Upload className="mr-2 h-5 w-5" />
              Analyze My Swing
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="progress">
        <PerformanceTracking />
      </TabsContent>

      <TabsContent value="training">
        <AssignedWork />
      </TabsContent>
    </Tabs>
  );
}
