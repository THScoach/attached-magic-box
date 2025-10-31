import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Video, FileText, Trash2, ExternalLink } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: "video" | "document";
  video_url: string | null;
  document_url: string | null;
  tags: string[] | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export function ContentLibraryManager() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ["content-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContentItem[];
    },
  });

  const deleteContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_library")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
      toast.success("Content deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const filteredContent = content?.filter((item) => {
    const matchesType = filterType === "all" || item.content_type === filterType;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Library</h2>
          <p className="text-muted-foreground">
            Manage training videos and documents
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Content</DialogTitle>
            </DialogHeader>
            <AddContentForm onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading content...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContent?.map((item) => (
            <Card key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {item.content_type === "video" ? (
                    <Video className="w-5 h-5 text-primary" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                  <Badge variant="secondary">{item.content_type}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteContent.mutate(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <h3 className="font-semibold">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {item.category && (
                <Badge variant="outline">{item.category}</Badge>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {item.video_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(item.video_url!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Video
                </Button>
              )}

              {item.document_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(item.document_url!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Document
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddContentForm({ onSuccess }: { onSuccess: () => void }) {
  const [contentType, setContentType] = useState<"video" | "document">("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const addContent = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let documentUrl = null;

      if (contentType === "document" && file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("library-documents")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("library-documents").getPublicUrl(fileName);

        documentUrl = publicUrl;
      }

      const { error } = await supabase.from("content_library").insert({
        created_by: user.id,
        title,
        description: description || null,
        content_type: contentType,
        video_url: contentType === "video" ? videoUrl : null,
        document_url: documentUrl,
        category: category || null,
        tags: tags ? tags.split(",").map((t) => t.trim()) : null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
      toast.success("Content added successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to add content: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Title is required");
      return;
    }
    if (contentType === "video" && !videoUrl) {
      toast.error("Video URL is required");
      return;
    }
    if (contentType === "document" && !file) {
      toast.error("Document file is required");
      return;
    }
    addContent.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Content Type</Label>
        <Select
          value={contentType}
          onValueChange={(val) => setContentType(val as "video" | "document")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video Link</SelectItem>
            <SelectItem value="document">Document Upload</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Content title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
          rows={3}
        />
      </div>

      {contentType === "video" && (
        <div className="space-y-2">
          <Label>Video URL *</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or Vimeo link"
            type="url"
            required
          />
          <p className="text-xs text-muted-foreground">
            Paste YouTube, Vimeo, or any video platform link
          </p>
        </div>
      )}

      {contentType === "document" && (
        <div className="space-y-2">
          <Label>Upload Document *</Label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.txt"
            required
          />
          <p className="text-xs text-muted-foreground">
            PDF, DOC, DOCX, or TXT files
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Anchor, Engine, Whip"
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated tags for filtering
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={addContent.isPending}>
          {addContent.isPending ? "Adding..." : "Add Content"}
        </Button>
      </div>
    </form>
  );
}
