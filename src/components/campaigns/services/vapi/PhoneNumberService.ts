import { PhoneNumberOption, PhoneNumberProvider } from "../../types/phoneNumber";
import { VAPIClient } from "./VAPIClient";

export class PhoneNumberService {
  constructor(private client: VAPIClient) {}

  async getAvailablePhoneNumbers(areaCode?: string): Promise<PhoneNumberOption[]> {
    try {
      console.log('[PhoneNumberService] Fetching available phone numbers');
      
      const params = new URLSearchParams();
      if (areaCode) {
        params.append('numberDesiredAreaCode', areaCode);
      }

      const response = await this.client.makeRequest(
        `/phone-number?${params.toString()}`,
        { method: 'GET' }
      );

      const data = await response.json();
      console.log('[PhoneNumberService] Phone numbers response:', data);

      return (Array.isArray(data) ? data : []).map((number: any) => ({
        id: number.id || '',
        phoneNumber: number.number || number.phoneNumber || '',
        provider: (number.provider || 'vonage').toLowerCase() as PhoneNumberProvider,
        capabilities: Array.isArray(number.capabilities) ? number.capabilities : [],
        status: number.status || 'unknown',
        isAvailable: !number.assistantId,
        isDefault: false
      }));
    } catch (error) {
      console.error('[PhoneNumberService] Error fetching phone numbers:', error);
      throw error;
    }
  }

  async createPhoneNumber(phoneNumber: string, provider: PhoneNumberProvider, credentials: any): Promise<PhoneNumberOption> {
    try {
      console.log('[PhoneNumberService] Creating phone number');
      
      const response = await this.client.makeRequest('/phone-number', {
        method: 'POST',
        body: JSON.stringify({
          number: phoneNumber,
          provider: provider,
          ...credentials
        })
      });

      const data = await response.json();
      console.log('[PhoneNumberService] Create phone number response:', data);

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
      console.error('[PhoneNumberService] Error creating phone number:', error);
      throw error;
    }
  }

  async deletePhoneNumber(id: string): Promise<void> {
    try {
      console.log('[PhoneNumberService] Deleting phone number:', id);
      
      await this.client.makeRequest(`/phone-number/${id}`, {
        method: 'DELETE'
      });

      console.log('[PhoneNumberService] Phone number deleted successfully');
    } catch (error) {
      console.error('[PhoneNumberService] Error deleting phone number:', error);
      throw error;
    }
  }
}