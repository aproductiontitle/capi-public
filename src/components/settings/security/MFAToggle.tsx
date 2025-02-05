import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MFAToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
}

export const MFAToggle = ({ enabled, onToggle }: MFAToggleProps) => {
  const { toast } = useToast();

  const handleToggle = async () => {
    try {
      await onToggle(!enabled);
      toast({
        title: "Success",
        description: `MFA ${enabled ? "disabled" : "enabled"} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="mfa-toggle">Multi-Factor Authentication</Label>
      <Switch
        id="mfa-toggle"
        checked={enabled}
        onCheckedChange={handleToggle}
      />
    </div>
  );
};