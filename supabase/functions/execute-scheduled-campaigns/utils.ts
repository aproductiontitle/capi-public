import { ValidationResult, VapiCallConfig } from './types.ts';

export const formatPhoneNumber = (phone: string): string | null => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return null;
  
  return cleaned.startsWith('1') 
    ? `+${cleaned}`
    : `+1${cleaned}`;
};

export const validateConfiguration = async (supabase: any, campaign: any): Promise<ValidationResult> => {
  console.log(`Validating configuration for campaign ${campaign.id}`);

  if (!campaign.assistant?.vapi_assistant_id) {
    return {
      isValid: false,
      error: 'Missing VAPI assistant configuration'
    };
  }

  // Get API keys for the campaign owner
  const { data: keys, error: keysError } = await supabase
    .from('secrets')
    .select('name, secret')
    .eq('name', 'VAPI_API_KEY')
    .eq('user_id', campaign.user_id)
    .single();

  if (keysError) {
    console.error('Error fetching API keys:', keysError);
    return {
      isValid: false,
      error: `Error fetching API keys: ${keysError.message}`
    };
  }

  if (!keys?.secret) {
    return {
      isValid: false,
      error: 'Missing VAPI API key'
    };
  }

  // Validate VAPI key and assistant
  try {
    console.log('Validating VAPI configuration...');
    const response = await fetch('https://api.vapi.ai/assistant', {
      headers: {
        'Authorization': `Bearer ${keys.secret}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('VAPI validation failed:', errorData);
      return {
        isValid: false,
        error: `VAPI validation failed: ${errorData.message || 'Unknown error'}`
      };
    }

    const assistants = await response.json();
    const hasValidAssistant = assistants.some((a: any) => a.id === campaign.assistant.vapi_assistant_id);
    
    if (!hasValidAssistant) {
      return {
        isValid: false,
        error: 'Invalid VAPI assistant configuration'
      };
    }
  } catch (error) {
    console.error('Error validating VAPI configuration:', error);
    return {
      isValid: false,
      error: `VAPI validation error: ${error.message}`
    };
  }

  return {
    isValid: true,
    vapiKey: keys.secret
  };
};

export const createVapiCallConfig = (
  contact: any,
  campaign: any,
  vapiKey: string,
  webhookBaseUrl: string
): VapiCallConfig => {
  return {
    assistant: {
      id: campaign.assistant.vapi_assistant_id,
      model: "gpt-4",
      systemPrompt: "You are making a phone call.",
      functions: [{
        name: "end_call",
        description: "End the call",
        parameters: { type: "object", properties: {} }
      }]
    },
    webhook: {
      url: `${webhookBaseUrl}/functions/v1/vapi-webhook`,
      headers: {
        'Authorization': `Bearer ${vapiKey}`
      }
    },
    errorWebhook: {
      url: `${webhookBaseUrl}/functions/v1/vapi-error`,
      headers: {
        'Authorization': `Bearer ${vapiKey}`
      }
    },
    config: {
      realtime_transcription: true,
      barge_in: true,
      silence_timeout_ms: 3000
    },
    metadata: {
      contactId: contact.id,
      campaignId: campaign.id
    }
  };
};