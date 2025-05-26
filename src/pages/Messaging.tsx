
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
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
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    name: '',
    type: 'creator' as 'creator' | 'brand'
  });

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      setIsLoadingConversations(true);
      try {
        const data = await MessagingService.getConversations();
        setConversations(data);
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
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
          await MessagingService.markAsRead(selectedConversation);
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === selectedConversation 
                ? {...conv, lastMessage: {...conv.lastMessage, read: true}} 
                : conv
            )
          );
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load messages',
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
    
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: 'me',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      const sentMessage = await MessagingService.sendMessage(messageRequest);
      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? sentMessage : msg)
      );
      
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
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversationData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the conversation',
        variant: 'destructive',
      });
      return;
    }

    try {
      const partnerData = {
        id: `${newConversationData.type}-${Date.now()}`,
        name: newConversationData.name,
        avatar: '/placeholder.svg',
        type: newConversationData.type
      };

      const newConversation = await MessagingService.createConversation(partnerData);
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation.id);
      setShowNewConversationDialog(false);
      setNewConversationData({ name: '', type: 'creator' });
      
      toast({
        title: 'Success',
        description: 'New conversation created',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="container py-6 max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Messages</h1>
          <p className="text-muted-foreground">Please log in to access your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newConversationData.name}
                  onChange={(e) => setNewConversationData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name..."
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newConversationData.type} onValueChange={(value: 'creator' | 'brand') => setNewConversationData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateConversation} className="w-full">
                Create Conversation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
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
