import { useState } from "react";
import { CampaignFormData } from "../types";

export const useCampaignForm = () => {
  const [campaignData, setCampaignData] = useState<CampaignFormData>({
    name: '',
    assistantId: '',
    selectedDate: undefined,
    selectedTime: '12:00',
    launchType: 'scheduled',
    selectedListId: undefined,
    selectedPhoneNumber: undefined,
    timezone: 'UTC',
    knowledgeBaseId: undefined
  });

  return {
    campaignData,
    setCampaignData,
  };
};