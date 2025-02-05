import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuditLogViewer from '@/components/settings/AuditLogViewer';
import MFASettings from '@/components/settings/security/MFASettings';
import ProfileSettings from '@/components/settings/profile/ProfileSettings';
import ApiKeySettings from '@/components/settings/ApiKeySettings';
import { PhoneNumberConfig } from '@/components/settings/phone-numbers/PhoneNumberConfig';
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data;
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Separator className="mt-4" />
      </div>

      <div className="flex flex-col gap-12">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="phone-numbers">Phone Numbers</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {isAdmin && <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="phone-numbers">
            <PhoneNumberConfig />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeySettings />
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <MFASettings />
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="audit-logs">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>
                    View and export system audit logs. Filter by action type or search by IP address and user agent.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AuditLogViewer />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;