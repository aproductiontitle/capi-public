import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardStep } from "./types";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCampaignSubmission } from "./hooks/useCampaignSubmission";
import { useNavigate } from "react-router-dom";

interface ReviewStepProps {
  campaignData: {
    name: string;
    assistantId: string;
    selectedDate?: Date;
    selectedTime: string;
    launchType: 'scheduled' | 'immediate';
    selectedListId?: string;
    selectedPhoneNumber?: string;
    timezone?: string;
    knowledgeBaseId?: string;
  };
  onBack: () => void;
  onEditStep: (step: WizardStep) => void;
}

export const ReviewStep = ({ campaignData, onBack, onEditStep }: ReviewStepProps) => {
  const { submitCampaign } = useCampaignSubmission();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // For scheduled campaigns, ensure we have a date
      if (campaignData.launchType === 'scheduled' && !campaignData.selectedDate) {
        toast.error("Please select a date for scheduled campaigns");
        return;
      }

      const result = await submitCampaign(campaignData);
      
      if (result) {
        toast.success(
          campaignData.launchType === 'immediate' 
            ? "Campaign launched successfully" 
            : "Campaign scheduled successfully"
        );
        navigate('/campaigns');
      } else {
        toast.error("Failed to submit campaign");
      }
    } catch (error) {
      toast.error("Failed to submit campaign");
      console.error("Campaign submission error:", error);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Review Campaign</CardTitle>
        <CardDescription>
          Review your campaign settings before {campaignData.launchType === 'immediate' ? 'launching' : 'scheduling'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Campaign Name</p>
                <p className="font-medium">{campaignData.name}</p>
              </div>
              <div className="text-right">
                <Button 
                  variant="link" 
                  onClick={() => onEditStep('basics')}
                  className="text-[#53DEB5] hover:text-[#53DEB5]/80"
                >
                  Edit
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Knowledge Base</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Selected Knowledge Base</p>
                <p className="font-medium">{campaignData.knowledgeBaseId || 'None'}</p>
              </div>
              <div className="text-right">
                <Button 
                  variant="link" 
                  onClick={() => onEditStep('knowledge')}
                  className="text-[#53DEB5] hover:text-[#53DEB5]/80"
                >
                  Edit
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Schedule</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Launch Type</p>
                <p className="font-medium capitalize">{campaignData.launchType}</p>
                {campaignData.launchType === 'scheduled' && (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">Date & Time</p>
                    <p className="font-medium">
                      {campaignData.selectedDate && format(campaignData.selectedDate, 'PPP')} at {campaignData.selectedTime}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Timezone</p>
                    <p className="font-medium">{campaignData.timezone}</p>
                  </>
                )}
              </div>
              <div className="text-right">
                <Button 
                  variant="link" 
                  onClick={() => onEditStep('schedule')}
                  className="text-[#53DEB5] hover:text-[#53DEB5]/80"
                >
                  Edit
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Phone Number</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Selected Number</p>
                <p className="font-medium">{campaignData.selectedPhoneNumber}</p>
              </div>
              <div className="text-right">
                <Button 
                  variant="link" 
                  onClick={() => onEditStep('phone')}
                  className="text-[#53DEB5] hover:text-[#53DEB5]/80"
                >
                  Edit
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Contacts</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Contact List</p>
                <p className="font-medium">{campaignData.selectedListId || 'None'}</p>
              </div>
              <div className="text-right">
                <Button 
                  variant="link" 
                  onClick={() => onEditStep('contacts')}
                  className="text-[#53DEB5] hover:text-[#53DEB5]/80"
                >
                  Edit
                </Button>
              </div>
            </div>
          </section>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-[#53DEB5] hover:bg-[#53DEB5]/90 text-white"
        >
          {campaignData.launchType === 'immediate' ? 'Launch Campaign' : 'Schedule Campaign'}
        </Button>
      </CardFooter>
    </>
  );
};