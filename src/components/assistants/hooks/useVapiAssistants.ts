import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Assistant } from "@/types/assistants";

interface VAPIAssistant {
  id: string;
  name: string;
  greeting_message: string;
  system_prompt?: string;
  created_at: string;
  org_id?: string;
}

export const useVapiAssistants = () => {
  const queryClient = useQueryClient();

  const { data: assistants, isLoading, error } = useQuery({
    queryKey: ['vapi-assistants'],
    queryFn: async () => {
      try {
        const { data: secretData, error: secretError } = await supabase
          .from('secrets')
          .select('secret')
          .eq('name', 'VAPI_API_KEY')
          .maybeSingle();

        if (secretError || !secretData?.secret) {
          console.error('Error fetching VAPI key:', secretError);
          toast.error('Please configure your VAPI API key in settings');
          return [];
        }

        console.log('Fetching VAPI assistants...');
        const response = await fetch('https://api.vapi.ai/assistant', {
          headers: {
            'Authorization': `Bearer ${secretData.secret}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('VAPI API error:', error);
          throw new Error(error.message || 'Failed to fetch assistants');
        }

        const data = await response.json();
        console.log('VAPI assistants response:', data);
        
        // Transform the VAPI response to match our expected format
        return data.map((assistant: VAPIAssistant) => ({
          ...assistant,
          vapi_assistant_id: assistant.id // Map VAPI's id to our vapi_assistant_id
        }));
      } catch (error) {
        console.error('Error in useVapiAssistants:', error);
        toast.error('Failed to fetch VAPI assistants');
        return [];
      }
    },
  });

  const deleteAssistant = useMutation({
    mutationFn: async (assistantId: string) => {
      const { data: secretData } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'VAPI_API_KEY')
        .maybeSingle();

      if (!secretData?.secret) {
        throw new Error('VAPI API key not found');
      }

      const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${secretData.secret}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete assistant');
      }

      // Also delete from our database
      await supabase
        .from('assistants')
        .delete()
        .eq('vapi_assistant_id', assistantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vapi-assistants'] });
    },
  });

  return {
    assistants,
    isLoading,
    error,
    deleteAssistant,
  };
};