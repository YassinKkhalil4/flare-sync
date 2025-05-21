
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
      content: 'We would love to discuss a potential partnership for our new summer collection.',
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
      content: 'Your profile looks great! Would you be interested in promoting our new running shoes?',
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
      content: 'Thanks for the tips on improving my content strategy! The engagement has already increased by 20%.',
      timestamp: '2023-04-08T16:45:00Z',
      read: true
    }
  },
  {
    id: '4',
    partner: {
      id: 'b3',
      name: 'Under Armour',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=UnderArmour',
      type: 'brand'
    },
    lastMessage: {
      content: 'Hi there! We noticed your fitness content and think you'd be perfect for our new campaign.',
      timestamp: '2023-04-07T11:22:00Z',
      read: false
    }
  },
  {
    id: '5',
    partner: {
      id: 'c2',
      name: 'Sarah Williams',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Sarah',
      type: 'creator'
    },
    lastMessage: {
      content: 'Just wanted to check if you received my collaboration proposal from last week.',
      timestamp: '2023-04-05T15:38:00Z',
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
  
  // Define a set of messages based on conversation type
  if (partnerType === 'brand') {
    // Brand conversation
    return [
      {
        id: `${conversationId}-1`,
        sender: conversation.partner.id,
        content: `Hi there! This is ${partnerName}. We've been following your content and really like your style.`,
        timestamp: '2023-04-05T10:30:00Z'
      },
      {
        id: `${conversationId}-2`,
        sender: 'me',
        content: 'Hello! Thanks for reaching out. I\'m always open to new opportunities.',
        timestamp: '2023-04-05T10:35:00Z'
      },
      {
        id: `${conversationId}-3`,
        sender: conversation.partner.id,
        content: 'We\'re launching a new product next month and looking for creators like you to help promote it. We think your audience would be a great fit.',
        timestamp: '2023-04-05T10:40:00Z'
      },
      {
        id: `${conversationId}-4`,
        sender: 'me',
        content: 'That sounds interesting! What kind of content are you looking for and what's the timeline?',
        timestamp: '2023-04-05T10:45:00Z'
      },
      {
        id: `${conversationId}-5`,
        sender: conversation.partner.id,
        content: 'We're thinking 2-3 posts over the course of a month, starting in about 3 weeks. We'd provide you with the product, key messaging points, but would love for you to bring your own creative direction.',
        timestamp: '2023-04-05T10:50:00Z'
      },
      {
        id: `${conversationId}-6`,
        sender: 'me',
        content: 'That works with my schedule. What's your budget range for this campaign?',
        timestamp: '2023-04-05T10:55:00Z'
      },
      {
        id: `${conversationId}-7`,
        sender: conversation.partner.id,
        content: conversation.lastMessage.content,
        timestamp: conversation.lastMessage.timestamp
      }
    ];
  } else {
    // Creator conversation
    return [
      {
        id: `${conversationId}-1`,
        sender: conversation.partner.id,
        content: `Hey there! ${partnerName} here. I really enjoyed your recent post about content strategies.`,
        timestamp: '2023-04-05T10:30:00Z'
      },
      {
        id: `${conversationId}-2`,
        sender: 'me',
        content: 'Hi Alex! Thanks for reaching out. I'm glad you found it helpful.',
        timestamp: '2023-04-05T10:35:00Z'
      },
      {
        id: `${conversationId}-3`,
        sender: conversation.partner.id,
        content: 'I've been trying to improve my engagement rates. Do you have any specific tips that worked well for you?',
        timestamp: '2023-04-05T10:40:00Z'
      },
      {
        id: `${conversationId}-4`,
        sender: 'me',
        content: 'Absolutely! I found that posting at consistent times and using Instagram's new features like Reels has helped a lot. Also, responding quickly to comments can boost the algorithm in your favor.',
        timestamp: '2023-04-05T10:45:00Z'
      },
      {
        id: `${conversationId}-5`,
        sender: conversation.partner.id,
        content: conversation.lastMessage.content,
        timestamp: conversation.lastMessage.timestamp
      }
    ];
  }
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

// Generate a realistic recent date
export const getRecentDate = (daysAgo: number = 0, hoursAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

