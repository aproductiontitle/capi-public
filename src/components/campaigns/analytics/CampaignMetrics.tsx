import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CampaignMetricsProps {
  campaignId: string;
}

export const CampaignMetrics = ({ campaignId }: CampaignMetricsProps) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['campaign-metrics', campaignId],
    queryFn: async () => {
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('user_id')
        .eq('id', campaignId)
        .single();

      if (!campaignData) {
        throw new Error('Campaign not found');
      }

      const { data, error } = await supabase
        .from('vapi_performance_metrics')
        .select('*')
        .eq('user_id', campaignData.user_id)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data || [];
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            Loading metrics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={metrics}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                tick={{ fill: '#888888' }}
                tickLine={{ stroke: '#888888' }}
                axisLine={{ stroke: '#888888' }}
              />
              <YAxis 
                tick={{ fill: '#888888' }}
                tickLine={{ stroke: '#888888' }}
                axisLine={{ stroke: '#888888' }}
                width={40}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="success_rate" 
                stroke="#10b981" 
                name="Success Rate"
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="avg_duration" 
                stroke="#6366f1" 
                name="Avg Duration (ms)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};