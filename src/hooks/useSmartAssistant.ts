
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
  const { user } = useAuth();
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
  
  // Send a message
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
        // Create new conversation
        const { data: newConversation, error: conversationError } = await supabase
          .from('assistant_conversations')
          .insert({
            user_id: user.id,
            topic: content.slice(0, 50) + (content.length > 50 ? '...' : '')
          })
          .select();
        
        if (conversationError) throw conversationError;
        conversationId = newConversation[0].id;
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
      
      // In a real implementation, we would call an AI service here
      // For now, we'll simulate a response with a timeout
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock response based on user's query
      const mockResponse = generateMockResponse(content);
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message to database
      await supabase
        .from('assistant_messages')
        .insert({
          conversation_id: conversationId,
          content: mockResponse,
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
      
      // Refresh conversations list
      refetchConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message',
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
  
  // Helper function to generate mock responses
  const generateMockResponse = (query: string): string => {
    // Simple keyword-based responses
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return "Hello! I'm your FlareSync Smart Assistant. How can I help you with your content creation and social media strategy today?";
    }
    
    if (lowerQuery.includes('hashtag')) {
      return "Hashtags are crucial for discovery on platforms like Instagram and Twitter. For best results:\n\n• Use 5-10 relevant hashtags on Instagram\n• Mix popular and niche hashtags for better reach\n• Research trending hashtags in your industry\n• Create a branded hashtag for your content\n• Avoid banned or overused hashtags\n\nWould you like me to suggest some hashtags for your specific niche?";
    }
    
    if (lowerQuery.includes('engagement') || lowerQuery.includes('reach')) {
      return "To boost your engagement and reach:\n\n1. Post consistently at optimal times (use our Smart Scheduler)\n2. Create interactive content like polls and questions\n3. Respond to comments within 1 hour when possible\n4. Use high-quality visuals that stop the scroll\n5. Write compelling captions with clear calls-to-action\n\nAnalyzing your recent posts, videos with tutorial content have performed 27% better than other formats. Consider creating more educational content.";
    }
    
    if (lowerQuery.includes('caption')) {
      return "For writing engaging captions:\n\n• Start with a hook in the first line\n• Tell a story that resonates with your audience\n• Include a clear call-to-action\n• Use emojis strategically to break up text\n• Add relevant hashtags\n\nYou can also use our Caption Generator tool to create AI-powered captions tailored to your brand voice and content goals.";
    }
    
    if (lowerQuery.includes('post') && (lowerQuery.includes('tomorrow') || lowerQuery.includes('today'))) {
      return "Based on your content calendar and audience analytics, I recommend:\n\n• Content type: Carousel post showing behind-the-scenes\n• Best time: Between 12-1pm (your local time)\n• Caption style: Informal with a question to drive engagement\n• Hashtags: Mix of industry and trending tags\n\nYour audience engagement is typically 23% higher on weekdays around lunchtime. Would you like me to help you draft this post using our Caption Generator?";
    }
    
    // Default response
    return "Thanks for your question about \"" + query + "\". Based on your content strategy and audience data, I recommend focusing on creating consistent, high-quality content that resonates with your followers. Our analytics show that your audience engages most with educational and behind-the-scenes content, particularly when posted in the evening between 6-8pm.\n\nWould you like specific suggestions for your content calendar or help with optimizing your posting schedule?";
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
