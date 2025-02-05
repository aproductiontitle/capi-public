import { useApiKeys } from './api-keys/useApiKeys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ApiKeyInput from './api-keys/ApiKeyInput';

const ApiKeySettings = () => {
  const {
    apiKeys,
    savingStates,
    testingStates,
    toggleKeyVisibility,
    handleApiKeyChange,
    testApiKey,
    saveApiKey
  } = useApiKeys();

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Settings</CardTitle>
        <CardDescription>
          Manage your API keys for accessing various services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {apiKeys.map((key) => (
          <ApiKeyInput
            key={key.name}
            keyName={key.name}
            displayName={key.displayName}
            value={key.value}
            savedValue={key.savedValue}
            isVisible={key.isVisible}
            onToggleVisibility={() => toggleKeyVisibility(key.name)}
            onChange={(value) => handleApiKeyChange(key.name, value)}
            onTest={() => testApiKey(key.name, key.value || key.savedValue || '')}
            onSave={() => saveApiKey(key.name, key.value)}
            isTesting={testingStates[key.name] || false}
            isSaving={savingStates[key.name] || false}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default ApiKeySettings;