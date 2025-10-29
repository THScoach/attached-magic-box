import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export function KnowledgeBaseManager() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load knowledge base");
      return;
    }

    setArticles(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const articleData = {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(",").map((t) => t.trim()),
    };

    if (editingId) {
      const { error } = await supabase
        .from("knowledge_base")
        .update(articleData)
        .eq("id", editingId);

      if (error) {
        toast.error("Failed to update article");
        return;
      }
      toast.success("Article updated successfully");
    } else {
      const { error } = await supabase.from("knowledge_base").insert([articleData]);

      if (error) {
        toast.error("Failed to create article");
        return;
      }
      toast.success("Article created successfully");
    }

    setFormData({ title: "", content: "", category: "", tags: "" });
    setIsEditing(false);
    setEditingId(null);
    loadArticles();
  };

  const handleEdit = (article: KnowledgeArticle) => {
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags.join(", "),
    });
    setEditingId(article.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete article");
      return;
    }

    toast.success("Article deleted successfully");
    loadArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Knowledge Base Articles</h2>
        <Button onClick={() => setIsEditing(!isEditing)}>
          <Plus className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Add Article"}
        </Button>
      </div>

      {isEditing && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., biomechanics, technique"
                required
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., anchor, power, foundation"
              />
            </div>

            <Button type="submit" className="w-full">
              {editingId ? "Update Article" : "Create Article"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{article.content}</p>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {article.category}
                  </span>
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(article)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(article.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
