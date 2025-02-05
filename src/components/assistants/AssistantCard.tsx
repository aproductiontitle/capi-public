import { Assistant } from '@/types/assistants';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssistantCardProps {
  assistant: Assistant;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const AssistantCard = ({ assistant, onDelete, onEdit }: AssistantCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/assistants/${assistant.id}`);
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
          className="h-8 w-8 p-0 hover:bg-[#53DEB5]/10"
          onClick={(e) => handleAction(e, () => onEdit(assistant.id))}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={(e) => handleAction(e, () => onDelete(assistant.id))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{assistant.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assistant.greeting_message}
          </p>
          <p className="text-sm text-muted-foreground">
            Created: {new Date(assistant.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};