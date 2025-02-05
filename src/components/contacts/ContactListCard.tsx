import { ContactList } from '@/types/contacts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContactListCardProps {
  list: ContactList;
  onDelete: (id: string) => void;
}

export const ContactListCard = ({ list, onDelete }: ContactListCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/contacts/${list.id}`);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card 
      className="bg-[#1B1B21] hover:bg-[#1B1B21]/90 transition-colors cursor-pointer relative group h-[200px]"
      onClick={handleCardClick}
    >
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => handleAction(e, () => navigate(`/contacts/${list.id}/edit`))}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={(e) => handleAction(e, () => onDelete(list.id))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{list.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {list.description}
          </p>
          <p className="text-sm text-muted-foreground">
            Contacts: {list.contact_count}
          </p>
          <p className="text-sm text-muted-foreground">
            Created: {new Date(list.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};