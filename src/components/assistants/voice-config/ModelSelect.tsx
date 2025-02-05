import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";

interface ModelSelectProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const ModelSelect = ({ form }: ModelSelectProps) => {
  const elevenLabsModels = [
    { id: "eleven_multilingual_v2", name: "Eleven Multilingual v2" },
    { id: "eleven_turbo_v2", name: "Eleven Turbo v2" },
    { id: "eleven_english_v1", name: "Eleven English v1" },
  ];

  return (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>ElevenLabs Model</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {elevenLabsModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};