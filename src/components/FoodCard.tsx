import { useState } from 'react';
import { Heart, MapPin, Share, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import FoodDetailsDialog from '@/components/FoodDetailsDialog';
import CardEngagementBar from '@/components/CardEngagementBar';
import CommentModal from '@/components/CommentModal';
import FriendActivityOverlay from '@/components/FriendActivityOverlay';

// Sample data for friend activity and comments
const sampleFriends = [
  { id: '1', name: 'Emma', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Marcus', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: '3', name: 'Olivia', avatar: 'https://i.pravatar.cc/150?img=5' }
];

const sampleComments = [
  {
    id: '1',
    userId: '1',
    username: 'Emma',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    text: 'This looks absolutely delicious! What\'s the secret ingredient?',
    timestamp: '2h ago',
    likes: 5,
    replies: [
      {
        id: '1-1',
        userId: '2',
        username: 'Chef_Mike',
        userAvatar: 'https://i.pravatar.cc/150?img=12',
        text: 'The secret is in the seasoning blend! 🌶️',
        timestamp: '1h ago',
        likes: 2
      }
    ]
  },
  {
    id: '2',
    userId: '2',
    username: 'Marcus',
    userAvatar: 'https://i.pravatar.cc/150?img=8',
    text: 'I tried making this at home and it turned out amazing!',
    timestamp: '4h ago',
    likes: 8
  }
];

interface FoodCardProps {
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
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
}

const FoodCard = ({ 
  id, 
  image, 
  title, 
  location, 
  username, 
  tag,
  timestamp,
  description,
  coordinates,
  onSwipeLeft,
  onSwipeRight
}: FoodCardProps) => {
  const [startX, setStartX] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [direction, setDirection] = useState<string>('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { toast } = useToast();

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setOffsetX(diff);
    
    if (diff > 50) {
      setDirection('right');
    } else if (diff < -50) {
      setDirection('left');
    } else {
      setDirection('');
    }
  };

  const handleTouchEnd = () => {
    if (isSwiping) {
      if (offsetX > 100) {
        // Swipe right - save to plate
        onSwipeRight(id);
      } else if (offsetX < -100) {
        // Swipe left - discard
        onSwipeLeft(id);
      }
    }
    
    setIsSwiping(false);
    setOffsetX(0);
    setDirection('');
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    const diff = e.clientX - startX;
    setOffsetX(diff);
    
    if (diff > 50) {
      setDirection('right');
    } else if (diff < -50) {
      setDirection('left');
    } else {
      setDirection('');
    }
  };

  const handleMouseUp = () => {
    if (isSwiping) {
      if (offsetX > 100) {
        // Swipe right - save to plate
        onSwipeRight(id);
      } else if (offsetX < -100) {
        // Swipe left - discard
        onSwipeLeft(id);
      }
    }
    
    setIsSwiping(false);
    setOffsetX(0);
    setDirection('');
  };

  const handleMouseLeave = () => {
    if (isSwiping) {
      setIsSwiping(false);
      setOffsetX(0);
      setDirection('');
    }
  };

  const getCardStyle = () => {
    if (!isSwiping) return {};
    
    return {
      transform: `translateX(${offsetX}px) rotate(${offsetX / 20}deg)`,
      transition: isSwiping ? 'none' : 'transform 0.5s ease-out'
    };
  };

  const handleViewDetails = () => {
    setIsDetailsOpen(true);
  };

  const handleAddComment = (text: string) => {
    console.log('Adding comment:', text);
    // In a real app, this would call an API
  };

  return (
    <>
      <Card 
        className="fuzo-card overflow-hidden shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing relative"
        style={getCardStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Friend Activity Overlay */}
        <FriendActivityOverlay 
          friends={sampleFriends.slice(0, Math.floor(Math.random() * 3) + 1)} 
          type="liked" 
        />

        {direction === 'right' && (
          <div className="absolute top-1/2 left-4 bg-fuzo-coral text-white p-2 rounded-full z-10 transform -translate-y-1/2 rotate-12 text-xl font-bold border-2 border-white">
            SAVE
          </div>
        )}
        
        {direction === 'left' && (
          <div className="absolute top-1/2 right-4 bg-gray-500 text-white p-2 rounded-full z-10 transform -translate-y-1/2 -rotate-12 text-xl font-bold border-2 border-white">
            SKIP
          </div>
        )}
        
        <div className="relative">
          <img 
            src={image} 
            alt={title}
            className="w-full h-80 object-cover"
            draggable="false"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-fuzo-yellow text-fuzo-dark font-medium">{tag}</Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white text-xl font-bold">{title}</h3>
            <div className="flex items-center text-white/90 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              <span>{location}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="p-4 pb-0">
            <p className="text-sm text-gray-500">Shared by <span className="font-medium">@{username}</span></p>
          </div>
          
          {/* Engagement Bar */}
          <CardEngagementBar
            foodId={id}
            initialLikes={Math.floor(Math.random() * 50) + 5}
            initialComments={sampleComments.length}
            onLikeClick={(foodId, isLiked) => console.log('Like:', foodId, isLiked)}
            onCommentClick={() => setIsCommentsOpen(true)}
            onShareClick={handleViewDetails}
            onSaveClick={() => onSwipeRight(id)}
          />
        </CardContent>
      </Card>
      
      <FoodDetailsDialog
        food={{
          id,
          image,
          title,
          location,
          username,
          tag,
          timestamp,
          description,
          coordinates
        }}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onSaveToggle={() => onSwipeRight(id)}
      />

      <CommentModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        foodTitle={title}
        comments={sampleComments}
        onAddComment={handleAddComment}
      />
    </>
  );
};

export default FoodCard;
