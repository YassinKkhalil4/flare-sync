
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessagingService, Conversation, Message } from '@/services/messagingService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMessaging = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => MessagingService.getConversations(user?.id || ''),
    enabled: !!user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      content,
      sender
    }: {
      conversationId: string;
      content: string;
      sender: string;
    }) => MessagingService.sendMessage(conversationId, content, user?.id || '', sender),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: ({
      partnerId,
      partnerName,
      partnerType,
      partnerAvatar
    }: {
      partnerId: string;
      partnerName: string;
      partnerType: string;
      partnerAvatar?: string;
    }) => MessagingService.createConversation(
      user?.id || '',
      partnerId,
      partnerName,
      partnerType,
      partnerAvatar
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Conversation created',
        description: 'You can now start messaging',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create conversation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    conversations: conversations || [],
    isLoadingConversations,
    sendMessage: sendMessageMutation.mutate,
    createConversation: createConversationMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending,
  };
};

export const useConversationMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => MessagingService.getMessages(conversationId || ''),
    enabled: !!conversationId,
  });

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return {
    messages: messages || [],
    isLoading,
  };
};
