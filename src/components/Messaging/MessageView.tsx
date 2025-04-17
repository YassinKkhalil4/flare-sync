import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User } from 'lucide-react';
import { Conversation, Message } from '@/types/messaging';

interface MessageViewProps {
  selectedConversation: string | null;
  conversations: Conversation[];
  isLoading: boolean;
  messages: Message[];
  formatDate: (dateString: string) => string;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

const MessageView = ({
  selectedConversation,
  conversations,
  isLoading,
  messages,
  formatDate,
  newMessage,
  setNewMessage,
  handleSendMessage
}: MessageViewProps) => {
  const selectedPartner = selectedConversation 
    ? conversations.find(c => c.id === selectedConversation)?.partner 
    : null;

  if (!selectedConversation) {
    return (
      <div className="border rounded-md overflow-hidden md:col-span-2 flex flex-col">
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p className="text-muted-foreground">
            Select a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden md:col-span-2 flex flex-col">
      {/* Conversation Header */}
      {selectedPartner && (
        <div className="p-4 border-b bg-muted flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <img 
              src={selectedPartner.avatar} 
              alt={selectedPartner.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{selectedPartner.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedPartner.type === 'brand' ? 'Brand' : 'Creator'}
            </p>
          </div>
        </div>
      )}
      
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
    </div>
  );
};

export default MessageView;
