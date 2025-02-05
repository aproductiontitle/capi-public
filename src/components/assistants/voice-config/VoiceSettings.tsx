import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";

interface VoiceSettingsProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const VoiceSettings = ({ form }: VoiceSettingsProps) => {
  return (
    <>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="stability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stability ({field.value})</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="similarityBoost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clarity + Similarity ({field.value})</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="styleExaggeration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style Exaggeration ({field.value})</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="optimizeStreamingLatency"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Optimize Streaming Latency</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="speakerBoost"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Speaker Boost</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
};