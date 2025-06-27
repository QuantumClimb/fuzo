
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import messagesData from '@/data/messages.json';
import usersData from '@/data/users.json';

interface Chat {
  chatId: string;
  type: 'direct' | 'group';
  participants: string[];
  title: string;
  lastMessage: string;
  lastMessageTime: string;
}

const ChatList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const chats = messagesData as Chat[];
  const users = usersData;

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getParticipantNames = (participantIds: string[]) => {
    return participantIds
      .map(id => getUserById(id)?.name || 'Unknown')
      .join(', ');
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Header title="Messages" showBackButton={false} />
      
      <div className="fuzo-page pb-24">
        <div className="fuzo-container">
          {/* Search and Create Group */}
          <div className="flex space-x-2 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button size="icon" className="bg-fuzo-coral hover:bg-fuzo-coral/90">
              <Plus size={20} />
            </Button>
          </div>

          {/* Chat List */}
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <Link 
                key={chat.chatId}
                to={`/chat/${chat.chatId}`}
                className="block"
              >
                <div className="fuzo-card hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {chat.type === 'group' ? (
                        <div className="w-12 h-12 bg-gradient-to-br from-fuzo-coral to-fuzo-purple rounded-full flex items-center justify-center">
                          <Users size={20} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-fuzo-yellow to-fuzo-coral rounded-full flex items-center justify-center">
                          <MessageCircle size={20} className="text-white" />
                        </div>
                      )}
                      {chat.type === 'group' && (
                        <Badge className="absolute -top-1 -right-1 bg-fuzo-purple text-white text-xs px-1">
                          {chat.participants.length}
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
                  </div>
                </div>
              </Link>
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
    </div>
  );
};

export default ChatList;
