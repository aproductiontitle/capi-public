import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MFASettings = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadMFASettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('mfa_settings')
        .select('enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setMfaEnabled(data.enabled || false);
      }
    };

    loadMFASettings();
  }, []);

  const handleMFAToggle = async (enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      await supabase
        .from('mfa_settings')
        .update({ enabled })
        .eq('user_id', user.id);

      setMfaEnabled(enabled);
      toast({
        title: "Success",
        description: `MFA ${enabled ? "enabled" : "disabled"} successfully`,
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
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure your account security settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="mfa-toggle">Multi-Factor Authentication</Label>
          <Switch
            id="mfa-toggle"
            checked={mfaEnabled}
            onCheckedChange={handleMFAToggle}
            className="data-[state=checked]:bg-vapi-accent"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MFASettings;