import { z } from "zod";

export const assistantFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  systemPrompt: z.string()
    .min(10, "System prompt must be at least 10 characters")
    .max(1000, "System prompt must be less than 1000 characters"),
  firstMessage: z.string().min(1, "First message is required"),
  voiceProvider: z.string(),
  voiceId: z.string(),
  model: z.string(),
  stability: z.number().min(0).max(1),
  similarityBoost: z.number().min(0).max(1),
  styleExaggeration: z.number().min(0).max(1),
  optimizeStreamingLatency: z.boolean(),
  speakerBoost: z.boolean(),
  provider: z.string(),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(1).max(4000),
  detectEmotion: z.boolean(),
});

export type AssistantFormSchema = z.infer<typeof assistantFormSchema>;