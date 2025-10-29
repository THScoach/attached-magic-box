import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeBaseManager } from "@/components/admin/KnowledgeBaseManager";
import { DrillsManager } from "@/components/admin/DrillsManager";
import { SeedModelPlayers } from "@/components/SeedModelPlayers";
import { BookOpen, Dumbbell, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </div>
          <Button onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
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
