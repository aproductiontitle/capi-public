import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useAssistantData = () => {
  const navigate = useNavigate();

  const { data: assistants } = useQuery({
    queryKey: ["assistants"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to continue");
        navigate('/auth');
        return [];
      }

      const { data, error } = await supabase
        .from("assistants")
        .select("*");

      if (error) {
        console.error("Error fetching assistants:", error);
        toast.error("Failed to fetch assistants");
        throw error;
      }

      return data;
    },
  });

  return { assistants };
};