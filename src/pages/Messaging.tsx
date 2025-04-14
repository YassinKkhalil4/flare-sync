
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ConversationList from '../components/Messaging/ConversationList';
import MessageView from '../components/Messaging/MessageView';
import { mockConversations, generateMockMessages, formatDate } from '../utils/mockMessagingData';

const Messaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load messages when a conversation is selected
    if (selectedConversation) {
      setIsLoading(true);
      
      // Simulate API call to get messages
      setTimeout(() => {
        const fetchedMessages = generateMockMessages(selectedConversation);
        setMessages(fetchedMessages);
        setIsLoading(false);
        
        // Mark conversation as read
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === selectedConversation 
              ? {...conv, lastMessage: {...conv.lastMessage, read: true}} 
              : conv
          )
        );
      }, 500);
    }
  }, [selectedConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    // Add new message to the conversation
    const newMsg = {
      id: `new-${Date.now()}`,
      sender: 'me',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMsg]);
    
    // Update conversation last message
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === selectedConversation 
          ? {
              ...conv, 
              lastMessage: {
                content: newMessage,
                timestamp: new Date().toISOString(),
                read: true
              }
            } 
          : conv
      )
    );
    
    setNewMessage('');
    
    // Simulate response after a delay
    setTimeout(() => {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;
      
      const responseMsg = {
        id: `new-${Date.now() + 1}`,
        sender: conversation.partner.id,
        content: `Thanks for your message! This is an automated response from ${conversation.partner.name}.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, responseMsg]);
    }, 1000);
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
