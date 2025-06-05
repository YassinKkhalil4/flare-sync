
import React, { useState } from 'react';
import ConversationList from '@/components/messaging/ConversationList';
import ChatInterface from '@/components/messaging/ChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { Conversation } from '@/services/realMessagingService';

const Messaging: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      
      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        <div className="md:col-span-1">
          <ConversationList
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={setSelectedConversation}
          />
        </div>
        <div className="md:col-span-2">
          {selectedConversation ? (
            <ChatInterface conversation={selectedConversation} />
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to start messaging</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
