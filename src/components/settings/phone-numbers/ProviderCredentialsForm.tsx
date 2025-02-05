import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const credentialsSchema = z.object({
  provider: z.enum(["twilio", "vonage"]),
  credentials: z.object({
    label: z.string().min(1, "Label is required"),
    accountSid: z.string().optional(),
    authToken: z.string().optional(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
  }),
});

type CredentialsFormValues = z.infer<typeof credentialsSchema>;

export const ProviderCredentialsForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      provider: "twilio",
      credentials: {
        label: "",
        accountSid: "",
        authToken: "",
        apiKey: "",
        apiSecret: "",
      },
    },
  });

  const provider = form.watch("provider");

  const onSubmit = async (values: CredentialsFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('phone_number_provider_credentials')
        .insert({
          user_id: user.id,
          provider: values.provider,
          credentials: values.credentials,
        });

      if (error) throw error;

      toast.success("Provider credentials saved successfully");
      form.reset();
    } catch (error) {
      console.error('Error saving provider credentials:', error);
      toast.error("Failed to save provider credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="vonage">Vonage</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credentials.label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="My Twilio Account" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {provider === "twilio" && (
          <>
            <FormField
              control={form.control}
              name="credentials.accountSid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account SID</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.authToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Token</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {provider === "vonage" && (
          <>
            <FormField
              control={form.control}
              name="credentials.apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Credentials"
          )}
        </Button>
      </form>
    </Form>
  );
};