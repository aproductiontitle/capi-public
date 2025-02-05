import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "./types/assistant";
import { BasicInfoWrapper } from "./basic-info/BasicInfoWrapper";
import AssistantVoiceConfig from "./AssistantVoiceConfig";
import { AIConfigWrapper } from "./ai-config/AIConfigWrapper";

interface AssistantFormTabsProps {
  form: UseFormReturn<AssistantFormValues>;
  currentStep: number;
}

export const AssistantFormTabs = ({ form, currentStep }: AssistantFormTabsProps) => {
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoWrapper form={form} />;
      case 1:
        return <AssistantVoiceConfig form={form} />;
      case 2:
        return <AIConfigWrapper form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderStep()}
    </div>
  );
};