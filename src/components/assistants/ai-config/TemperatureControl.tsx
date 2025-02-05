import { Slider } from "@/components/ui/slider";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";

interface TemperatureControlProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const TemperatureControl = ({ form }: TemperatureControlProps) => {
  return (
    <FormField
      control={form.control}
      name="temperature"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Temperature ({field.value})</FormLabel>
          <FormControl>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={[field.value]}
              onValueChange={([value]) => field.onChange(value)}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};