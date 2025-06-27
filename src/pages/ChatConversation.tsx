
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Smile, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import messagesData from '@/data/messages.json';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  chatName?: string;
  chatAvatar?: string;
}

const ChatConversation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Transform the JSON data to match our Chat interface
  const transformedChats: Chat[] = messagesData.map(chat => ({
    id: chat.chatId, // Map chatId to id
    participants: chat.participants,
    messages: chat.messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      text: msg.text,
      timestamp: msg.timestamp,
      isRead: false // Default value since it's not in the JSON
    })),
    chatName: chat.title,
    chatAvatar: undefined // Not provided in JSON
  }));
  
  const currentChat = transformedChats.find(chat => chat.id === id);
  const currentUserId = 'user_1'; // Mock current user

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages);
    }
  }, [currentChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && currentChat) {
      const message: Message = {
        id: `msg_${Date.now()}`,
        senderId: currentUserId,
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isRead: false
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
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChatTitle = () => {
    if (currentChat?.chatName) {
      return currentChat.chatName;
    }
    return 'Chat';
  };

  const getChatAvatar = () => {
    if (currentChat?.chatAvatar) {
      return currentChat.chatAvatar;
    }
    return `https://ui-avatars.com/api/?name=${getChatTitle()}&background=random`;
  };

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chat not found</p>
      </div>
    );
  }

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
          <AvatarImage src={getChatAvatar()} />
          <AvatarFallback>{getChatTitle().charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{getChatTitle()}</h2>
          <p className="text-sm text-gray-500">
            {currentChat.participants.length} participants
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          
          return (
            <div 
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isCurrentUser 
                  ? 'bg-fuzo-coral text-white' 
                  : 'bg-white text-gray-800 shadow-sm'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  isCurrentUser ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
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
            className="bg-fuzo-coral hover:bg-fuzo-coral/90 p-2"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;
