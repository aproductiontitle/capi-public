import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";

interface EmotionDetectionProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const EmotionDetection = ({ form }: EmotionDetectionProps) => {
  return (
    <FormField
      control={form.control}
      name="detectEmotion"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between">
          <FormLabel>Detect Emotion</FormLabel>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};