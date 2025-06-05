
import React from 'react';
import ConversationList from '@/components/messaging/ConversationList';
import ChatInterface from '@/components/messaging/ChatInterface';

const Messaging: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      
      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        <div className="md:col-span-1">
          <ConversationList />
        </div>
        <div className="md:col-span-2">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Messaging;
