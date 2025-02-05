import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Campaign } from "../types";
import { Edit, Trash2, Pause } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onPause: (id: string) => void;
  onEdit: (id: string) => void;
}

export const CampaignCard = ({ campaign, onDelete, onPause, onEdit }: CampaignCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card 
      className="bg-[#1B1B21] hover:bg-[#1B1B21]/90 transition-colors cursor-pointer relative group h-[200px] p-6"
      onClick={handleCardClick}
    >
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {campaign.status === 'scheduled' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => handleAction(e, () => onPause(campaign.id))}
          >
            <Pause className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => handleAction(e, () => onEdit(campaign.id))}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
          onClick={(e) => handleAction(e, () => onDelete(campaign.id))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{campaign.name}</h3>
          <p className="text-sm text-muted-foreground">
            Assistant: {campaign.assistant?.name}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="capitalize">{campaign.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Scheduled</span>
            <span>{new Date(campaign.scheduled_time).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};