import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";
import { ProviderSelect } from "./ProviderSelect";
import { TemperatureControl } from "./TemperatureControl";
import { TokenLimit } from "./TokenLimit";
import { EmotionDetection } from "./EmotionDetection";

interface AIConfigWrapperProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const AIConfigWrapper = ({ form }: AIConfigWrapperProps) => {
  return (
    <div className="space-y-6">
      <ProviderSelect form={form} />
      <TemperatureControl form={form} />
      <TokenLimit form={form} />
      <EmotionDetection form={form} />
    </div>
  );
};