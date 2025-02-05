import { CampaignError } from "../CampaignErrorHandler";
import { VAPIClient } from "./VAPIClient";

export class CallService {
  constructor(private client: VAPIClient) {}

  async initiateCall(
    contact: { id: string; phone_number: string },
    vapiAssistantId: string,
    phoneNumber: string,
    campaignId: string,
    knowledgeBaseId?: string | null
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      console.log('[CallService] Initiating call with params:', {
        contact,
        vapiAssistantId,
        phoneNumber,
        campaignId,
        knowledgeBaseId
      });

      const payload: any = {
        assistant: {
          id: vapiAssistantId,
          ...(knowledgeBaseId && { knowledgeBaseId })
        },
        phoneNumber: contact.phone_number,
        outboundNumber: phoneNumber,
        metadata: {
          campaignId,
          contactId: contact.id
        }
      };

      const response = await this.client.makeRequest('/calls', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[CallService] Call initiation failed:', error);
        throw new CampaignError(
          'TRANSIENT',
          'Failed to initiate call'
        );
      }

      const data = await response.json();
      console.log('[CallService] Call initiated successfully:', data);

      return {
        success: true,
        callId: data.id
      };
    } catch (error) {
      console.error('[CallService] Error initiating call:', error);
      if (error instanceof CampaignError) {
        throw error;
      }
      throw new CampaignError(
        'TRANSIENT',
        'Failed to initiate call'
      );
    }
  }
}