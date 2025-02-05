import { Separator } from "@/components/ui/separator";
import { ContactLists } from "@/components/contacts/ContactLists";
import { CreateContactDialog } from "@/components/contacts/CreateContactDialog";
import { ImportContactsDialog } from "@/components/contacts/ImportContactsDialog";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

const Contacts = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contact lists and import contacts
          </p>
        </div>
        <Separator className="mt-4" />
      </div>

      <div className="flex justify-end gap-4">
        <ImportContactsDialog>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Contacts
          </Button>
        </ImportContactsDialog>
        <CreateContactDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </CreateContactDialog>
      </div>

      <ContactLists />
    </div>
  );
};

export default Contacts;