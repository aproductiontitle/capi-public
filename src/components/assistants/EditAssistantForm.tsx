import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useAssistantForm } from "./hooks/useAssistantForm";
import { AssistantFormTabs } from "./AssistantFormTabs";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Assistant } from "./types/assistant";

interface EditAssistantFormProps {
  assistant: Assistant;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditAssistantForm = ({ assistant, onSuccess, onCancel }: EditAssistantFormProps) => {
  const { form, onSubmit, isPending, isSuccess } = useAssistantForm({
    onSuccess,
    initialData: {
      name: assistant.name,
      systemPrompt: "",  // We'll need to fetch this from VAPI
      firstMessage: assistant.greeting_message,
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
    mode: 'edit',
    assistantId: assistant.id,
  });

  const [currentStep, setCurrentStep] = useState(0);

  // Reset form on successful submission
  useEffect(() => {
    if (isSuccess) {
      form.reset();
    }
  }, [isSuccess, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AssistantFormTabs form={form} currentStep={currentStep} />
        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending || !form.formState.isValid}
            className="bg-[#53DEB5] hover:bg-[#53DEB5]/90 text-black"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Assistant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { EditAssistantForm };