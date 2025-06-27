import { FoodItem, ChatConversation, ChatMessage, User } from '../types';

export const foodItems: FoodItem[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    title: 'Rainbow Veggie Bowl',
    location: 'Fresh Harvest Kitchen, Downtown',
    username: 'healthyfoodie',
    tag: 'Must Try',
    timestamp: '2h ago',
    description: 'This colorful veggie bowl has all the nutrients you need! Perfect balance of proteins and fresh ingredients.',
    coordinates: {
      lat: 33.7490,
      lng: -84.3880
    }
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    title: 'Neapolitan Pizza',
    location: 'Flame & Crust, Midtown',
    username: 'pizza_hunter',
    tag: 'Hidden Gem',
    timestamp: '5h ago',
    description: 'Authentic wood-fired Neapolitan pizza with the perfect char on the crust. The margherita is a classic!',
    coordinates: {
      lat: 33.7815,
      lng: -84.3830
    }
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
    title: 'Loaded Street Tacos',
    location: 'Taqueria Del Sol, East Side',
    username: 'taco_tuesday',
    tag: 'Street Food',
    timestamp: '1d ago',
    description: 'These street tacos are loaded with flavor! The homemade salsa takes it to another level.',
    coordinates: {
      lat: 33.7680,
      lng: -84.3520
    }
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    title: 'Artisanal Charcuterie',
    location: 'Wine & Board, West End',
    username: 'cheese_please',
    tag: 'Date Night',
    timestamp: '2d ago',
    description: 'The perfect sharing platter with a selection of cured meats, artisanal cheeses, and homemade jam.',
    coordinates: {
      lat: 33.7470,
      lng: -84.4130
    }
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b',
    title: 'Matcha Pancakes',
    location: 'Green Tea House, Buckhead',
    username: 'brunch_queen',
    tag: 'Brunch Fav',
    timestamp: '3d ago',
    description: 'These fluffy matcha pancakes are not only Instagram-worthy but also delicious! The perfect brunch item.',
    coordinates: {
      lat: 33.8390,
      lng: -84.3750
    }
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1618889482923-38250401a84e',
    title: 'Ramen Bowl',
    location: 'Noodle District, Little Five Points',
    username: 'ramen_lover',
    tag: 'Comfort Food',
    timestamp: '4d ago',
    description: 'Rich broth simmered for 24 hours with handmade noodles and all the fixings. Soul-warming!',
    coordinates: {
      lat: 33.7615,
      lng: -84.3495
    }
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90',
    title: 'Grandma\'s Secret Burger',
    location: 'Home Kitchen Recipe',
    username: 'kitchen_wizard',
    tag: 'Home Recipe',
    timestamp: '5d ago',
    description: 'Family recipe passed down for generations. The secret is in the seasoning blend and cooking technique!',
    coordinates: {
      lat: 33.7550,
      lng: -84.3600
    }
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b',
    title: '5-Minute Avocado Toast Hack',
    location: 'Quick Kitchen Tips',
    username: 'foodhacker',
    tag: 'Food Hack',
    timestamp: '6d ago',
    description: 'Turn plain bread into a gourmet breakfast with this simple avocado mash technique. Perfect seasoning combo!',
    coordinates: {
      lat: 33.7400,
      lng: -84.3700
    }
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462',
    title: 'Korean BBQ Feast',
    location: 'Seoul Garden, Koreatown',
    username: 'bbq_master',
    tag: 'Must Try',
    timestamp: '1w ago',
    description: 'All-you-can-eat Korean BBQ with premium cuts. The banchan selection is incredible!',
    coordinates: {
      lat: 33.7720,
      lng: -84.3650
    }
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    title: 'Midnight Dessert Run',
    location: 'Sweet Dreams Bakery, 24/7',
    username: 'dessert_hunter',
    tag: 'Late Night',
    timestamp: '1w ago',
    description: 'When you need that late-night sugar fix! Their chocolate lava cake is life-changing.',
    coordinates: {
      lat: 33.7850,
      lng: -84.3450
    }
  }
];

// Enhanced chat conversations with group chats
export const chatConversations: ChatConversation[] = [
  {
    id: '1',
    userId: '101',
    userName: 'Emma Thompson',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'That ramen place was amazing! Thanks for the recommendation!',
    timestamp: '2m ago',
    unreadCount: 2
  },
  {
    id: 'group-1',
    userId: 'group',
    userName: 'Downtown Foodies',
    userAvatar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop&crop=center',
    lastMessage: 'Marcus: Found a new taco place! 🌮',
    timestamp: '15m ago',
    unreadCount: 5
  },
  {
    id: '2',
    userId: '102',
    userName: 'Marcus Chen',
    userAvatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'Hey, are you going to the food festival this weekend?',
    timestamp: '1h ago',
    unreadCount: 0
  },
  {
    id: 'group-2',
    userId: 'group',
    userName: 'Taco Tuesday Squad',
    userAvatar: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=150&h=150&fit=crop&crop=center',
    lastMessage: 'Olivia: See you all at 7pm! 🎉',
    timestamp: '2h ago',
    unreadCount: 0
  },
  {
    id: '3',
    userId: '103',
    userName: 'Olivia Parker',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'I tried that new dessert spot you tagged. Mind blown! 🤯',
    timestamp: '3h ago',
    unreadCount: 0
  },
  {
    id: 'group-3',
    userId: 'group',
    userName: 'Brunch Buddies',
    userAvatar: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=150&h=150&fit=crop&crop=center',
    lastMessage: 'Sarah: Next Sunday at Green Tea House?',
    timestamp: '5h ago',
    unreadCount: 2
  },
  {
    id: '4',
    userId: '104',
    userName: 'James Wilson',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Check out this burger place I just found!',
    timestamp: '1d ago',
    unreadCount: 0
  },
  {
    id: 'group-4',
    userId: 'group',
    userName: 'Pizza Lovers United',
    userAvatar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop&crop=center',
    lastMessage: 'Jake: New wood-fired place opened!',
    timestamp: '1d ago',
    unreadCount: 0
  },
  {
    id: '5',
    userId: '105',
    userName: 'Sophia Rodriguez',
    userAvatar: 'https://i.pravatar.cc/150?img=9',
    lastMessage: 'Are we still on for dinner at the new fusion place?',
    timestamp: '2d ago',
    unreadCount: 1
  },
  {
    id: 'group-5',
    userId: 'group',
    userName: 'Late Night Eats',
    userAvatar: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop&crop=center',
    lastMessage: 'Mike: 24/7 donut shop discovery! 🍩',
    timestamp: '3d ago',
    unreadCount: 0
  }
];

export const chatMessages: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: '101',
      senderId: '101',
      text: 'Hey! Have you tried the new ramen place downtown?',
      timestamp: '2d ago',
      isRead: true
    },
    {
      id: '102',
      senderId: 'me',
      text: 'Not yet! Is it good?',
      timestamp: '2d ago',
      isRead: true
    },
    {
      id: '103',
      senderId: '101',
      text: 'It\'s amazing! The tonkotsu broth is incredible.',
      timestamp: '2d ago',
      isRead: true
    },
    {
      id: '104',
      senderId: 'me',
      text: 'Nice! I\'ll check it out this weekend. Thanks for the recommendation!',
      timestamp: '1d ago',
      isRead: true
    },
    {
      id: '105',
      senderId: '101',
      text: 'Let me know what you think! Their gyoza are also must-try.',
      timestamp: '1d ago',
      isRead: true
    },
    {
      id: '106',
      senderId: 'me',
      text: 'Will do! I love a good gyoza 😋',
      timestamp: '1d ago',
      isRead: true
    },
    {
      id: '107',
      senderId: '101',
      text: 'That ramen place was amazing! Thanks for the recommendation!',
      timestamp: '2m ago',
      isRead: false
    },
    {
      id: '108',
      senderId: '101',
      text: 'We should go together next time!',
      timestamp: '1m ago',
      isRead: false
    }
  ],
  '2': [
    {
      id: '201',
      senderId: '102',
      text: 'Hey, are you going to the food festival this weekend?',
      timestamp: '1h ago',
      isRead: true
    }
  ],
  'group-1': [
    {
      id: 'g1-1',
      senderId: '101',
      text: 'Hey everyone! Found this amazing ramen place',
      timestamp: '1h ago',
      isRead: true
    },
    {
      id: 'g1-2',
      senderId: '102',
      text: 'Ooh where is it? I\'m always looking for good ramen!',
      timestamp: '45m ago',
      isRead: true
    },
    {
      id: 'g1-3',
      senderId: '101',
      text: 'It\'s in Little Five Points - Noodle District',
      timestamp: '40m ago',
      isRead: true
    },
    {
      id: 'g1-4',
      senderId: '102',
      text: 'Found a new taco place! 🌮',
      timestamp: '15m ago',
      isRead: false
    }
  ]
};

export const currentUser: User = {
  id: 'me',
  name: 'Alex Johnson',
  username: 'foodie_alex',
  avatar: 'https://i.pravatar.cc/150?img=12',
  bio: 'Food explorer 🍜 | Photo enthusiast 📸 | Always hungry for new flavors and experiences!',
  posts: [
    {
      id: '7',
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f',
      title: 'Berry Parfait',
      location: 'Morning Glory Cafe',
      username: 'foodie_alex',
      tag: 'Breakfast',
      timestamp: '1w ago',
      coordinates: {
        lat: 33.7700,
        lng: -84.3650
      }
    },
    {
      id: '8',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
      title: 'Truffle Pasta',
      location: 'Pasta Palace',
      username: 'foodie_alex',
      tag: 'Italian',
      timestamp: '2w ago',
      coordinates: {
        lat: 33.7590,
        lng: -84.3920
      }
    }
  ],
  savedItems: ['1', '3', '5']
};
