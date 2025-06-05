
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmailService, EmailTemplate, EmailNotification } from '@/services/emailService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useEmailService = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  const { data: emailTemplates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => EmailService.getEmailTemplates(),
  });

  const { data: emailHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['emailHistory', user?.id],
    queryFn: () => EmailService.getEmailHistory(user?.id),
    enabled: !!user?.id,
  });

  const sendEmailMutation = useMutation({
    mutationFn: (params: {
      userId: string;
      email: string;
      subject: string;
      content: string;
      templateId?: string;
      variables?: Record<string, string>;
    }) => EmailService.sendNotificationEmail(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailHistory'] });
      toast({
        title: 'Email Sent',
        description: 'Email notification sent successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Send Failed',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      });
    },
  });

  const sendBulkEmailMutation = useMutation({
    mutationFn: (params: {
      userIds: string[];
      subject: string;
      content: string;
      templateId?: string;
    }) => EmailService.sendBulkEmail(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emailHistory'] });
      toast({
        title: 'Bulk Email Sent',
        description: `Successfully sent to ${data.success} users, ${data.failed} failed.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Bulk Send Failed',
        description: error instanceof Error ? error.message : 'Failed to send bulk email',
        variant: 'destructive',
      });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (template: Omit<EmailTemplate, 'id'>) => EmailService.createEmailTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast({
        title: 'Template Created',
        description: 'Email template created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create template',
        variant: 'destructive',
      });
    },
  });

  const sendEmail = async (params: {
    userId: string;
    email: string;
    subject: string;
    content: string;
    templateId?: string;
    variables?: Record<string, string>;
  }) => {
    setIsSending(true);
    try {
      await sendEmailMutation.mutateAsync(params);
    } finally {
      setIsSending(false);
    }
  };

  return {
    emailTemplates,
    emailHistory,
    isLoadingTemplates,
    isLoadingHistory,
    isSending,
    sendEmail,
    sendBulkEmail: sendBulkEmailMutation.mutate,
    createTemplate: createTemplateMutation.mutate,
    isCreatingTemplate: createTemplateMutation.isPending,
    isSendingBulk: sendBulkEmailMutation.isPending,
  };
};
