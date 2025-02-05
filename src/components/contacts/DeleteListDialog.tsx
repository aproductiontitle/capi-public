import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteListDialogProps {
  children: React.ReactNode;
  listId: string;
  listName: string;  // Added listName to props
}

export const DeleteListDialog = ({ children, listId, listName }: DeleteListDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("contact_lists")
        .delete()
        .eq("id", listId);

      if (error) throw error;

      toast.success("Contact list deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete contact list");
    } finally {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {listName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the contact
            list and all its contacts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};