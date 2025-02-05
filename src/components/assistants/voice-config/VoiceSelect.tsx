import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AssistantFormValues } from "../types/assistant";

interface VoiceSelectProps {
  form: UseFormReturn<AssistantFormValues>;
}

export const VoiceSelect = ({ form }: VoiceSelectProps) => {
  const voices = [
    { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
    { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
    { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam" },
  ];

  return (
    <FormField
      control={form.control}
      name="voiceId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Voice</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};