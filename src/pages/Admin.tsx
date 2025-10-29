import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeBaseManager } from "@/components/admin/KnowledgeBaseManager";
import { DrillsManager } from "@/components/admin/DrillsManager";
import { SeedModelPlayers } from "@/components/SeedModelPlayers";
import { BookOpen, Dumbbell, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleAuth = () => {
    // Simple password check - in production, use proper authentication
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6">
            <Lock className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
              <p className="text-muted-foreground">
                Enter password to access admin dashboard
              </p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md border bg-background"
            />
            <Button onClick={handleAuth} className="w-full">
              Access Admin
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage knowledge base and drills</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to App
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mb-6">
          <SeedModelPlayers />
        </div>
        
        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="knowledge">
              <BookOpen className="h-4 w-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="drills">
              <Dumbbell className="h-4 w-4 mr-2" />
              Drills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge">
            <KnowledgeBaseManager />
          </TabsContent>

          <TabsContent value="drills">
            <DrillsManager />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
