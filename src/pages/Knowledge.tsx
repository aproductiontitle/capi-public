import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/knowledge/UploadDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KnowledgeBase {
  id: string;
  name: string;
  file_type: string;
  created_at: string;
  file_path: string;
  vapi_id: string;
}

const Knowledge = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [editingKnowledgeBase, setEditingKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [newName, setNewName] = useState("");
  const { toast } = useToast();

  const fetchKnowledgeBases = async () => {
    const { data, error } = await supabase
      .from("knowledge_bases")
      .select("id, name, file_type, created_at, file_path, vapi_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching knowledge bases:", error);
      toast({
        title: "Error",
        description: "Failed to load knowledge bases.",
        variant: "destructive",
      });
      return;
    }

    setKnowledgeBases(data || []);
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const handleEdit = (knowledgeBase: KnowledgeBase) => {
    setEditingKnowledgeBase(knowledgeBase);
    setNewName(knowledgeBase.name);
  };

  const handleSaveEdit = async () => {
    if (!editingKnowledgeBase || !newName.trim()) return;

    try {
      // Update in Supabase
      const { error: updateError } = await supabase
        .from("knowledge_bases")
        .update({ name: newName })
        .eq("id", editingKnowledgeBase.id);

      if (updateError) throw updateError;

      // Update in VAPI if we have a VAPI ID
      if (editingKnowledgeBase.vapi_id) {
        const { data: secretData } = await supabase
          .from('secrets')
          .select('secret')
          .eq('name', 'VAPI_API_KEY')
          .single();

        if (!secretData?.secret) {
          throw new Error('VAPI API key not found');
        }

        // Use the correct VAPI endpoint format
        const response = await fetch(`https://api.vapi.ai/files/${editingKnowledgeBase.vapi_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${secretData.secret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('VAPI update error:', errorData);
          throw new Error('Failed to update file name in VAPI');
        }
      }

      toast({
        title: "Success",
        description: "Knowledge base renamed successfully.",
      });

      setEditingKnowledgeBase(null);
      fetchKnowledgeBases();
    } catch (error) {
      console.error("Error updating knowledge base:", error);
      toast({
        title: "Error",
        description: "Failed to rename knowledge base.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, filePath: string, vapiId: string) => {
    try {
      if (vapiId) {
        // Delete from VAPI first
        const { data: secretData } = await supabase
          .from('secrets')
          .select('secret')
          .eq('name', 'VAPI_API_KEY')
          .single();

        if (!secretData?.secret) {
          throw new Error('VAPI API key not found');
        }

        const vapiResponse = await fetch(`https://api.vapi.ai/files/${vapiId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${secretData.secret}`,
          },
        });

        if (!vapiResponse.ok) {
          throw new Error('Failed to delete file from VAPI');
        }
      }

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("knowledge_files")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from Supabase Database
      const { error: dbError } = await supabase
        .from("knowledge_bases")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Knowledge base deleted successfully.",
      });

      fetchKnowledgeBases();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge base.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Bases</h1>
            <p className="text-muted-foreground">
              Manage your uploaded knowledge bases and documentation
            </p>
          </div>
          <UploadDialog />
        </div>
        <Separator className="mt-4" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {knowledgeBases.map((kb) => (
              <TableRow key={kb.id}>
                <TableCell className="font-medium">{kb.name}</TableCell>
                <TableCell>{kb.file_type}</TableCell>
                <TableCell>
                  {new Date(kb.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(kb)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(kb.id, kb.file_path, kb.vapi_id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingKnowledgeBase} onOpenChange={() => setEditingKnowledgeBase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Knowledge Base</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <Button onClick={handleSaveEdit} disabled={!newName.trim()}>
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Knowledge;