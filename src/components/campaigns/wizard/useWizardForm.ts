import { useState } from "react";
import { WizardStep } from "./types";
import { useCampaignForm } from "./hooks/useCampaignForm";
import { useAssistantData } from "./hooks/useAssistantData";
import { useCampaignSubmission } from "./hooks/useCampaignSubmission";

export const useWizardForm = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics');
  const { campaignData, setCampaignData } = useCampaignForm();
  const { assistants } = useAssistantData();
  const { isUploading, handleFileUpload, handleListSelection } = useCampaignSubmission();

  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event, campaignData);
  };

  const handleListSelectionWrapper = (listId: string) => {
    handleListSelection(listId, campaignData);
  };

  return {
    currentStep,
    setCurrentStep,
    campaignData,
    setCampaignData,
    isUploading,
    assistants,
    handleFileUpload: handleFileUploadWrapper,
    handleListSelection: handleListSelectionWrapper
  };
};