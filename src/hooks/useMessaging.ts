
import { useState, useEffect } from 'react';
import { MessagingService, Conversation, Message } from '@/services/messagingService';
import { useAuth } from '@/context/AuthContext';

export const useMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const convs = await MessagingService.getConversations(user.id);
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
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
      await loadConversations(); // Refresh conversations to update last message
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
      setConversations(prev => [conversation, ...prev]);
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return {
    conversations,
    selectedConversation,
    messages,
    isLoading,
    setSelectedConversation,
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
  };
};
