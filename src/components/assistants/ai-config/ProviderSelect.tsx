import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";

interface ProviderSelectProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const ProviderSelect = ({ form }: ProviderSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="provider"
      render={({ field }) => (
        <FormItem>
          <FormLabel>AI Provider</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled
          >
            <SelectTrigger>
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (Active)</SelectItem>
              <SelectItem value="anthropic" disabled>Anthropic (Coming Soon)</SelectItem>
              <SelectItem value="google" disabled>Google AI (Coming Soon)</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};