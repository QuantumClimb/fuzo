
export interface FoodItem {
  id: string;
  image: string;
  title: string;
  location: string;
  username: string;
  tag: string;
  timestamp: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  posts: FoodItem[];
  savedItems: string[];
}

export interface Eatery {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  image: string;
  priceRange: string;
  isPriority?: boolean;
  relevanceScore?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  coordinates: { lat: number; lng: number };
  address: string;
  hours: string;
  image: string;
  description: string;
  visitCount: number;
  phoneNumber?: string;
  website?: string;
  features?: string[];
  reviewCount?: number;
  travelTimeMin?: number;
  reviews?: {
    userId: string;
    rating: number;
    text: string;
    date: string;
  }[];
  visitedByFriends?: string[];
}
