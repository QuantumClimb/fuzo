import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Users, MessageCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SEO from '@/components/SEO';

interface Chat {
  id: string;
  type: 'direct' | 'group';
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  participants: string[];
  unreadCount: number;
  avatar?: string;
}

const ChatList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for chats
  const mockChats: Chat[] = [
    {
      id: '1',
      type: 'direct',
      title: 'Foodie Friends',
      lastMessage: 'Just tried that new Italian place downtown!',
      lastMessageTime: '2m ago',
      participants: ['user1', 'user2'],
      unreadCount: 3,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      type: 'group',
      title: 'Toronto Food Hunters',
      lastMessage: 'Anyone up for Korean BBQ this weekend?',
      lastMessageTime: '15m ago',
      participants: ['user1', 'user2', 'user3', 'user4'],
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2d5?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      type: 'direct',
      title: 'Restaurant Reviews',
      lastMessage: 'The new sushi place is amazing!',
      lastMessageTime: '1h ago',
      participants: ['user1', 'user5'],
      unreadCount: 1,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '4',
      type: 'group',
      title: 'Weekend Brunch Club',
      lastMessage: 'Meeting at 11 AM at the usual spot',
      lastMessageTime: '2h ago',
      participants: ['user1', 'user2', 'user6', 'user7', 'user8'],
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '5',
      type: 'direct',
      title: 'Hidden Gems',
      lastMessage: 'Found this amazing hole-in-the-wall!',
      lastMessageTime: '3h ago',
      participants: ['user1', 'user9'],
      unreadCount: 2,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const filteredChats = mockChats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getParticipantNames = (participantIds: string[]) => {
    return `${participantIds.length} members`;
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <SEO 
        title="Messages"
        description="Connect with food lovers, share restaurant recommendations, and join food communities. Chat with friends about your latest culinary discoveries."
        keywords="food chat, restaurant recommendations, food communities, food lovers, culinary discussions"
        tags={['chat', 'messages', 'food communities', 'restaurant recommendations']}
      />
      
      {/* iOS Header */}
      <div className="ios-header sticky top-0 z-10 p-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        <div className="flex items-center justify-start mb-4 lg:hidden">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
            className="h-6 w-18"
          />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
          </div>
          <Button variant="ghost" size="sm" className="text-foreground">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="space-y-3">
        {filteredChats.map((chat) => (
          <Card 
            key={chat.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleChatClick(chat.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {chat.type === 'group' ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-strawberry to-grape rounded-full flex items-center justify-center">
                      <Users size={20} className="text-white" />
                    </div>
                  ) : (
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-lemon to-orange text-white">
                        {chat.title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {chat.unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-blueberry text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{chat.title}</h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {chat.lastMessage}
                  </p>
                  
                  {chat.type === 'group' && (
                    <p className="text-xs text-gray-400 mt-1">
                      {getParticipantNames(chat.participants)}
                    </p>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreVertical size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredChats.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No conversations found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try different search terms' : 'Start a new conversation'}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ChatList; 