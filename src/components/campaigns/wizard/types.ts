export type WizardStep = 'basics' | 'schedule' | 'contacts' | 'phone' | 'knowledge' | 'review';

export type LaunchType = 'scheduled' | 'immediate';

export interface Assistant {
  id: string;
  name: string;
  vapi_assistant_id?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  vapi_id?: string;
  status?: string;
}

export interface CampaignFormData {
  name: string;
  assistantId: string;
  selectedDate?: Date; // Made optional since it's not needed for immediate launches
  selectedTime: string;
  launchType: LaunchType;
  selectedListId?: string;
  selectedPhoneNumber?: string;
  timezone?: string;
  knowledgeBaseId?: string;
}

export interface ContactsStepProps {
  isUploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onSelectList: (listId: string) => void;
  selectedListId?: string;
  onNext?: () => void;
}