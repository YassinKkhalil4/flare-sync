
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  last_message?: string;
}

export const useSmartAssistant = () => {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Fetch conversations
  const { 
    data: conversations, 
    isLoading: isLoadingConversations,
    refetch: refetchConversations 
  } = useQuery({
    queryKey: ['assistantConversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('assistant_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user,
  });
  
  // Fetch messages for a conversation
  const fetchMessages = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('assistant_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    onSuccess: (data) => {
      setMessages(data);
    },
    onError: (error) => {
      console.error('Error fetching messages:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load messages',
      });
    },
  });
  
  // Send a message using real OpenAI API
  const sendMessage = async (content: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to use the Smart Assistant',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Add user message to chat
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      
      // Create or continue conversation
      let conversationId = currentConversationId;
      if (!conversationId) {
        const { data: newConversation, error: conversationError } = await supabase
          .from('assistant_conversations')
          .insert({
            user_id: user.id,
            topic: content.slice(0, 50) + (content.length > 50 ? '...' : '')
          })
          .select()
          .single();
        
        if (conversationError) throw conversationError;
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
      }
      
      // Save user message to database
      await supabase
        .from('assistant_messages')
        .insert({
          conversation_id: conversationId,
          content,
          role: 'user'
        });
      
      // Call AI assistant using real OpenAI API
      const response = await supabase.functions.invoke('ai-helper', {
        body: {
          feature: 'chat-assistant',
          params: {
            message: content,
            conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
          }
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to get AI response');
      }
      
      const aiResponse = response.data.response || 'I apologize, but I encountered an error processing your request.';
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message to database
      await supabase
        .from('assistant_messages')
        .insert({
          conversation_id: conversationId,
          content: aiResponse,
          role: 'assistant'
        });
      
      // Update the conversation's last message
      await supabase
        .from('assistant_conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          topic: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        })
        .eq('id', conversationId);
      
      refetchConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create new conversation
  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };
  
  // Select existing conversation
  const selectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    fetchMessages.mutate(conversationId);
  };
  
  // Rename conversation
  const renameConversation = async (conversationId: string, newTitle: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('assistant_conversations')
        .update({ topic: newTitle })
        .eq('id', conversationId);
      
      refetchConversations();
      
      toast({
        title: 'Conversation renamed',
        description: 'Your conversation has been renamed successfully',
      });
    } catch (error) {
      console.error('Error renaming conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to rename conversation',
      });
    }
  };
  
  return {
    sendMessage,
    isLoading,
    messages,
    conversations,
    isLoadingConversations,
    startNewConversation,
    selectConversation,
    renameConversation,
    currentConversationId
  };
};
