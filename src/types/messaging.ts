
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  partner: {
    id: string;
    name: string;
    avatar: string;
    type: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    read: boolean;
  };
}
