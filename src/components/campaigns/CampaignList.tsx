import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "./types";
import { CampaignCard } from "./list/CampaignCard";
import { useState } from "react";
import { toast } from "sonner";

export const CampaignList = () => {
  const { data: campaigns, isLoading, error, refetch } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      console.log("Fetching campaigns...");
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          id,
          name,
          status,
          assistant_id,
          user_id,
          scheduled_time,
          created_at,
          updated_at,
          execution_error,
          assistant:assistants (
            id,
            name,
            vapi_assistant_id
          ),
          contacts:campaign_contacts (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return data as Campaign[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Campaign deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    }
  };

  const handlePause = async (id: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "paused" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Campaign paused successfully");
      refetch();
    } catch (error) {
      console.error("Error pausing campaign:", error);
      toast.error("Failed to pause campaign");
    }
  };

  const handleEdit = (id: string) => {
    // Navigate to the campaign edit page
    window.location.href = `/campaigns/${id}/edit`;
  };

  if (isLoading) {
    return <div>Loading campaigns...</div>;
  }

  if (error) {
    return <div>Error loading campaigns: {error.message}</div>;
  }

  if (!campaigns?.length) {
    return <div>No campaigns found</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onDelete={handleDelete}
          onPause={handlePause}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
};