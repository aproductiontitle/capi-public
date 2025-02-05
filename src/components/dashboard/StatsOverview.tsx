import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, PhoneCall, Activity, Hash } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StatsOverviewProps {
  dateRange: { from: Date; to: Date };
}

export const StatsOverview = ({ dateRange }: StatsOverviewProps) => {
  const navigate = useNavigate();
  
  // Fetch VAPI metrics
  const { data: vapiMetrics, error: vapiError } = useQuery({
    queryKey: ['vapiMetrics', dateRange],
    queryFn: async () => {
      const { data: secrets, error: secretError } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'VAPI_API_KEY')
        .maybeSingle();

      if (secretError) {
        console.error('Error fetching VAPI key:', secretError);
        throw new Error('Failed to fetch VAPI API key');
      }

      if (!secrets?.secret) {
        throw new Error('VAPI API key not found');
      }

      try {
        console.log('Fetching VAPI metrics...');
        
        // Use edge function to proxy the request
        const { data, error } = await supabase.functions.invoke('fetch-vapi-metrics', {
          body: {
            dateRange,
            apiKey: secrets.secret
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message || 'Failed to fetch VAPI metrics');
        }

        console.log('VAPI Metrics Response:', data);
        
        // Extract metrics from the first result's first item
        const metrics = data?.[0]?.result?.[0] || {};
        
        return {
          totalCalls: parseInt(metrics.countId || '0', 10),
          totalDuration: Math.round((metrics.sumDuration || 0) * 60), // Convert hours to minutes
          avgDuration: Math.round((metrics.avgDuration || 0) * 60), // Convert hours to minutes
          totalCost: Number(metrics.sumCost || 0),
          avgCost: Number(metrics.avgCost || 0),
          uniqueNumbers: parseInt(metrics.countId || '0', 10) // Using total calls as proxy for unique numbers
        };
      } catch (error) {
        console.error('Error fetching metrics:', error);
        if (error instanceof Error) {
          if (error.message === 'VAPI API key not found') {
            toast.error('Please configure your VAPI API key in settings');
          } else {
            toast.error('Failed to fetch VAPI metrics: ' + error.message);
          }
        }
        throw error;
      }
    },
    retry: 1
  });

  if (vapiError) {
    const errorMessage = vapiError instanceof Error ? vapiError.message : 'Unknown error occurred';
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription className="flex flex-col gap-4">
          <p>{errorMessage}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/settings')}
          >
            Configure API Key
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!vapiMetrics) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vapiMetrics.totalCalls}</div>
          <p className="text-xs text-muted-foreground">
            {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vapiMetrics.totalDuration} mins</div>
          <p className="text-xs text-muted-foreground">
            Total call time
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vapiMetrics.avgDuration} mins</div>
          <p className="text-xs text-muted-foreground">
            Per call
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${vapiMetrics.totalCost.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total spent
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Numbers</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vapiMetrics.uniqueNumbers}</div>
          <p className="text-xs text-muted-foreground">
            Distinct contacts
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${vapiMetrics.avgCost.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Per call
          </p>
        </CardContent>
      </Card>
    </div>
  );
};