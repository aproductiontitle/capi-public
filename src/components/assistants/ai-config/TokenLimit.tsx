import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";

interface TokenLimitProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const TokenLimit = ({ form }: TokenLimitProps) => {
  return (
    <FormField
      control={form.control}
      name="maxTokens"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Max Tokens</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={1}
              max={4000}
              {...field}
              onChange={e => field.onChange(parseInt(e.target.value))}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};