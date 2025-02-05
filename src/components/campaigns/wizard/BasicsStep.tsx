import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Assistant, CampaignFormData } from "./types";

interface BasicsStepProps {
  campaignData: CampaignFormData;
  onDataChange: (data: Partial<CampaignFormData>) => void;
  onNext: () => void;
  assistants: Assistant[] | undefined;
}

export const BasicsStep = ({ campaignData, onDataChange, onNext, assistants }: BasicsStepProps) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
        <CardDescription>Enter the basic information for your campaign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Campaign Name</label>
          <Input
            value={campaignData.name}
            onChange={(e) => onDataChange({ name: e.target.value })}
            placeholder="Enter campaign name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Select Assistant</label>
          <Select
            value={campaignData.assistantId}
            onValueChange={(value) => onDataChange({ assistantId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an assistant" />
            </SelectTrigger>
            <SelectContent>
              {assistants?.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          onClick={onNext}
          disabled={!campaignData.name || !campaignData.assistantId}
        >
          Next
        </Button>
      </CardFooter>
    </>
  );
};