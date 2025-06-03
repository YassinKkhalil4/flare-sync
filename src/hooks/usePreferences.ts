
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePreferences = () => {
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'system',
    autoSave: true,
    twoFactorEnabled: false,
    profileVisibility: 'public',
    emailNotifications: true,
    marketingEmails: false
  });

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Preference updated",
      description: `${key} has been updated successfully.`,
    });
  };

  return {
    preferences,
    setPreferences,
    handlePreferenceChange
  };
};
