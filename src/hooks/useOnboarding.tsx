
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        // Check if user has completed onboarding
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching onboarding status:', error);
          setIsChecking(false);
          return;
        }

        // Show onboarding if the user hasn't completed it yet
        setShowOnboarding(data?.onboarded !== true);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    isChecking,
    completeOnboarding,
  };
};
