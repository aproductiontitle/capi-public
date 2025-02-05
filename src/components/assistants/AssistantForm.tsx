import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useAssistantForm } from "./hooks/useAssistantForm";
import { AssistantFormTabs } from "./AssistantFormTabs";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AssistantFormValues } from "./types/assistant";

interface AssistantFormProps {
  onSuccess?: () => void;
}

const AssistantForm = ({ onSuccess }: AssistantFormProps) => {
  const { form, onSubmit, isPending, isSuccess } = useAssistantForm({
    onSuccess,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Basic Info', 'Voice Configuration', 'AI Settings'];

  useEffect(() => {
    if (isSuccess) {
      form.reset();
      setCurrentStep(0);
    }
  }, [isSuccess, form]);

  const handleNext = () => {
    const currentFields = getCurrentStepFields();
    const isStepValid = currentFields.every(field => 
      form.getFieldState(field as keyof AssistantFormValues).isDirty && 
      !form.getFieldState(field as keyof AssistantFormValues).error
    );
    
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      currentFields.forEach(field => 
        form.trigger(field as keyof AssistantFormValues)
      );
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 0:
        return ['name', 'systemPrompt', 'firstMessage'] as const;
      case 1:
        return ['voiceProvider', 'voiceId', 'model'] as const;
      case 2:
        return ['provider', 'temperature', 'maxTokens'] as const;
      default:
        return [] as const;
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{steps[currentStep]}</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssistantFormTabs form={form} currentStep={currentStep} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-2">
              {!isLastStep ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#53DEB5] hover:bg-[#53DEB5]/90 text-black"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isPending || !form.formState.isValid}
                  className="bg-[#53DEB5] hover:bg-[#53DEB5]/90 text-black"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Assistant"
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export { AssistantForm };