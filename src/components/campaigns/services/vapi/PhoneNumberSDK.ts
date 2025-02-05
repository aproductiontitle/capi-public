import { supabase } from "@/integrations/supabase/client";
import { PhoneNumberOption, PhoneNumberProvider } from "../../types/phoneNumber";

export class PhoneNumberSDK {
  private vapiKey: string | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const { data: vapiKeyData, error: keyError } = await supabase
      .from('secrets')
      .select('secret')
      .eq('name', 'VAPI_API_KEY')
      .single();

    if (keyError || !vapiKeyData?.secret) {
      console.error('Error fetching VAPI key:', keyError);
      throw new Error('VAPI API key not found');
    }

    this.vapiKey = vapiKeyData.secret;
    this.initialized = true;
    console.log('[PhoneNumberSDK] Successfully initialized');
  }

  async getAvailablePhoneNumbers(areaCode?: string): Promise<PhoneNumberOption[]> {
    if (!this.initialized) await this.initialize();

    try {
      console.log('[PhoneNumberSDK] Fetching available phone numbers');
      
      const params = new URLSearchParams();
      if (areaCode) {
        params.append('numberDesiredAreaCode', areaCode);
      }

      const response = await fetch('https://api.vapi.ai/phone-number', {
        headers: {
          'Authorization': `Bearer ${this.vapiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[PhoneNumberSDK] Error fetching phone numbers:', error);
        throw new Error(error.message || 'Failed to fetch phone numbers');
      }

      const data = await response.json();
      console.log('[PhoneNumberSDK] Phone numbers response:', data);

      return (Array.isArray(data) ? data : []).map((number: any) => ({
        id: number.id || '',
        phoneNumber: number.number || number.phoneNumber || '',
        provider: (number.provider || 'vonage').toLowerCase(),
        capabilities: Array.isArray(number.capabilities) ? number.capabilities : [],
        status: number.status || 'unknown',
        isAvailable: !number.assistantId,
        isDefault: false
      }));
    } catch (error) {
      console.error('[PhoneNumberSDK] Error:', error);
      throw error;
    }
  }

  async createPhoneNumber(phoneNumber: string, provider: PhoneNumberProvider, credentials: any): Promise<PhoneNumberOption> {
    if (!this.initialized) await this.initialize();

    try {
      console.log('[PhoneNumberSDK] Creating phone number');
      
      const response = await fetch('https://api.vapi.ai/phone-number', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vapiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: phoneNumber,
          provider: provider,
          ...credentials
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[PhoneNumberSDK] Error creating phone number:', error);
        throw new Error(error.message || 'Failed to create phone number');
      }

      const data = await response.json();
      console.log('[PhoneNumberSDK] Create phone number response:', data);

      return {
        id: data.id || '',
        phoneNumber: data.number || data.phoneNumber || '',
        provider: (data.provider || 'vonage').toLowerCase() as PhoneNumberProvider,
        capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
        status: data.status || 'unknown',
        isAvailable: !data.assistantId,
        isDefault: false
      };
    } catch (error) {
      console.error('[PhoneNumberSDK] Error creating phone number:', error);
      throw error;
    }
  }

  async deletePhoneNumber(id: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      console.log('[PhoneNumberSDK] Deleting phone number:', id);
      
      const response = await fetch(`https://api.vapi.ai/phone-number/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.vapiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[PhoneNumberSDK] Error deleting phone number:', error);
        throw new Error(error.message || 'Failed to delete phone number');
      }

      console.log('[PhoneNumberSDK] Phone number deleted successfully');
    } catch (error) {
      console.error('[PhoneNumberSDK] Error deleting phone number:', error);
      throw error;
    }
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();

    try {
      const response = await fetch(`https://api.vapi.ai/phone-number/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vapiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[PhoneNumberSDK] Validation error:', error);
        return false;
      }

      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      console.error('[PhoneNumberSDK] Validation error:', error);
      return false;
    }
  }
}

export const phoneNumberSDK = new PhoneNumberSDK();