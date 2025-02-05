import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, List } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContactsStepProps } from "./types";
import { useEffect } from "react";

export const ContactsStep = ({ 
  isUploading, 
  onFileUpload, 
  onBack, 
  onSelectList,
  selectedListId,
  onNext 
}: ContactsStepProps) => {
  const { data: contactLists, isLoading } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_lists')
        .select('*');
      
      if (error) {
        toast.error("Failed to fetch contact lists");
        throw error;
      }
      
      return data;
    }
  });

  // Determine if we can proceed to the next step
  const canProceed = (selectedListId && selectedListId.length > 0) || isUploading;

  // Debug logging
  useEffect(() => {
    console.log('ContactsStep state:', {
      selectedListId,
      isUploading,
      canProceed
    });
  }, [selectedListId, isUploading, canProceed]);

  const handleNext = () => {
    if (!canProceed) {
      toast.error("Please select a contact list or upload a file");
      return;
    }
    onNext?.();
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedListId) {
      toast.error("Please clear contact list selection before uploading a file");
      return;
    }
    onFileUpload(e);
  };

  const handleListSelection = (value: string) => {
    if (isUploading) {
      toast.error("Please cancel file upload before selecting a list");
      return;
    }
    onSelectList(value);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Choose Contacts</CardTitle>
        <CardDescription>Select a contact list or upload new contacts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Contact List</label>
          <Select
            value={selectedListId}
            onValueChange={handleListSelection}
            disabled={isLoading || isUploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a contact list" />
            </SelectTrigger>
            <SelectContent>
              {contactLists?.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>{list.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && <p className="text-sm text-muted-foreground">Loading contact lists...</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Or Upload New Contacts</label>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUploadChange}
            disabled={isUploading || !!selectedListId}
          />
          <p className="text-sm text-muted-foreground">
            CSV must include 'name' and 'phone' columns
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
        >
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next
        </Button>
      </CardFooter>
    </>
  );
};