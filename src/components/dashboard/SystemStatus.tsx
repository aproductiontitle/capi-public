import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemStatus {
  name: string;
  isOperational: boolean;
  message: string;
}

export const SystemStatus = () => {
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([
    { name: 'ElevenLabs API', isOperational: false, message: 'Checking...' },
    { name: 'OpenAI API', isOperational: false, message: 'Checking...' },
    { name: 'VAPI API', isOperational: false, message: 'Checking...' },
  ]);

  useEffect(() => {
    const checkApiKeys = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: secrets, error } = await supabase
        .from('secrets')
        .select('name, secret')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching secrets:', error);
        return;
      }

      const apiKeyMapping: { [key: string]: string } = {
        'ElevenLabs API': 'ELEVEN_LABS_API_KEY',
        'OpenAI API': 'OPENAI_API_KEY',
        'VAPI API': 'VAPI_API_KEY'
      };

      const newStatuses = systemStatuses.map(status => {
        const secretName = apiKeyMapping[status.name];
        const hasKey = secrets?.some(secret => 
          secret.name === secretName && 
          secret.secret && 
          secret.secret.trim() !== ''
        );
        
        return {
          ...status,
          isOperational: hasKey,
          message: hasKey ? 'Operational' : 'API key not configured',
        };
      });

      setSystemStatuses(newStatuses);
    };

    checkApiKeys();

    // Subscribe to real-time updates for secrets
    const channel = supabase
      .channel('system-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'secrets'
        },
        (payload) => {
          console.log('Secrets changed:', payload);
          checkApiKeys();
          toast.info('System status updated');
        }
      )
      .subscribe();

    // Subscribe to VAPI performance metrics
    const metricsChannel = supabase
      .channel('vapi-metrics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vapi_performance_metrics'
        },
        (payload: any) => {
          const metrics = payload.new;
          const vapiStatus = systemStatuses.find(s => s.name === 'VAPI API');
          if (vapiStatus && vapiStatus.isOperational) {
            const successRate = metrics.success_rate;
            const newMessage = successRate >= 0.95 
              ? 'Operational (High Performance)' 
              : successRate >= 0.8 
                ? 'Operational (Normal Performance)'
                : 'Degraded Performance';
            
            setSystemStatuses(prev => prev.map(status => 
              status.name === 'VAPI API' 
                ? { ...status, message: newMessage }
                : status
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(metricsChannel);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemStatuses.map((status) => (
            <div key={status.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {status.isOperational ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{status.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{status.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};