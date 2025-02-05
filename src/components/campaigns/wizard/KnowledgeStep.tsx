import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, FileText } from "lucide-react";
import type { KnowledgeBase } from "./types";

interface KnowledgeStepProps {
  selectedKnowledgeBase?: string;
  onKnowledgeBaseSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const KnowledgeStep = ({
  selectedKnowledgeBase,
  onKnowledgeBaseSelect,
  onNext,
  onBack,
}: KnowledgeStepProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: knowledgeBases, isLoading } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: async () => {
      console.log('[KnowledgeStep] Fetching knowledge bases...');
      const { data, error } = await supabase
        .from('knowledge_bases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[KnowledgeStep] Error fetching knowledge bases:', error);
        toast.error("Failed to fetch knowledge bases");
        throw error;
      }

      console.log('[KnowledgeStep] Fetched knowledge bases:', data);
      return data as KnowledgeBase[];
    },
  });

  const handleFileUpload = async () => {
    if (!file || !knowledgeBaseName.trim()) {
      toast.error("Please provide both a file and a name for the knowledge base");
      return;
    }

    setIsUploading(true);
    console.log('[KnowledgeStep] Starting file upload process...');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        toast.error('You must be logged in to upload files');
        return;
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      console.log('[KnowledgeStep] Uploading file to storage:', filePath);
      const { error: uploadError } = await supabase.storage
        .from('knowledge_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get VAPI API key
      const { data: secretData } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'VAPI_API_KEY')
        .single();

      if (!secretData?.secret) {
        throw new Error('VAPI API key not found');
      }

      console.log('[KnowledgeStep] Uploading to VAPI...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', knowledgeBaseName);

      const vapiResponse = await fetch('https://api.vapi.ai/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretData.secret}`,
        },
        body: formData,
      });

      if (!vapiResponse.ok) {
        const errorData = await vapiResponse.json();
        console.error('[KnowledgeStep] VAPI upload error:', errorData);
        throw new Error('Failed to upload file to VAPI');
      }

      const vapiData = await vapiResponse.json();
      console.log('[KnowledgeStep] VAPI upload successful:', vapiData);

      // Create database record
      const { data: knowledgeBase, error: dbError } = await supabase
        .from("knowledge_bases")
        .insert({
          name: knowledgeBaseName,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          user_id: user.id,
          vapi_id: vapiData.id,
          status: 'indexing'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      console.log('[KnowledgeStep] Knowledge base created:', knowledgeBase);
      toast.success('Knowledge base uploaded successfully');
      onKnowledgeBaseSelect(knowledgeBase.id);
      setFile(null);
      setKnowledgeBaseName("");
    } catch (error) {
      console.error('[KnowledgeStep] Upload error:', error);
      toast.error('Failed to upload knowledge base');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Choose Knowledge Base</CardTitle>
        <CardDescription>Select an existing knowledge base or upload a new one</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Knowledge Base</label>
          <Select
            value={selectedKnowledgeBase}
            onValueChange={onKnowledgeBaseSelect}
            disabled={isLoading || isUploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a knowledge base" />
            </SelectTrigger>
            <SelectContent>
              {knowledgeBases?.map((kb) => (
                <SelectItem key={kb.id} value={kb.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{kb.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && <p className="text-sm text-muted-foreground">Loading knowledge bases...</p>}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Or Upload New Knowledge Base</label>
          <Input
            type="text"
            placeholder="Enter knowledge base name"
            value={knowledgeBaseName}
            onChange={(e) => setKnowledgeBaseName(e.target.value)}
            disabled={isUploading || !!selectedKnowledgeBase}
          />
          <Input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isUploading || !!selectedKnowledgeBase}
          />
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, Word documents, text files, and Markdown
          </p>
          {!selectedKnowledgeBase && (
            <Button
              onClick={handleFileUpload}
              disabled={!file || !knowledgeBaseName.trim() || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Knowledge Base
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedKnowledgeBase}
        >
          Next
        </Button>
      </CardFooter>
    </>
  );
};