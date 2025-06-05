
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRealMessaging } from '@/hooks/useRealMessaging';
import { Conversation } from '@/services/realMessagingService';

interface ConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversationId,
  onSelectConversation,
}) => {
  const { conversations, isLoading } = useRealMessaging();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start a conversation with a brand or creator to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className={`cursor-pointer transition-colors hover:bg-accent ${
            selectedConversationId === conversation.id ? 'border-primary bg-accent' : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={conversation.partner_avatar} />
                <AvatarFallback>
                  {conversation.partner_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {conversation.partner_name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {conversation.partner_type}
                    </Badge>
                    {conversation.last_message_time && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.last_message_time)}
                      </span>
                    )}
                  </div>
                </div>
                {conversation.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConversationList;
