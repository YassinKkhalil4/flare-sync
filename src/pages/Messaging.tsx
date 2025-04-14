
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

// Mock messages for a conversation
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
        <div className="border rounded-md overflow-hidden">
          <div className="p-4 bg-muted font-medium">Conversations</div>
          <ScrollArea className="h-[calc(100vh-260px)]">
            <div className="p-2">
              {conversations.map(conversation => (
                <div 
                  key={conversation.id}
                  className={`p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                    selectedConversation === conversation.id 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img 
                          src={conversation.partner.avatar} 
                          alt={conversation.partner.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {!conversation.lastMessage.read && conversation.partner.id !== 'me' && (
                        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-primary"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.partner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(conversation.lastMessage.timestamp).split(',')[0]}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Message View */}
        <div className="border rounded-md overflow-hidden md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b bg-muted flex items-center gap-3">
                {conversations.find(c => c.id === selectedConversation) && (
                  <>
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img 
                        src={conversations.find(c => c.id === selectedConversation)?.partner.avatar} 
                        alt={conversations.find(c => c.id === selectedConversation)?.partner.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {conversations.find(c => c.id === selectedConversation)?.partner.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversations.find(c => c.id === selectedConversation)?.partner.type === 'brand' ? 'Brand' : 'Creator'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Message List */}
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(message => {
                      const isMe = message.sender === 'me';
                      return (
                        <div 
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-2xl p-3 shadow-sm`}>
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {formatDate(message.timestamp).split(',')[1]}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              
              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <Input 
                  placeholder="Type your message..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the list to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
