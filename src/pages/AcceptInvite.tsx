import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const acceptInvitation = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        toast.error("Invalid invitation link");
        navigate("/");
        return;
      }

      try {
        // First, verify the token and get invitation details
        const { data: invitation, error: inviteError } = await supabase
          .from("team_invitations")
          .select("*")
          .eq("token", token)
          .single();

        if (inviteError || !invitation) {
          throw new Error("Invalid or expired invitation");
        }

        if (new Date(invitation.expires_at) < new Date()) {
          throw new Error("Invitation has expired");
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("Please sign in to accept the invitation");
        }

        // Add user to team_members
        const { error: memberError } = await supabase
          .from("team_members")
          .insert({
            team_id: invitation.team_id,
            user_id: user.id,
            role: invitation.role
          });

        if (memberError) {
          throw memberError;
        }

        // Delete the used invitation
        await supabase
          .from("team_invitations")
          .delete()
          .eq("id", invitation.id);

        toast.success("Successfully joined the team!");
        navigate("/teams");
      } catch (error: any) {
        toast.error(error.message);
        navigate("/");
      } finally {
        setIsProcessing(false);
      }
    };

    acceptInvitation();
  }, [searchParams, navigate]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <header className="space-y-2 pb-8 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Accept Invitation</h1>
        <p className="text-muted-foreground text-lg">
          Processing your team invitation
        </p>
      </header>

      <div className="flex items-center justify-center min-h-[50vh]">
        {isProcessing && (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Processing invitation...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;