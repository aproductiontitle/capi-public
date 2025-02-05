import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const ImportContactsDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [selectedList, setSelectedList] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: lists } = useQuery({
    queryKey: ["contact-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_lists")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedList) {
      toast.error("Please select a list and file");
      return;
    }

    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = text.split("\n").map(row => row.split(","));
      const headers = rows[0].map(header => header.trim().toLowerCase());

      if (!headers.includes("first_name") || !headers.includes("phone_number")) {
        toast.error("CSV must include 'first_name' and 'phone_number' columns");
        return;
      }

      const contacts = rows.slice(1).map(row => ({
        list_id: selectedList,
        first_name: row[headers.indexOf("first_name")].trim(),
        last_name: row[headers.indexOf("last_name")]?.trim() || null,
        phone_number: row[headers.indexOf("phone_number")].trim(),
        email: headers.includes("email") ? row[headers.indexOf("email")].trim() || null : null,
        source: "import"
      }));

      const { error } = await supabase
        .from("contacts")
        .insert(contacts);

      if (error) throw error;

      toast.success("Contacts imported successfully");
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
      setOpen(false);
      setSelectedList("");
    } catch (error) {
      console.error("Error importing contacts:", error);
      toast.error("Failed to import contacts");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="list" className="text-sm font-medium">
              Select List
            </label>
            <Select value={selectedList} onValueChange={setSelectedList} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                {lists?.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload CSV</label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading || !selectedList}
            />
            <p className="text-sm text-muted-foreground">
              CSV must include 'first_name' and 'phone_number' columns
            </p>
          </div>
          {isUploading && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};