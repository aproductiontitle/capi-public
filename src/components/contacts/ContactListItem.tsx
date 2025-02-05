import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DeleteListDialog } from "./DeleteListDialog";
import { ViewListDialog } from "./ViewListDialog";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContactListItemProps {
  list: {
    id: string;
    name: string;
    description: string | null;
    contact_count: number;
  };
}

export const ContactListItem = ({ list }: ContactListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(list.name);

  const handleUpdateName = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("contact_lists")
        .update({ name: editedName })
        .eq("id", list.id);

      if (error) throw error;
      toast.success("List name updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating list name:", error);
      toast.error("Failed to update list name");
    }
  }, [editedName, list.id]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedName(list.name);
  }, [list.name]);

  return (
    <Card className="bg-card hover:bg-muted/50 transition-colors relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <ViewListDialog listId={list.id} listName={list.name}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </ViewListDialog>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <DeleteListDialog listId={list.id} listName={list.name}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DeleteListDialog>
      </div>

      <CardHeader>
        <div className="space-y-2 pr-24">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="max-w-[200px]"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdateName}
                disabled={!editedName.trim()}
              >
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          ) : (
            <CardTitle className="text-xl">{list.name}</CardTitle>
          )}
          {list.description && (
            <CardDescription>{list.description}</CardDescription>
          )}
          <p className="text-sm text-muted-foreground">
            {list.contact_count} contacts
          </p>
        </div>
      </CardHeader>
    </Card>
  );
};