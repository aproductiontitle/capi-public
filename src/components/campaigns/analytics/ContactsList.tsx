import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types/contacts";
import { CallStatus } from "../list/CallStatus";

interface ContactsListProps {
  contacts?: Contact[];
}

export const ContactsList = ({ contacts = [] }: ContactsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">
                  {contact.phone_number}
                </p>
              </div>
              <CallStatus contact={contact} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};