import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStatus = () => {
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return false;

      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      return !!data;
    },
  });
};