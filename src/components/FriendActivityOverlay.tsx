
import { Badge } from '@/components/ui/badge';
import { Users, Heart } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  avatar: string;
}

interface FriendActivityOverlayProps {
  friends: Friend[];
  type: 'visited' | 'liked';
  className?: string;
}

const FriendActivityOverlay = ({ friends, type, className = '' }: FriendActivityOverlayProps) => {
  if (friends.length === 0) return null;

  const displayFriends = friends.slice(0, 3);
  const remainingCount = friends.length - 3;

  return (
    <div className={`absolute top-2 left-2 ${className}`}>
      <Badge 
        variant="secondary" 
        className="bg-fuzo-purple/90 text-white backdrop-blur-sm flex items-center space-x-1"
      >
        {type === 'visited' ? <Users size={12} /> : <Heart size={12} />}
        <div className="flex -space-x-1">
          {displayFriends.map((friend) => (
            <img
              key={friend.id}
              src={friend.avatar}
              alt={friend.name}
              className="w-4 h-4 rounded-full border border-white"
              title={friend.name}
            />
          ))}
        </div>
        <span className="text-xs">
          {friends.length === 1 
            ? `${friends[0].name} ${type === 'visited' ? 'visited' : 'liked'}`
            : `${friends.length} friends ${type === 'visited' ? 'visited' : 'liked'}`
          }
        </span>
      </Badge>
    </div>
  );
};

export default FriendActivityOverlay;
