import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_FILE_TYPES = [
  "text/markdown",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadDialog() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a Markdown, PDF, plain text, or Word document.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    if (!name) {
      setName(selectedFile.name.split(".")[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !name) return;

    try {
      setIsUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, upload to VAPI
      const { data: secretData } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'VAPI_API_KEY')
        .single();

      if (!secretData?.secret) {
        throw new Error('VAPI API key not found');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);

      const vapiResponse = await fetch('https://api.vapi.ai/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretData.secret}`,
        },
        body: formData,
      });

      if (!vapiResponse.ok) {
        const errorData = await vapiResponse.json();
        console.error('VAPI upload error:', errorData);
        throw new Error('Failed to upload file to VAPI');
      }

      const vapiData = await vapiResponse.json();
      const vapiFileId = vapiData.id;

      // Then upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("knowledge_files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Finally, create the database record with the VAPI file ID
      const { error: dbError } = await supabase
        .from("knowledge_bases")
        .insert({
          name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          user_id: user.id,
          vapi_id: vapiFileId
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Knowledge base uploaded successfully.",
      });

      setFile(null);
      setName("");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Knowledge Base
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Knowledge Base</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter knowledge base name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".md,.pdf,.txt,.doc,.docx"
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: Markdown, PDF, plain text, Word documents (max 10MB)
            </p>
          </div>
        </div>
        <Button
          onClick={handleUpload}
          disabled={!file || !name || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}