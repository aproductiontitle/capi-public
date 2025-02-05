import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ContactListItem } from "./ContactListItem";
import { CreateListDialog } from "./CreateListDialog";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ContactLists = () => {
  const { data: lists, isLoading } = useQuery({
    queryKey: ["contact-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_lists")
        .select("*, contacts(count)");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[160px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <CreateListDialog>
          <Card className="flex h-[160px] flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer">
            <Plus className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Create New List</p>
            <p className="text-sm text-muted-foreground">
              Add a new contact list
            </p>
          </Card>
        </CreateListDialog>

        {lists?.map((list) => (
          <ContactListItem key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
};