import { Campaign } from '@/types/campaigns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface CampaignHeaderProps {
  campaign: Campaign;
}

export const CampaignHeader = ({ campaign }: CampaignHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{campaign.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div>
            <p>Status: {campaign.status}</p>
            <p>Scheduled Time: {new Date(campaign.scheduled_time).toLocaleString()}</p>
          </div>
          {campaign.execution_error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{campaign.execution_error}</AlertDescription>
            </Alert>
          )}
          {!campaign.execution_error && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Ready to Execute</AlertTitle>
              <AlertDescription>The campaign is scheduled and ready for execution.</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
