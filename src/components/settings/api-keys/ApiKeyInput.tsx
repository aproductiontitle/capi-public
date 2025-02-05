import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';

interface ApiKeyInputProps {
  keyName: string;
  displayName: string;
  value: string;
  savedValue: string | null;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onChange: (value: string) => void;
  onTest: () => void;
  onSave: () => void;
  isTesting: boolean;
  isSaving: boolean;
}

const ApiKeyInput = ({
  keyName,
  displayName,
  value,
  savedValue,
  isVisible,
  onToggleVisibility,
  onChange,
  onTest,
  onSave,
  isTesting,
  isSaving
}: ApiKeyInputProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{displayName}</h3>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={isVisible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={savedValue ? '••••••••' : `Enter your ${displayName}`}
            className="pr-10 dark:bg-vapi-muted dark:border-vapi-muted"
          />
          {(savedValue || value) && (
            <button
              type="button"
              onClick={onToggleVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
        <Button 
          onClick={onTest} 
          disabled={isTesting}
          variant="outline"
          className="dark:bg-vapi-muted dark:border-vapi-muted dark:hover:bg-vapi-accent/20"
        >
          {isTesting ? 'Testing...' : 'Test'}
        </Button>
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          className="dark:bg-vapi-accent dark:text-white dark:hover:bg-vapi-accent/90"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      {savedValue && (
        <p className="text-sm text-muted-foreground">
          {isVisible ? savedValue : '••••••••'}
        </p>
      )}
    </div>
  );
};

export default ApiKeyInput;