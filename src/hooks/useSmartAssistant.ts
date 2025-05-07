
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useSmartAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Get user conversations
  const { data: conversations, isLoading: isLoadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['assistantConversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('assistant_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as Conversation[];
    },
    enabled: !!user,
  });
  
  // Get messages for a specific conversation
  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('assistant_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at)
    }));
  };
  
  // Start a new conversation
  const startNewConversation = async () => {
    try {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication required',
          description: 'You must be logged in to use the assistant',
        });
        return;
      }
      
      const conversationId = uuidv4();
      const { error } = await supabase
        .from('assistant_conversations')
        .insert({
          id: conversationId,
          user_id: user.id,
          title: 'New Conversation',
        });
      
      if (error) throw error;
      
      setCurrentConversationId(conversationId);
      setMessages([]);
      refetchConversations();
      
      return conversationId;
    } catch (error) {
      console.error('Error starting new conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to start conversation',
        description: 'An error occurred while starting a new conversation',
      });
    }
  };
  
  // Select an existing conversation
  const selectConversation = async (conversationId: string) => {
    try {
      setCurrentConversationId(conversationId);
      const conversationMessages = await fetchMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error selecting conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load conversation',
        description: 'An error occurred while loading the conversation',
      });
    }
  };
  
  // Rename a conversation
  const renameConversation = async (conversationId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('assistant_conversations')
        .update({ title: newTitle })
        .eq('id', conversationId);
      
      if (error) throw error;
      
      refetchConversations();
    } catch (error) {
      console.error('Error renaming conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to rename conversation',
        description: 'An error occurred while renaming the conversation',
      });
    }
  };
  
  // Save message to database
  const saveMessage = async (conversationId: string, message: Message) => {
    const { error } = await supabase
      .from('assistant_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
      });
    
    if (error) {
      console.error('Error saving message:', error);
      return false;
    }
    
    return true;
  };
  
  // Update conversation title based on first user message
  const updateConversationTitle = async (conversationId: string, userMessage: string) => {
    if (!conversations || conversations.length === 0) return;
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.title === 'New Conversation') {
      // Use first 30 chars of user message as title
      const newTitle = userMessage.length > 30 
        ? `${userMessage.substring(0, 30)}...` 
        : userMessage;
      
      await renameConversation(conversationId, newTitle);
    }
  };
  
  // Send message to AI helper
  const sendMessageToAI = async (params: { messages: Message[], userId: string }) => {
    const { data: sessionData } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('ai-helper', {
      body: {
        feature: 'chat-assistant',
        params
      },
      headers: {
        Authorization: `Bearer ${sessionData.session?.access_token}`,
      },
    });
    
    if (response.error) {
      throw new Error(response.error.message || 'Failed to get AI response');
    }
    
    return response.data;
  };

  // Send a message
  const sendMessage = async (content: string) => {
    try {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication required',
          description: 'You must be logged in to use the assistant',
        });
        return;
      }
      
      // If no current conversation, create new one
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await startNewConversation();
        if (!conversationId) return;
      }
      
      // Add user message to UI
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Save user message to database
      await saveMessage(conversationId, userMessage);
      
      // Update conversation title if this is first message
      await updateConversationTitle(conversationId, content);
      
      // Prepare messages for AI
      const chatMessages = [...messages, userMessage];
      
      // Get AI response
      const response = await sendMessageToAI({
        messages: chatMessages,
        userId: user.id
      });
      
      // Add AI response to UI
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save AI message to database
      await saveMessage(conversationId, assistantMessage);
      
      // Update conversation timestamp
      await supabase
        .from('assistant_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to get response',
        description: 'An error occurred while getting a response',
      });
    }
  };

  // Select first conversation on load
  useEffect(() => {
    if (conversations && conversations.length > 0 && !currentConversationId) {
      selectConversation(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  return {
    sendMessage,
    isLoading: false,
    messages,
    conversations,
    isLoadingConversations,
    currentConversationId,
    startNewConversation,
    selectConversation,
    renameConversation
  };
};
