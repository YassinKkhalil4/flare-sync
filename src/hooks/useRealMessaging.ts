
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealMessagingService, Conversation, Message } from '@/services/realMessagingService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useRealMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => RealMessagingService.getConversations(user!.id),
    enabled: !!user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content, sender }: { 
      conversationId: string; 
      content: string; 
      sender: string 
    }) => RealMessagingService.sendMessage(conversationId, content, sender, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: ({ partnerId, partnerName, partnerType, partnerAvatar }: {
      partnerId: string;
      partnerName: string;
      partnerType: 'creator' | 'brand';
      partnerAvatar?: string;
    }) => RealMessagingService.createConversation(
      user!.id,
      partnerId,
      partnerName,
      partnerType,
      partnerAvatar
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Success',
        description: 'Conversation created',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    },
  });

  return {
    conversations,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    createConversation: createConversationMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending,
  };
};

export const useConversationMessages = (conversationId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  const { data: initialMessages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => RealMessagingService.getMessages(conversationId),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const subscription = RealMessagingService.subscribeToMessages(
      conversationId,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, queryClient]);

  const markAsRead = async () => {
    if (user?.id && conversationId) {
      await RealMessagingService.markMessagesAsRead(conversationId, user.id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  };

  return {
    messages,
    isLoading,
    markAsRead,
  };
};
