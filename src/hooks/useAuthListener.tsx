import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthListener = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
        });
        navigate('/auth');
      }
    });

    // Check session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);
};