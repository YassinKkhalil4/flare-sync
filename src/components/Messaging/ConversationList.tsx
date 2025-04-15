
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types/messaging';
import { Loader2 } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  formatDate: (dateString: string) => string;
  isLoading?: boolean;
}

const ConversationList = ({ 
  conversations, 
  selectedConversation,
  setSelectedConversation,
  formatDate,
  isLoading = false
}: ConversationListProps) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-4 bg-muted font-medium">Conversations</div>
      <ScrollArea className="h-[calc(100vh-260px)]">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map(conversation => (
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
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
