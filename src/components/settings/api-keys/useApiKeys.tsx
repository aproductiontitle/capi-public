import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export interface ApiKey {
  name: string;
  displayName: string;
  value: string;
  savedValue: string | null;
  isVisible: boolean;
}

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { name: 'ELEVEN_LABS_API_KEY', displayName: 'ElevenLabs API Key', value: '', savedValue: null, isVisible: false },
    { name: 'OPENAI_API_KEY', displayName: 'OpenAI API Key', value: '', savedValue: null, isVisible: false },
    { name: 'VAPI_API_KEY', displayName: 'VAPI API Key', value: '', savedValue: null, isVisible: false },
    { name: 'GHL_API_KEY', displayName: 'Go High Level API Key', value: '', savedValue: null, isVisible: false }
  ]);
  
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [testingStates, setTestingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadSavedKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: secrets, error } = await supabase
        .from('secrets')
        .select('name, secret')
        .eq('user_id', user.id);

      if (error) throw error;

      setApiKeys(prevKeys => prevKeys.map(key => {
        const savedSecret = secrets?.find(s => s.name === key.name);
        return {
          ...key,
          savedValue: savedSecret?.secret || null,
          value: ''
        };
      }));
    } catch (error) {
      console.error('Error loading saved keys:', error);
      toast({
        title: "Error",
        description: "Failed to load saved API keys",
        variant: "destructive",
      });
    }
  };

  const toggleKeyVisibility = (keyName: string) => {
    setApiKeys(prevKeys => prevKeys.map(key => 
      key.name === keyName ? { ...key, isVisible: !key.isVisible } : key
    ));
  };

  const handleApiKeyChange = (keyName: string, value: string) => {
    setApiKeys(prevKeys => prevKeys.map(key => 
      key.name === keyName ? { ...key, value } : key
    ));
  };

  const testApiKey = async (keyName: string, value: string) => {
    setTestingStates(prev => ({ ...prev, [keyName]: true }));
    try {
      let isValid = false;
      
      switch (keyName) {
        case 'VAPI_API_KEY':
          const vapiResponse = await fetch('https://api.vapi.ai/assistant/list', {
            headers: { Authorization: `Bearer ${value}` }
          });
          isValid = vapiResponse.ok;
          break;
        case 'ELEVEN_LABS_API_KEY':
          const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': value }
          });
          isValid = elevenLabsResponse.ok;
          break;
        case 'OPENAI_API_KEY':
          const openaiResponse = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${value}` }
          });
          isValid = openaiResponse.ok;
          break;
        case 'GHL_API_KEY':
          const ghlResponse = await fetch('https://services.leadconnectorhq.com/locations/', {
            headers: { 
              'Authorization': `Bearer ${value}`,
              'Version': '2021-07-28'
            }
          });
          isValid = ghlResponse.ok;
          break;
      }

      toast({
        title: isValid ? "Success" : "Error",
        description: isValid ? "API key is valid" : "Invalid API key",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test API key",
        variant: "destructive",
      });
    } finally {
      setTestingStates(prev => ({ ...prev, [keyName]: false }));
    }
  };

  const saveApiKey = async (keyName: string, value: string) => {
    if (!value.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key to save",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingStates(prev => ({ ...prev, [keyName]: true }));
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to save your API key",
          variant: "destructive",
        });
        return;
      }

      const { data: existingSecret } = await supabase
        .from('secrets')
        .select('id')
        .eq('name', keyName)
        .eq('user_id', user.id)
        .single();

      let result;
      
      if (existingSecret) {
        result = await supabase
          .from('secrets')
          .update({ secret: value })
          .eq('id', existingSecret.id);
      } else {
        result = await supabase
          .from('secrets')
          .insert({
            name: keyName,
            secret: value,
            user_id: user.id,
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `${keyName.replace(/_/g, ' ')} saved successfully`,
      });
      
      setApiKeys(prevKeys => prevKeys.map(key => 
        key.name === keyName ? { ...key, savedValue: value, value: '' } : key
      ));
    } catch (error: any) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, [keyName]: false }));
    }
  };

  useEffect(() => {
    loadSavedKeys();
  }, []);

  return {
    apiKeys,
    savingStates,
    testingStates,
    toggleKeyVisibility,
    handleApiKeyChange,
    testApiKey,
    saveApiKey
  };
};