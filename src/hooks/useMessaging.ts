
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessagingService, Conversation, Message } from '@/services/messagingService';
import { useAuth } from '@/context/AuthContext';

export const useMessaging = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => MessagingService.getConversations(user!.id),
    enabled: !!user?.id,
  });

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await MessagingService.getMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;
    
    try {
      const message = await MessagingService.sendMessage(
        conversationId,
        content,
        user.id,
        user.email || 'Unknown'
      );
      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createConversation = async (
    partnerId: string,
    partnerName: string,
    partnerType: 'creator' | 'brand',
    partnerAvatar?: string
  ) => {
    if (!user) return;
    
    try {
      const conversation = await MessagingService.createConversation(
        user.id,
        partnerId,
        partnerName,
        partnerType,
        partnerAvatar
      );
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return {
    conversations,
    selectedConversation,
    messages,
    isLoading: isLoadingConversations,
    isLoadingConversations,
    setSelectedConversation,
    loadMessages,
    sendMessage,
    createConversation,
  };
};

export const useConversationMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const msgs = await MessagingService.getMessages(conversationId);
        setMessages(msgs);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  return {
    messages,
    isLoading,
  };
};
