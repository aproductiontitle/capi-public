import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "./types/assistant";
import { VoiceProviderSelect } from "./voice-config/VoiceProviderSelect";
import { VoiceSelect } from "./voice-config/VoiceSelect";
import { ModelSelect } from "./voice-config/ModelSelect";
import { VoiceSettings } from "./voice-config/VoiceSettings";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssistantVoiceConfigProps {
  form: UseFormReturn<AssistantFormValues>;
}

const AssistantVoiceConfig = ({ form }: AssistantVoiceConfigProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-6 pr-4">
        <VoiceProviderSelect form={form} />
        <VoiceSelect form={form} />
        <ModelSelect form={form} />
        <VoiceSettings form={form} />
      </div>
    </ScrollArea>
  );
};

export default AssistantVoiceConfig;