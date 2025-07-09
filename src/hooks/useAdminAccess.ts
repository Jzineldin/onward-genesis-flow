
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Admin emails list
        const adminEmails = ['admin@taleforge.com', 'Jzineldin@gmail.com'];
        const isAdmin = adminEmails.includes(user.email || '');
        setHasAccess(isAdmin);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return { hasAccess, loading };
};
