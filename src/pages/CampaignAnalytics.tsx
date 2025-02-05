import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignHeader } from "@/components/campaigns/analytics/CampaignHeader";
import { CampaignHealthMetrics } from "@/components/campaigns/analytics/CampaignHealthMetrics";
import { CampaignMetrics } from "@/components/campaigns/analytics/CampaignMetrics";
import { ContactsList } from "@/components/campaigns/analytics/ContactsList";
import { Loader2 } from "lucide-react";
import { Campaign } from "@/components/campaigns/types";

const CampaignAnalytics = () => {
  const { id } = useParams();

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      if (id === 'new') return null;

      console.log('Fetching campaign data for ID:', id);
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          assistant:assistants (
            id,
            name,
            vapi_assistant_id
          ),
          contacts:campaign_contacts (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching campaign:', error);
        throw error;
      }
      if (!data) throw new Error('Campaign not found');
      
      return data as unknown as Campaign;
    },
    enabled: id !== 'new',
  });

  if (id === 'new') {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-2xl font-bold">New Campaign</h1>
        <p className="text-muted-foreground">
          Create a new campaign using the form below
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading campaign: {error.message}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center text-muted-foreground">
        Campaign not found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CampaignHeader campaign={campaign} />
      <div className="grid gap-4 md:grid-cols-2">
        <CampaignHealthMetrics campaignId={campaign.id} />
        <CampaignMetrics campaignId={campaign.id} />
      </div>
      <ContactsList contacts={campaign.contacts} />
    </div>
  );
};

export default CampaignAnalytics;
