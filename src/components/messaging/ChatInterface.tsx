
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useConversationMessages, useRealMessaging } from '@/hooks/useRealMessaging';
import { Conversation } from '@/services/realMessagingService';
import { useAuth } from '@/context/AuthContext';

interface ChatInterfaceProps {
  conversation: Conversation;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversation }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const { messages, isLoading, markAsRead } = useConversationMessages(conversation.id);
  const { sendMessage, isSendingMessage } = useRealMessaging();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when conversation is opened
    markAsRead();
  }, [conversation.id, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    sendMessage({
      conversationId: conversation.id,
      content: newMessage.trim(),
      sender: user.id,
    });

    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={conversation.partner_avatar} />
            <AvatarFallback>
              {conversation.partner_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-medium">{conversation.partner_name}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {conversation.partner_type}
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSendingMessage}
            />
            <Button type="submit" disabled={isSendingMessage || !newMessage.trim()}>
              {isSendingMessage ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
