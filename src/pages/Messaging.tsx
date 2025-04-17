import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ConversationList from '../components/Messaging/ConversationList';
import MessageView from '../components/Messaging/MessageView';
import { MessagingService } from '../services/api';
import { Conversation, Message } from '../types/messaging';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

const Messaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      setIsLoadingConversations(true);
      try {
        const data = await MessagingService.getConversations();
        setConversations(data);
        // Auto-select the first conversation if none is selected
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user, toast, selectedConversation]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setIsLoading(true);
      
      const fetchMessages = async () => {
        try {
          const fetchedMessages = await MessagingService.getMessages(selectedConversation);
          setMessages(fetchedMessages);
          
          // Mark conversation as read
          await MessagingService.markAsRead(selectedConversation);
          
          // Update conversations list to mark as read
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === selectedConversation 
                ? {...conv, lastMessage: {...conv.lastMessage, read: true}} 
                : conv
            )
          );
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          toast({
            title: 'Error',
            description: 'Failed to load messages. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMessages();
    }
  }, [selectedConversation, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    const messageRequest = {
      conversationId: selectedConversation,
      content: newMessage
    };
    
    // Optimistic update - add message to UI immediately
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: 'me',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      // Send message to API
      const sentMessage = await MessagingService.sendMessage(messageRequest);
      
      // Replace temp message with actual message
      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? sentMessage : msg)
      );
      
      // Update conversation last message
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation 
            ? {
                ...conv, 
                lastMessage: {
                  content: newMessage,
                  timestamp: sentMessage.timestamp,
                  read: true
                }
              } 
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove the temp message and show error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container py-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <ConversationList 
          conversations={conversations} 
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          formatDate={formatDate}
          isLoading={isLoadingConversations}
        />
        
        {/* Message View */}
        <MessageView 
          selectedConversation={selectedConversation}
          conversations={conversations}
          isLoading={isLoading}
          messages={messages}
          formatDate={formatDate}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Messaging;
