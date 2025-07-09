
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const adminEmails = [
  'jzineldin+admin@gmail.com',
  'jzineldin@gmail.com'
];

export const useAdminAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email) {
          // Convert user's email to lowercase for case-insensitive comparison
          const isAdmin = adminEmails.includes(user.email.toLowerCase());
          setHasAccess(isAdmin);
        } else {
          setHasAccess(false);
        }
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
