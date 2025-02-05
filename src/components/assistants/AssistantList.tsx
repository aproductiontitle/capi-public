import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useVapiAssistants } from "./hooks/useVapiAssistants";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EditAssistantForm } from "./EditAssistantForm";
import { ScrollArea } from "@/components/ui/scroll-area";

const AssistantList = () => {
  const { assistants = [], isLoading, error, deleteAssistant } = useVapiAssistants();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading assistants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Error loading assistants</div>
      </div>
    );
  }

  const handleDelete = async (assistantId: string) => {
    try {
      await deleteAssistant.mutateAsync(assistantId);
      toast.success("Assistant deleted successfully");
    } catch (error) {
      console.error('Error deleting assistant:', error);
      toast.error("Failed to delete assistant");
    }
  };

  const handleSheetClose = (sheet: Element | null) => {
    if (sheet instanceof HTMLElement) {
      const closeButton = sheet.querySelector('[aria-label="Close"]');
      if (closeButton instanceof HTMLButtonElement) {
        closeButton.click();
      }
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assistants.map((assistant) => (
        <div 
          key={assistant.id} 
          className="p-6 space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md dark:border-gray-800 relative"
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{assistant.name}</DialogTitle>
                  <DialogDescription>Assistant Details</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6 py-4">
                    <div>
                      <h4 className="font-medium">System Prompt</h4>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {assistant.system_prompt || 'Not configured'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Greeting Message</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assistant.greeting_message}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">VAPI Assistant ID</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assistant.vapi_assistant_id || 'Not configured'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Created At</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(assistant.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-xl">
                <SheetHeader>
                  <SheetTitle>Edit Assistant</SheetTitle>
                  <SheetDescription>
                    Make changes to your assistant here. Click save when you're done.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                  <div className="pr-4">
                    <EditAssistantForm 
                      assistant={assistant} 
                      onSuccess={() => {
                        toast.success("Assistant updated successfully");
                        const sheet = document.querySelector('[data-state="open"]');
                        handleSheetClose(sheet);
                      }}
                    />
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this assistant? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(assistant.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div>
            <h3 className="text-lg font-semibold">{assistant.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {assistant.greeting_message}
            </p>
          </div>
        </div>
      ))}
      
      {assistants.length === 0 && (
        <div className="col-span-full text-center p-8 bg-card rounded-lg border dark:border-gray-800">
          <p className="text-muted-foreground">No assistants found. Create one to get started!</p>
        </div>
      )}
    </div>
  );
};

export default AssistantList;
