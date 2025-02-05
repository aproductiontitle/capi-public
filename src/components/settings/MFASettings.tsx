import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const MFASettings = () => {
  const [isEnabling, setIsEnabling] = useState(false);
  const { toast } = useToast();

  const { data: mfaSettings, refetch } = useQuery({
    queryKey: ['mfaSettings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleToggleMFA = async () => {
    try {
      setIsEnabling(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get current MFA factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const existingTOTP = factorsData?.all?.find(factor => factor.factor_type === 'totp');

      if (!mfaSettings?.enabled) {
        // Enabling MFA
        if (!existingTOTP) {
          const { data: factors, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: 'Authenticator App'
          });
          
          if (error) throw error;
          console.log('QR Code URL:', factors.totp.qr_code);
        }

        // Update MFA settings
        const { error: updateError } = await supabase
          .from('mfa_settings')
          .upsert({ 
            user_id: user.id,
            enabled: true 
          });

        if (updateError) throw updateError;

        toast({
          title: "MFA Setup Started",
          description: "Please scan the QR code with your authenticator app and verify the code to complete setup.",
        });
      } else {
        // Disabling MFA
        if (existingTOTP) {
          // Check if the factor is active (verified)
          if (existingTOTP.status !== 'verified') {
            toast({
              title: "Error",
              description: "You must verify your MFA factor before you can disable it.",
              variant: "destructive",
            });
            return;
          }

          const { error } = await supabase.auth.mfa.unenroll({ 
            factorId: existingTOTP.id 
          });
          if (error) throw error;

          // Only update settings if unenroll was successful
          const { error: updateError } = await supabase
            .from('mfa_settings')
            .upsert({ 
              user_id: user.id,
              enabled: false 
            });

          if (updateError) throw updateError;

          toast({
            title: "MFA Disabled",
            description: "Multi-factor authentication has been disabled for your account.",
          });
        }
      }

      refetch();
    } catch (error: any) {
      console.error('MFA Error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by enabling multi-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Enable MFA</h4>
            <p className="text-sm text-muted-foreground">
              Use an authenticator app to generate one-time codes.
            </p>
          </div>
          <Switch
            checked={mfaSettings?.enabled || false}
            onCheckedChange={handleToggleMFA}
            disabled={isEnabling}
          />
        </div>
        {mfaSettings?.enabled && (
          <Button variant="outline" onClick={handleToggleMFA} disabled={isEnabling}>
            Reset MFA Settings
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASettings;