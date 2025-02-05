import { useState } from "react";
import { AssistantFormValues } from "../types/assistant";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface UseAssistantFormSubmissionProps {
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  assistantId?: string;
}

export const useAssistantFormSubmission = ({
  onSuccess,
  mode = 'create',
  assistantId
}: UseAssistantFormSubmissionProps = {}) => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (values: AssistantFormValues) => {
    try {
      setIsPending(true);
      setIsSuccess(false);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Check for required API keys
      const { data: secrets, error: secretsError } = await supabase
        .from('secrets')
        .select('name, secret')
        .in('name', ['VAPI_API_KEY', 'ELEVEN_LABS_API_KEY'])
        .eq('user_id', user.id);

      if (secretsError) throw secretsError;

      const vapiKey = secrets?.find(s => s.name === 'VAPI_API_KEY')?.secret;
      const elevenLabsKey = secrets?.find(s => s.name === 'ELEVEN_LABS_API_KEY')?.secret;

      if (!vapiKey || !elevenLabsKey) {
        toast({
          title: "Missing API Keys",
          description: "Please configure your VAPI and ElevenLabs API keys in the settings page",
          variant: "destructive",
        });
        return;
      }

      const voiceConfig = {
        provider: values.voiceProvider,
        model: values.model,
        voiceId: values.voiceId || "21m00Tcm4TlvDq8ikWAM"
      };

      if (mode === 'edit' && assistantId) {
        await handleEdit(assistantId, values, vapiKey, voiceConfig);
      } else {
        await handleCreate(values, vapiKey, voiceConfig, user.id);
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: mode === 'edit' ? "Assistant updated successfully" : "Assistant created successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['assistants'] });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error with assistant:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    handleSubmit,
    isPending,
    isSuccess,
  };
};

async function handleEdit(
  assistantId: string,
  values: AssistantFormValues,
  vapiKey: string,
  voiceConfig: any
) {
  const { data: assistant } = await supabase
    .from('assistants')
    .select('vapi_assistant_id')
    .eq('id', assistantId)
    .single();

  if (!assistant?.vapi_assistant_id) {
    throw new Error('Assistant not found or VAPI ID missing');
  }

  const vapiResponse = await fetch(`https://api.vapi.ai/assistant/${assistant.vapi_assistant_id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${vapiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: values.name,
      model: {
        provider: values.provider,
        model: "gpt-3.5-turbo",
        temperature: values.temperature,
        functions: [],
        systemPrompt: values.systemPrompt
      },
      voice: voiceConfig,
      firstMessage: values.firstMessage,
    }),
  });

  if (!vapiResponse.ok) {
    const errorData = await vapiResponse.json();
    throw new Error(errorData.message || 'Failed to update VAPI assistant');
  }

  const { error } = await supabase
    .from("assistants")
    .update({
      name: values.name,
      greeting_message: values.firstMessage,
      system_prompt: values.systemPrompt,
    })
    .eq('id', assistantId);

  if (error) throw error;
}

async function handleCreate(
  values: AssistantFormValues,
  vapiKey: string,
  voiceConfig: any,
  userId: string
) {
  const vapiResponse = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vapiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: values.name,
      model: {
        provider: values.provider,
        model: "gpt-3.5-turbo",
        temperature: values.temperature,
        functions: [],
        systemPrompt: values.systemPrompt
      },
      voice: voiceConfig,
      firstMessage: values.firstMessage,
    }),
  });

  if (!vapiResponse.ok) {
    const errorData = await vapiResponse.json();
    throw new Error(errorData.message || 'Failed to create VAPI assistant');
  }

  const vapiAssistant = await vapiResponse.json();

  const { error } = await supabase
    .from("assistants")
    .insert({
      user_id: userId,
      name: values.name,
      greeting_message: values.firstMessage,
      system_prompt: values.systemPrompt,
      vapi_assistant_id: vapiAssistant.id
    });

  if (error) throw error;
}