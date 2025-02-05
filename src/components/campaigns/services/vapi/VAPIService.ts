import { PhoneNumberOption } from "../../types/phoneNumber";
import { VAPIClient } from "./VAPIClient";
import { PhoneNumberService } from "./PhoneNumberService";
import { CallService } from "./CallService";

export class VAPIService {
  private client: VAPIClient;
  private phoneNumberService: PhoneNumberService;
  private callService: CallService;
  private selectedPhoneNumber: string | null = null;
  private knowledgeBaseId: string | null = null;

  constructor() {
    this.client = new VAPIClient();
    this.phoneNumberService = new PhoneNumberService(this.client);
    this.callService = new CallService(this.client);
  }

  async initialize(): Promise<void> {
    await this.client.initialize();
  }

  async getAvailablePhoneNumbers(areaCode?: string): Promise<PhoneNumberOption[]> {
    return this.phoneNumberService.getAvailablePhoneNumbers(areaCode);
  }

  async initiateCall(
    contact: { id: string; phone_number: string },
    vapiAssistantId: string,
    campaignId: string
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    if (!this.selectedPhoneNumber) {
      throw new Error('No outbound phone number selected');
    }

    const params: any = {
      contact,
      vapiAssistantId,
      phoneNumber: this.selectedPhoneNumber,
      campaignId
    };

    if (this.knowledgeBaseId) {
      params.knowledgeBaseId = this.knowledgeBaseId;
    }

    return this.callService.initiateCall(
      contact,
      vapiAssistantId,
      this.selectedPhoneNumber,
      campaignId,
      this.knowledgeBaseId
    );
  }

  setPhoneNumber(phoneNumber: string): void {
    this.selectedPhoneNumber = phoneNumber;
  }

  setKnowledgeBase(knowledgeBaseId: string | null): void {
    this.knowledgeBaseId = knowledgeBaseId;
    console.log('[VAPIService] Knowledge base set:', knowledgeBaseId);
  }
}