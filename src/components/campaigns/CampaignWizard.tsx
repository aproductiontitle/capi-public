import { Card } from "@/components/ui/card";
import { BasicsStep } from "./wizard/BasicsStep";
import { ScheduleStep } from "./wizard/ScheduleStep";
import { ContactsStep } from "./wizard/ContactsStep";
import { PhoneStep } from "./wizard/PhoneStep";
import { KnowledgeStep } from "./wizard/KnowledgeStep";
import { ReviewStep } from "./wizard/ReviewStep";
import { useWizardForm } from "./wizard/useWizardForm";
import { useEffect } from "react";

export const CampaignWizard = () => {
  const {
    currentStep,
    setCurrentStep,
    campaignData,
    setCampaignData,
    isUploading,
    assistants,
    handleFileUpload,
    handleListSelection
  } = useWizardForm();

  const handleDataChange = (data: Partial<typeof campaignData>) => {
    setCampaignData({ ...campaignData, ...data });
  };

  const validateBasicsStep = () => {
    return !!campaignData.name && !!campaignData.assistantId;
  };

  const validateKnowledgeStep = () => {
    return !!campaignData.knowledgeBaseId;
  };

  const validateScheduleStep = () => {
    if (campaignData.launchType === 'immediate') return true;
    return !!campaignData.selectedDate && !!campaignData.selectedTime && !!campaignData.timezone;
  };

  const validatePhoneStep = () => {
    return !!campaignData.selectedPhoneNumber;
  };

  const validateContactsStep = () => {
    const hasValidList = !!campaignData.selectedListId && campaignData.selectedListId.length > 0;
    console.log('Validating contacts step:', { hasValidList, isUploading });
    return hasValidList || isUploading;
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('CampaignWizard state:', {
      currentStep,
      selectedListId: campaignData.selectedListId,
      isUploading,
      canProceedContacts: validateContactsStep()
    });
  }, [currentStep, campaignData.selectedListId, isUploading]);

  const renderStep = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <BasicsStep
            campaignData={campaignData}
            onDataChange={handleDataChange}
            onNext={() => validateBasicsStep() && setCurrentStep('knowledge')}
            assistants={assistants}
          />
        );

      case 'knowledge':
        return (
          <KnowledgeStep
            selectedKnowledgeBase={campaignData.knowledgeBaseId}
            onKnowledgeBaseSelect={(id) => handleDataChange({ knowledgeBaseId: id })}
            onNext={() => validateKnowledgeStep() && setCurrentStep('schedule')}
            onBack={() => setCurrentStep('basics')}
          />
        );

      case 'schedule':
        return (
          <ScheduleStep
            campaignData={campaignData}
            onDataChange={handleDataChange}
            onNext={() => validateScheduleStep() && setCurrentStep('phone')}
            onBack={() => setCurrentStep('knowledge')}
          />
        );

      case 'phone':
        return (
          <PhoneStep
            selectedPhoneNumber={campaignData.selectedPhoneNumber}
            onPhoneSelect={(phoneNumber) => handleDataChange({ selectedPhoneNumber: phoneNumber })}
            onNext={() => validatePhoneStep() && setCurrentStep('contacts')}
            onBack={() => setCurrentStep('schedule')}
          />
        );

      case 'contacts':
        return (
          <ContactsStep
            isUploading={isUploading}
            onFileUpload={handleFileUpload}
            onBack={() => setCurrentStep('phone')}
            onSelectList={handleListSelection}
            selectedListId={campaignData.selectedListId}
            onNext={() => {
              if (validateContactsStep()) {
                setCurrentStep('review');
              }
            }}
          />
        );

      case 'review':
        return (
          <ReviewStep
            campaignData={campaignData}
            onBack={() => setCurrentStep('contacts')}
            onEditStep={(step) => setCurrentStep(step)}
          />
        );
    }
  };

  return (
    <Card className="w-full">
      {renderStep()}
    </Card>
  );
};