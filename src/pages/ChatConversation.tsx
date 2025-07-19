import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  isCurrentUser: boolean;
}

interface Chat {
  id: string;
  title: string;
  type: 'direct' | 'group';
  participants: string[];
  avatar?: string;
}

const ChatConversation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock chat data
  const mockChat: Chat = {
    id: id || '1',
    title: 'Foodie Friends',
    type: 'direct',
    participants: ['user1', 'user2'],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
  };

  // Mock messages data
  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: 'user2',
      senderName: 'Foodie Friends',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      text: 'Hey! Just tried that new Italian place downtown!',
      timestamp: '2:30 PM',
      isRead: true,
      isCurrentUser: false
    },
    {
      id: '2',
      senderId: 'user1',
      senderName: 'You',
      text: 'Oh really? How was it?',
      timestamp: '2:32 PM',
      isRead: true,
      isCurrentUser: true
    },
    {
      id: '3',
      senderId: 'user2',
      senderName: 'Foodie Friends',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      text: 'Amazing! The pasta was incredible and the atmosphere was perfect for a date night.',
      timestamp: '2:33 PM',
      isRead: true,
      isCurrentUser: false
    },
    {
      id: '4',
      senderId: 'user1',
      senderName: 'You',
      text: 'That sounds perfect! What was the name of the place?',
      timestamp: '2:35 PM',
      isRead: true,
      isCurrentUser: true
    },
    {
      id: '5',
      senderId: 'user2',
      senderName: 'Foodie Friends',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      text: 'It\'s called "Bella Vista" on Queen Street. You should definitely check it out!',
      timestamp: '2:36 PM',
      isRead: false,
      isCurrentUser: false
    }
  ];

  useEffect(() => {
    setMessages(mockMessages);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: `msg_${Date.now()}`,
        senderId: 'user1',
        senderName: 'You',
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        isRead: false,
        isCurrentUser: true
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/chat')}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={mockChat.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-strawberry to-grape text-white">
            {mockChat.title.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{mockChat.title}</h2>
          <p className="text-sm text-gray-500">
            {mockChat.type === 'group' ? `${mockChat.participants.length} members` : 'Online'}
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="p-2">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Video size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.isCurrentUser ? 'order-2' : 'order-1'}`}>
              {!message.isCurrentUser && (
                <Avatar className="h-8 w-8 mb-1">
                  <AvatarImage src={message.senderAvatar} />
                  <AvatarFallback className="bg-gradient-to-br from-lemon to-orange text-white text-xs">
                    {message.senderName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`${message.isCurrentUser 
                ? 'bg-gradient-to-r from-strawberry to-grape text-white' 
                : 'bg-white text-gray-800'
              }`}>
                <CardContent className="p-3">
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isCurrentUser ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Paperclip size={20} className="text-gray-500" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button variant="ghost" size="sm" className="p-2">
            <Smile size={20} className="text-gray-500" />
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-strawberry to-grape hover:from-strawberry/90 hover:to-grape/90 text-white p-2"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation; 