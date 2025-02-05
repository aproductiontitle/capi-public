import { Badge } from "@/components/ui/badge";
import { Contact } from "@/types/contacts";

interface CallStatusProps {
  contact: Contact;
}

export const CallStatus = ({ contact }: CallStatusProps) => {
  const getStatusColor = () => {
    switch (contact.status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "processing":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Badge variant="secondary" className={getStatusColor()}>
      {contact.status}
    </Badge>
  );
};