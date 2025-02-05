import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CampaignFormData } from "../types";
import { fromZonedTime } from 'date-fns-tz';

export const useCampaignSubmission = () => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const submitCampaign = async (campaignData: CampaignFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to continue");
      navigate('/auth');
      return null;
    }

    if (!campaignData.assistantId || !campaignData.name || !campaignData.selectedPhoneNumber) {
      toast.error("Please fill in all required fields");
      return null;
    }

    let scheduledTime: Date;
    
    if (campaignData.launchType === 'immediate') {
      scheduledTime = new Date();
    } else {
      if (!campaignData.selectedDate) {
        toast.error("Please select a date for scheduled campaigns");
        return null;
      }

      // Convert local time to UTC
      const localDateTime = new Date(campaignData.selectedDate);
      const [hours, minutes] = campaignData.selectedTime.split(":");
      localDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      scheduledTime = fromZonedTime(
        localDateTime,
        campaignData.timezone || 'UTC'
      );
    }

    try {
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          name: campaignData.name,
          assistant_id: campaignData.assistantId,
          scheduled_time: scheduledTime.toISOString(),
          user_id: user.id,
          status: 'scheduled',
          timezone: campaignData.timezone || 'UTC'
        })
        .select()
        .single();

      if (campaignError) throw campaignError;
      return campaign;
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, campaignData: CampaignFormData) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = text.split("\n").map(row => row.split(","));
      const headers = rows[0].map(header => header.trim().toLowerCase());

      if (!headers.includes("name") || !headers.includes("phone")) {
        toast.error("CSV must include 'name' and 'phone' columns");
        return;
      }

      const contacts = rows.slice(1).map(row => ({
        name: row[headers.indexOf("name")].trim(),
        phone_number: row[headers.indexOf("phone")].trim(),
      }));

      const campaign = await submitCampaign(campaignData);
      if (!campaign) return;

      const { error: contactsError } = await supabase
        .from("campaign_contacts")
        .insert(
          contacts.map(contact => ({
            campaign_id: campaign.id,
            ...contact,
          }))
        );

      if (contactsError) throw contactsError;
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    } finally {
      setIsUploading(false);
    }
  };

  const handleListSelection = async (listId: string, campaignData: CampaignFormData) => {
    try {
      const campaign = await submitCampaign(campaignData);
      if (!campaign) return;

      const { data: contacts, error: contactsError } = await supabase
        .from("contacts")
        .select("first_name, last_name, phone_number")
        .eq("list_id", listId);

      if (contactsError) throw contactsError;

      const { error: campaignContactsError } = await supabase
        .from("campaign_contacts")
        .insert(
          contacts.map(contact => ({
            campaign_id: campaign.id,
            name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
            phone_number: contact.phone_number,
            source_list_id: listId
          }))
        );

      if (campaignContactsError) throw campaignContactsError;
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    }
  };

  return {
    isUploading,
    handleFileUpload,
    handleListSelection,
    submitCampaign
  };
};