import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TeamRole } from "./types/team";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

interface InviteFormData {
  email: string;
  role: TeamRole;
}

export const InviteMemberForm = ({ teamId }: { teamId: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<InviteFormData>({
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.functions.invoke('send-team-invitation', {
        body: { teamId, email: data.email, role: data.role },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle>Invite Team Member</CardTitle>
        </div>
        <CardDescription>
          Send invitations to new team members and assign their roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              {...register("email", { required: true })}
              className="w-full bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Select
              defaultValue={watch("role")}
              onValueChange={(value: TeamRole) => setValue("role", value)}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Sending invitation..." : "Send Invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteMemberForm;