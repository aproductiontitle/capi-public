import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Edit, Check, X, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  phone_number: string;
  email: string | null;
}

interface ViewListDialogProps {
  children: React.ReactNode;
  listId: string;
  listName: string;
}

export const ViewListDialog = ({ children, listId, listName }: ViewListDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Contact>>({});
  const [targetListId, setTargetListId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("list_id", listId);

      if (error) throw error;
      return data as Contact[];
    },
  });

  const { data: lists } = useQuery({
    queryKey: ["contact-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_lists")
        .select("*");

      if (error) throw error;
      return data.filter(list => list.id !== listId);
    },
  });

  const handleDeleteSelected = async () => {
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .in("id", selectedContacts);

      if (error) throw error;

      toast.success("Contacts deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contacts", listId] });
      setSelectedContacts([]);
    } catch (error) {
      console.error("Error deleting contacts:", error);
      toast.error("Failed to delete contacts");
    }
  };

  const handleMoveContacts = async () => {
    if (!targetListId) {
      toast.error("Please select a target list");
      return;
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .update({ list_id: targetListId })
        .in("id", selectedContacts);

      if (error) throw error;

      toast.success("Contacts moved successfully");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setSelectedContacts([]);
      setTargetListId("");
    } catch (error) {
      console.error("Error moving contacts:", error);
      toast.error("Failed to move contacts");
    }
  };

  const handleUpdateContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .update(editedValues)
        .eq("id", contactId);

      if (error) throw error;

      toast.success("Contact updated successfully");
      queryClient.invalidateQueries({ queryKey: ["contacts", listId] });
      setEditingContact(null);
      setEditedValues({});
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{listName} - Contacts</DialogTitle>
        </DialogHeader>
        {selectedContacts.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
            <Select value={targetListId} onValueChange={setTargetListId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Move to list..." />
              </SelectTrigger>
              <SelectContent>
                {lists?.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={handleMoveContacts}
              disabled={!targetListId}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Move Selected
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedContacts.length === contacts?.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContacts(contacts?.map(c => c.id) || []);
                        } else {
                          setSelectedContacts([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts?.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedContacts([...selectedContacts, contact.id]);
                          } else {
                            setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {editingContact === contact.id ? (
                        <Input
                          value={editedValues.first_name || contact.first_name}
                          onChange={(e) => setEditedValues({
                            ...editedValues,
                            first_name: e.target.value
                          })}
                        />
                      ) : (
                        contact.first_name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingContact === contact.id ? (
                        <Input
                          value={editedValues.last_name || contact.last_name || ""}
                          onChange={(e) => setEditedValues({
                            ...editedValues,
                            last_name: e.target.value
                          })}
                        />
                      ) : (
                        contact.last_name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingContact === contact.id ? (
                        <Input
                          value={editedValues.phone_number || contact.phone_number}
                          onChange={(e) => setEditedValues({
                            ...editedValues,
                            phone_number: e.target.value
                          })}
                        />
                      ) : (
                        contact.phone_number
                      )}
                    </TableCell>
                    <TableCell>
                      {editingContact === contact.id ? (
                        <Input
                          value={editedValues.email || contact.email || ""}
                          onChange={(e) => setEditedValues({
                            ...editedValues,
                            email: e.target.value
                          })}
                        />
                      ) : (
                        contact.email
                      )}
                    </TableCell>
                    <TableCell>
                      {editingContact === contact.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateContact(contact.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingContact(null);
                              setEditedValues({});
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingContact(contact.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from("contacts")
                                  .delete()
                                  .eq("id", contact.id);

                                if (error) throw error;
                                toast.success("Contact deleted successfully");
                                queryClient.invalidateQueries({ queryKey: ["contacts", listId] });
                              } catch (error) {
                                console.error("Error deleting contact:", error);
                                toast.error("Failed to delete contact");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};