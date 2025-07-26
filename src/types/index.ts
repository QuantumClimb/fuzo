export interface Post {
  id: string;
  image: string;
  caption: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  username: string;
  avatar: string;
  type?: 'user' | 'restaurant';
  place_id?: string;
}

export interface PhotoAttribution {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  cuisine: string;
  priceLevel: number;
  image: string;
  distance: number;
  photoAttributions?: PhotoAttribution[];
}

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface RestaurantDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating: number;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
    attributions?: PhotoAttribution[];
  }>;
  opening_hours?: {
    weekday_text?: string[];
    isOpen?: () => boolean;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// Phase 2: Enhanced Types for Swipe Feed
export interface SwipeCard {
  id: string;
  title: string;
  description: string;
  image: string;
  cuisine: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  priceRange?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  recipe?: {
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
  };
  source?: {
    restaurant?: string;
    chef?: string;
    website?: string;
  };
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SwipeAction {
  id: string;
  user_id: string;
  card_id: string;
  direction: 'left' | 'right' | 'up' | 'down';
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
}

// Phase 2: Video Feed Types
export interface VideoPost {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  tags: string[];
  uploader: {
    id: string;
    username: string;
    avatar: string;
  };
  likes_count: number;
  views_count: number;
  duration?: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'upload';
  created_at: string;
  updated_at: string;
}

// Phase 2: Enhanced Chat Types
export interface Chat {
  id: string;
  type: 'direct' | 'group';
  title: string;
  participants: string[];
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_text: string;
  message_type: 'text' | 'image' | 'location' | 'restaurant';
  media_url?: string;
  location_data?: {
    lat: number;
    lng: number;
    name: string;
  };
  restaurant_data?: {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
  };
  is_read: boolean;
  created_at: string;
}

// Phase 2: Friend Visits for Social Map
export interface FriendVisit {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  restaurant_id: string;
  restaurant_name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  visit_date: string;
  rating?: number;
  review?: string;
  emoji_reaction?: string;
  created_at: string;
}

// Phase 2: User Preferences
export interface UserPreferences {
  id: string;
  user_id: string;
  favorite_cuisines: string[];
  dietary_restrictions: string[];
  price_range: 'low' | 'medium' | 'high';
  preferred_distance: number;
  notification_settings: {
    new_restaurants: boolean;
    friend_visits: boolean;
    chat_messages: boolean;
  };
  created_at: string;
  updated_at: string;
}

// Phase 2: Enhanced User Profile
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  favorite_cuisines: string[];
  total_swipes: number;
  total_likes: number;
  total_saved: number;
  member_since: string;
  last_active: string;
  preferences: UserPreferences;
}
