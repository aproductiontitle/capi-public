import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";

interface VoiceProviderSelectProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const VoiceProviderSelect = ({ form }: VoiceProviderSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="voiceProvider"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Voice Provider</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled
          >
            <SelectTrigger>
              <SelectValue placeholder="Select voice provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11labs">ElevenLabs (Active)</SelectItem>
              <SelectItem value="aws" disabled>AWS Polly (Coming Soon)</SelectItem>
              <SelectItem value="gcp" disabled>Google Cloud TTS (Coming Soon)</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};