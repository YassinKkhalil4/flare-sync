
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConversationList from '../components/Messaging/ConversationList';
import MessageView from '../components/Messaging/MessageView';

// Mock data for conversations
const mockConversations = [
  {
    id: '1',
    partner: {
      id: 'b1',
      name: 'Nike',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Nike',
      type: 'brand'
    },
    lastMessage: {
      content: 'We would love to discuss a potential partnership for our new campaign.',
      timestamp: '2023-04-12T14:30:00Z',
      read: true
    }
  },
  {
    id: '2',
    partner: {
      id: 'b2',
      name: 'Adidas',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Adidas',
      type: 'brand'
    },
    lastMessage: {
      content: 'Your profile looks great! Would you be interested in promoting our new collection?',
      timestamp: '2023-04-10T09:15:00Z',
      read: false
    }
  },
  {
    id: '3',
    partner: {
      id: 'c1',
      name: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Alex',
      type: 'creator'
    },
    lastMessage: {
      content: 'Thanks for the tips on improving my content strategy!',
      timestamp: '2023-04-08T16:45:00Z',
      read: true
    }
  }
];

// Helper function to generate mock messages
const generateMockMessages = (conversationId: string) => {
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (!conversation) return [];
  
  const partnerName = conversation.partner.name;
  const partnerType = conversation.partner.type;
  
  return [
    {
      id: `${conversationId}-1`,
      sender: partnerType === 'brand' ? conversation.partner.id : 'me',
      content: `Hi there! This is ${partnerName}. I'm interested in working with you.`,
      timestamp: '2023-04-05T10:30:00Z'
    },
    {
      id: `${conversationId}-2`,
      sender: 'me',
      content: 'Hello! Thanks for reaching out. I'd love to hear more about what you have in mind.',
      timestamp: '2023-04-05T10:35:00Z'
    },
    {
      id: `${conversationId}-3`,
      sender: partnerType === 'brand' ? conversation.partner.id : 'me',
      content: `We're launching a new product next month and looking for creators like you to help promote it.`,
      timestamp: '2023-04-05T10:40:00Z'
    },
    {
      id: `${conversationId}-4`,
      sender: 'me',
      content: 'Sounds interesting! What kind of content are you looking for?',
      timestamp: '2023-04-05T10:45:00Z'
    },
    {
      id: `${conversationId}-5`,
      sender: partnerType === 'brand' ? conversation.partner.id : 'me',
      content: conversation.lastMessage.content,
      timestamp: conversation.lastMessage.timestamp
    }
  ];
};

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
