import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { AssistantFormValues } from "../types/assistant";

interface BasicInfoWrapperProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const BasicInfoWrapper = ({ form }: BasicInfoWrapperProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assistant Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter assistant name" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="systemPrompt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>System Prompt</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter the system prompt that defines your assistant's behavior"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              This prompt defines your assistant's personality and behavior during calls.
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="firstMessage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Message</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter the first message your assistant will say"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};