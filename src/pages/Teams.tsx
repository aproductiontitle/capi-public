import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MembersList } from '@/components/teams/MembersList';
import { InviteMemberForm } from '@/components/teams/InviteMemberForm';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useState } from 'react';
import { toast } from "sonner";

const Teams = () => {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Get the user's team ID - we assume one team per user for now
  const { data: teamId, isLoading, error } = useQuery({
    queryKey: ['user-team'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: teamMembers, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (memberError) {
        console.error('Error fetching team:', memberError);
        return null;
      }
      
      return teamMembers?.team_id;
    },
  });

  const createTeam = async () => {
    setIsCreatingTeam(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: team, error: createError } = await supabase
        .from('teams')
        .insert([{ name: 'My Team' }])
        .select()
        .single();

      if (createError) throw createError;

      toast.success("Team created successfully");
      
      // Refresh the page to show the new team
      window.location.reload();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error("Failed to create team. Please try again.");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-10">
        <div className="text-center text-muted-foreground">
          Loading team information...
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-10 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your team members and their access levels
        </p>
        <Separator />
      </div>

      <div className="space-y-8">
        {teamId ? (
          <>
            <MembersList teamId={teamId} />
            <InviteMemberForm teamId={teamId} />
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              You don't have a team yet. Create one to start collaborating with others.
            </p>
            <Button 
              onClick={createTeam} 
              disabled={isCreatingTeam}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;