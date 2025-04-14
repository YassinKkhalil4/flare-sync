
// Mock data for conversations
export const mockConversations = [
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

// Helper function to generate mock messages
export const generateMockMessages = (conversationId: string) => {
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
      content: 'Hello! Thanks for reaching out. I\'d love to hear more about what you have in mind.',
      timestamp: '2023-04-05T10:35:00Z'
    },
    {
      id: `${conversationId}-3`,
      sender: partnerType === 'brand' ? conversation.partner.id : 'me',
      content: 'We\'re launching a new product next month and looking for creators like you to help promote it.',
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

// Helper function to format dates
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
