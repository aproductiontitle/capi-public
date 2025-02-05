import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TeamMember, TeamRole } from "./types/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, Users } from "lucide-react";

interface MembersListProps {
  teamId: string;
}

export const MembersList = ({ teamId }: MembersListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          team_id,
          role,
          created_at,
          updated_at,
          profiles:user_id(
            first_name,
            last_name,
            email
          )
        `)
        .eq('team_id', teamId);

      if (error) throw error;
      
      const transformedData = data?.map(member => ({
        ...member,
        profiles: member.profiles || {
          first_name: null,
          last_name: null,
          email: null
        }
      }));

      return transformedData as TeamMember[];
    },
    staleTime: 30000,
  });

  const updateRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: TeamRole }) => {
      setIsUpdating(true);
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <Skeleton className="h-12 w-48" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!members || members.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-4">
          No team members found. Use the invite form below to add members.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">
                  {member.profiles?.first_name || 'Unknown'} {member.profiles?.last_name || ''}
                </span>
                <span className="text-sm text-muted-foreground">
                  {member.profiles?.email || 'No email'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select
                disabled={isUpdating}
                defaultValue={member.role}
                onValueChange={(value: TeamRole) =>
                  updateRole.mutate({ memberId: member.id, role: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeMember.mutate(member.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default MembersList;