import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PhoneNumberFormValues, PhoneNumberProvider } from "@/components/campaigns/types/phoneNumber";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneNumberSDK } from "@/components/campaigns/services/vapi/PhoneNumberSDK";
import { ProviderCredentialsForm } from "./ProviderCredentialsForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const phoneNumberSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?[1-9]\d{9,14}$/, "Must be a valid E.164 format phone number"),
  provider: z.enum(["twilio", "vonage"] as const),
  isDefault: z.boolean()
});

export const PhoneNumberConfig = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Query for fetching VAPI phone numbers
  const { data: vapiPhoneNumbers, isLoading: isLoadingVapiNumbers } = useQuery({
    queryKey: ['vapi-phone-numbers'],
    queryFn: async () => {
      try {
        return await phoneNumberSDK.getAvailablePhoneNumbers();
      } catch (error) {
        console.error('Error fetching VAPI phone numbers:', error);
        toast.error("Failed to fetch phone numbers");
        return [];
      }
    }
  });

  const { data: phoneNumbers, isLoading } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('phone_number_configurations')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: providerCredentials } = useQuery({
    queryKey: ['provider-credentials'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('phone_number_provider_credentials')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const deletePhoneNumber = useMutation({
    mutationFn: async (id: string) => {
      // First delete from VAPI
      try {
        await phoneNumberSDK.deletePhoneNumber(id);
      } catch (error) {
        console.error('Error deleting phone number from VAPI:', error);
        throw error;
      }

      // Then delete from our database
      const { error } = await supabase
        .from('phone_number_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['vapi-phone-numbers'] });
      toast.success("Phone number deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting phone number:', error);
      toast.error("Failed to delete phone number");
    }
  });

  const setDefaultNumber = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, unset any existing default
      await supabase
        .from('phone_number_configurations')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);

      // Then set the new default
      const { error } = await supabase
        .from('phone_number_configurations')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      toast.success("Default number updated successfully");
    },
    onError: (error) => {
      console.error('Error setting default number:', error);
      toast.error("Failed to update default number");
    }
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this phone number?')) {
      deletePhoneNumber.mutate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultNumber.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Numbers</CardTitle>
        <CardDescription>
          Configure your phone numbers and provider credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-4">Provider Credentials</h3>
          <ProviderCredentialsForm />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold">Configured Numbers</h3>
            <p className="text-sm text-muted-foreground">
              Manage your verified phone numbers and set defaults for outbound calls
            </p>
          </div>
          
          {isLoading || isLoadingVapiNumbers ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {vapiPhoneNumbers?.map((number) => (
                <div key={number.id} className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{number.phoneNumber}</span>
                      <span className="text-sm text-muted-foreground capitalize">{number.provider}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <Switch
                        checked={number.isDefault}
                        onCheckedChange={() => handleSetDefault(number.id)}
                        className="data-[state=checked]:bg-vapi-accent"
                        aria-label="Set as default number"
                      />
                      <span className="text-sm text-muted-foreground">
                        {number.isDefault ? "Default" : "Set as default"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(number.id)}
                      disabled={deletePhoneNumber.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};