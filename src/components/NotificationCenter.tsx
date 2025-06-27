
import { useState } from 'react';
import { Bell, Users, Heart, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'group_added' | 'friend_activity' | 'comment' | 'like';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'group_added',
    title: 'Added to Group Chat',
    message: 'You were added to "Downtown Foodies" group',
    timestamp: '5m ago',
    isRead: false,
    avatar: 'https://i.pravatar.cc/150?img=10'
  },
  {
    id: '2',
    type: 'friend_activity',
    title: 'Friends Activity',
    message: '3 friends saved the same dish as you',
    timestamp: '1h ago',
    isRead: false
  },
  {
    id: '3',
    type: 'comment',
    title: 'New Comment',
    message: 'Emma commented on your Ramen Bowl post',
    timestamp: '2h ago',
    isRead: true,
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: '4',
    type: 'like',
    title: 'Post Liked',
    message: 'Marcus and 5 others liked your post',
    timestamp: '3h ago',
    isRead: true,
    avatar: 'https://i.pravatar.cc/150?img=8'
  },
  {
    id: '5',
    type: 'group_added',
    title: 'Group Invite',
    message: 'You were invited to "Taco Tuesday Squad"',
    timestamp: '1d ago',
    isRead: true
  }
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'group_added':
        return <Users size={16} className="text-fuzo-purple" />;
      case 'friend_activity':
        return <Heart size={16} className="text-fuzo-coral" />;
      case 'comment':
        return <MessageCircle size={16} className="text-fuzo-yellow" />;
      case 'like':
        return <Heart size={16} className="text-fuzo-coral" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-fuzo-coral text-white text-xs flex items-center justify-center p-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md mx-auto h-[70vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Notifications</DialogTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-fuzo-coral text-sm"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-fuzo-coral/20 shadow-sm'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.avatar ? (
                        <img 
                          src={notification.avatar} 
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {getIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-auto p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                      <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-400 mt-1">{notification.timestamp}</span>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-fuzo-coral rounded-full absolute top-3 right-3"></div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationCenter;
