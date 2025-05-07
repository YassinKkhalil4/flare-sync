
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSmartAssistant } from '@/hooks/useSmartAssistant';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const MessageItem = ({ message, isUser }: { message: { role: string; content: string; timestamp?: Date }, isUser: boolean }) => {
  return (
    <div className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className={isUser ? 'bg-primary' : 'bg-secondary'}>
        <AvatarFallback>
          {isUser ? 'U' : <Bot className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-3 rounded-lg ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} max-w-[80%]`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp ? message.timestamp.toLocaleTimeString() : new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

const EXAMPLE_PROMPTS = [
  "What's the best time to post on Instagram this week?",
  "Suggest 3 content ideas for my fitness niche",
  "Help me write a better bio for my social media profile",
  "Give me tips to increase my engagement rate on TikTok",
  "How can I get more brand deals as a creator?"
];

const SmartAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    sendMessage,
    isLoading,
    messages,
    conversations,
    isLoadingConversations,
    startNewConversation,
    selectConversation,
    renameConversation
  } = useSmartAssistant();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleExampleClick = (prompt: string) => {
    sendMessage(prompt);
  };
  
  const handleNewConversation = () => {
    startNewConversation();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Smart Assistant</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar with conversation history */}
        <div className="md:col-span-1">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span>Conversations</span>
              </CardTitle>
              <Button onClick={handleNewConversation} className="w-full">New Conversation</Button>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1">
              {isLoadingConversations ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : conversations && conversations.length > 0 ? (
                <div className="p-4 space-y-2">
                  {conversations.map((conversation) => (
                    <Button 
                      key={conversation.id}
                      variant={currentConversationId === conversation.id ? "default" : "ghost"}
                      className="w-full justify-start text-left overflow-hidden"
                      onClick={() => selectConversation(conversation.id)}
                    >
                      <div className="truncate">
                        {conversation.title}
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
        
        {/* Main chat area */}
        <div className="md:col-span-3">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>FlareSync Assistant</CardTitle>
                </div>
                <Badge variant="outline">AI Powered</Badge>
              </div>
              <CardDescription>
                Ask me anything about social media strategy, content ideas or creator growth
              </CardDescription>
            </CardHeader>
            <Separator />
            
            {/* Messages area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Ask me anything about social media strategy, content ideas, or how to grow as a creator. I'm here to assist!
                    </p>
                    
                    <div className="w-full max-w-md">
                      <h4 className="text-sm font-medium mb-2">Try asking:</h4>
                      <div className="grid gap-2">
                        {EXAMPLE_PROMPTS.map((prompt, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            className="justify-start text-left h-auto py-2"
                            onClick={() => handleExampleClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <MessageItem 
                        key={index} 
                        message={message} 
                        isUser={message.role === 'user'} 
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </ScrollArea>
              
              {/* Input area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistantPage;
