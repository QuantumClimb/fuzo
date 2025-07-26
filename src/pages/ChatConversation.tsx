import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Smile, Paperclip, MoreVertical, Phone, Video, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { ChatMessage, Chat as ChatType } from '@/types';
import SEO from '@/components/SEO';

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

interface LocalChat extends ChatType {
  avatar?: string;
}



const ChatConversation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Mock chat data
  const mockChat: LocalChat = {
    id: id || '1',
    title: 'Foodie Friends',
    type: 'direct',
    participants: ['user1', 'user2'],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    unread_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        // Fallback to mock messages
        setMessages(mockMessages);
        return;
      }

      // Convert Supabase messages to local format
      const convertedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        senderAvatar: msg.sender_avatar,
        text: msg.message_text,
        timestamp: msg.created_at,
        isRead: msg.is_read,
        isCurrentUser: msg.sender_id === 'guest', // Replace with actual user ID
      }));

      setMessages(convertedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages(mockMessages);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`chat:${id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `chat_id=eq.${id}`
        }, 
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          const message: Message = {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            senderName: newMsg.sender_name,
            senderAvatar: newMsg.sender_avatar,
            text: newMsg.message_text,
            timestamp: newMsg.created_at,
            isRead: newMsg.is_read,
            isCurrentUser: newMsg.sender_id === 'guest', // Replace with actual user ID
          };
          setMessages(prev => [...prev, message]);
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${id}`
        },
        (payload) => {
          const updatedMsg = payload.new as ChatMessage;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMsg.id 
              ? { ...msg, isRead: updatedMsg.is_read }
              : msg
          ));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const messageText = newMessage.trim();
      setNewMessage('');

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        senderId: 'guest', // Replace with actual user ID
        senderName: 'You',
        text: messageText,
        timestamp: new Date().toISOString(),
        isRead: false,
        isCurrentUser: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);

      try {
        // Save message to Supabase
        const { data, error } = await supabase
          .from('chat_messages')
          .insert([{
            chat_id: id,
            sender_id: 'guest', // Replace with actual user ID
            sender_name: 'You',
            message_text: messageText,
            message_type: 'text',
            is_read: false
          }])
          .select()
          .single();

        if (error) {
          console.error('Error sending message:', error);
          // Remove optimistic message on error
          setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
          return;
        }

        // Update the optimistic message with real data
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? {
                ...msg,
                id: data.id,
                timestamp: data.created_at
              }
            : msg
        ));

        // Mark other participants' messages as read
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('chat_id', id)
          .neq('sender_id', 'guest'); // Replace with actual user ID

      } catch (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      }
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <SEO 
        title={`Chat with ${mockChat.title}`}
        description={`Chat with ${mockChat.title} about food, restaurants, and culinary experiences. Share recommendations and discover new dining spots together.`}
        keywords="food chat, restaurant recommendations, culinary discussions, food conversations"
        tags={['chat', 'food discussions', 'restaurant recommendations']}
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/chat')} className="text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={mockChat.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                {mockChat.title.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {mockChat.type === 'group' ? `${mockChat.participants.length} members` : 'Online'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-foreground">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 lg:max-w-4xl lg:mx-auto lg:w-full overflow-y-auto space-y-4">
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
              
              <GlassCard className={`${message.isCurrentUser 
                ? 'bg-primary/10 border-primary/20 text-foreground' 
                : 'bg-white/80 border-white/20 text-foreground'
              } ${message.id.startsWith('temp_') ? 'opacity-70' : ''}`}>
                <div className="p-3">
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${
                      message.isCurrentUser ? 'text-primary/70' : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                    {message.isCurrentUser && (
                      <div className="flex items-center space-x-1">
                        {message.isRead ? (
                          <span className="text-xs text-primary/60">✓✓</span>
                        ) : (
                          <span className="text-xs text-primary/60">✓</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md order-1">
              <GlassCard className="bg-white/80 border-white/20 text-foreground">
                <div className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white/80 backdrop-blur-md border-t border-white/20 p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation; 