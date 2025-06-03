
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useEmailForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [emailForm, setEmailForm] = useState({
    newEmail: user?.email || '',
    password: ''
  });

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.newEmail || !emailForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailForm.newEmail
      });

      if (error) throw error;

      toast({
        title: "Email update requested",
        description: "Please check your new email for a confirmation link.",
      });

      setEmailForm({
        newEmail: '',
        password: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    emailForm,
    setEmailForm,
    isUpdating,
    handleEmailChange
  };
};
