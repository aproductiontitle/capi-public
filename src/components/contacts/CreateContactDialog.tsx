import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateContactDialogProps {
  children: React.ReactNode;
}

export const CreateContactDialog = ({ children }: CreateContactDialogProps) => {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  const createContactMutation = useMutation({
    mutationFn: async () => {
      if (!selectedListId) {
        throw new Error("Please select a contact list");
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          email: email || null,
          list_id: selectedListId
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success("Contact created successfully");
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create contact");
    }
  });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setEmail("");
    setSelectedListId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListId) {
      toast.error("Please select a contact list");
      return;
    }
    createContactMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list">Contact List</Label>
            <Select
              value={selectedListId || ""}
              onValueChange={setSelectedListId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                {contactLists?.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              type="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createContactMutation.isPending || !selectedListId}
            >
              Create Contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};