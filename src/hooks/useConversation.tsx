import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type ConversationState = {
  messages: Message[];
  isProcessing: boolean;
  currentAssistantId: string | null;
};

export const useConversation = () => {
  const { toast } = useToast();
  const [state, setState] = useState<ConversationState>({
    messages: [],
    isProcessing: false,
    currentAssistantId: null,
  });

  const addMessage = useCallback((content: string, role: 'user' | 'assistant') => {
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: crypto.randomUUID(),
          content,
          role,
          timestamp: new Date(),
        },
      ],
    }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing }));
  }, []);

  const setCurrentAssistant = useCallback((assistantId: string | null) => {
    setState(prev => ({ ...prev, currentAssistantId: assistantId }));
  }, []);

  const clearConversation = useCallback(() => {
    setState({
      messages: [],
      isProcessing: false,
      currentAssistantId: null,
    });
  }, []);

  const processUserMessage = useCallback(async (message: string) => {
    if (!state.currentAssistantId) {
      toast({
        title: "Error",
        description: "No assistant selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      addMessage(message, 'user');

      // Get assistant response
      const { data: response, error: chatError } = await supabase.functions.invoke('assistant-chat', {
        body: { message, assistantId: state.currentAssistantId },
      });

      if (chatError) throw chatError;

      const reply = response.reply;
      addMessage(reply, 'assistant');

      // Synthesize speech
      const { data: voiceData, error: voiceError } = await supabase.functions.invoke('voice-synthesis', {
        body: { text: reply, voiceId: 'EXAVITQu4vr4xnSDxMaL' }, // Using Sarah's voice as default
      });

      if (voiceError) throw voiceError;

      if (voiceData.audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(voiceData.audio), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
      }

    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }, [state.currentAssistantId, addMessage, setProcessing, toast]);

  return {
    messages: state.messages,
    isProcessing: state.isProcessing,
    currentAssistantId: state.currentAssistantId,
    addMessage,
    setProcessing,
    setCurrentAssistant,
    clearConversation,
    processUserMessage,
  };
};