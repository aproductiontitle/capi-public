import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssistantFormValues } from "../types/assistant";
import { useAssistantFormSubmission } from "./useAssistantFormSubmission";
import { assistantFormSchema } from "./useAssistantFormValidation";

interface UseAssistantFormProps {
  onSuccess?: () => void;
  initialData?: AssistantFormValues;
  mode?: 'create' | 'edit';
  assistantId?: string;
}

export const useAssistantForm = ({
  onSuccess,
  initialData,
  mode = 'create',
  assistantId
}: UseAssistantFormProps = {}) => {
  const form = useForm<AssistantFormValues>({
    resolver: zodResolver(assistantFormSchema),
    defaultValues: initialData || {
      name: "",
      systemPrompt: "",
      firstMessage: "",
      voiceProvider: "11labs",
      voiceId: "",
      model: "eleven_multilingual_v2",
      stability: 0.5,
      similarityBoost: 0.5,
      styleExaggeration: 0.5,
      optimizeStreamingLatency: false,
      speakerBoost: false,
      provider: "openai",
      temperature: 0.7,
      maxTokens: 2000,
      detectEmotion: false,
    },
  });

  const { handleSubmit, isPending, isSuccess } = useAssistantFormSubmission({
    onSuccess,
    mode,
    assistantId
  });

  return {
    form,
    onSubmit: handleSubmit,
    isPending,
    isSuccess,
  };
};