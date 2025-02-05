export type PhoneNumberProvider = 'twilio' | 'vonage';

export interface PhoneNumberOption {
  id: string;
  phoneNumber: string;
  provider: PhoneNumberProvider;
  capabilities?: string[];
  status?: string;
  isAvailable: boolean;
  isDefault: boolean;
}

export interface PhoneNumberFormValues {
  phoneNumber: string;
  provider: PhoneNumberProvider;
  isDefault: boolean;
}