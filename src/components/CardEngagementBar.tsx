
import { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CardEngagementBarProps {
  foodId: string;
  initialLikes?: number;
  initialComments?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLikeClick?: (foodId: string, isLiked: boolean) => void;
  onCommentClick?: (foodId: string) => void;
  onShareClick?: (foodId: string) => void;
  onSaveClick?: (foodId: string, isSaved: boolean) => void;
}

const CardEngagementBar = ({
  foodId,
  initialLikes = 0,
  initialComments = 0,
  isLiked = false,
  isSaved = false,
  onLikeClick,
  onCommentClick,
  onShareClick,
  onSaveClick
}: CardEngagementBarProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const { toast } = useToast();

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : prev - 1);
    onLikeClick?.(foodId, newLiked);
    
    toast({
      title: newLiked ? "❤️ Liked!" : "👍 Unliked",
      description: newLiked ? "Added to your favorites" : "Removed from favorites",
    });
  };

  const handleSave = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    onSaveClick?.(foodId, newSaved);
    
    toast({
      title: newSaved ? "🍽️ Saved to Plate!" : "📤 Removed from Plate",
      description: newSaved ? "Find it in your saved items" : "Removed from saved items",
    });
  };

  const handleShare = () => {
    onShareClick?.(foodId);
    toast({
      title: "📤 Shared!",
      description: "Post shared with your friends",
    });
  };

  const handleComment = () => {
    onCommentClick?.(foodId);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center space-x-1 ${liked ? 'text-fuzo-coral' : 'text-gray-600'}`}
        >
          <Heart size={20} className={liked ? 'fill-current' : ''} />
          <span className="text-sm">{likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleComment}
          className="flex items-center space-x-1 text-gray-600"
        >
          <MessageCircle size={20} />
          <span className="text-sm">{initialComments}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-gray-600"
        >
          <Share size={20} />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        className={`${saved ? 'text-fuzo-yellow' : 'text-gray-600'}`}
      >
        <Bookmark size={20} className={saved ? 'fill-current' : ''} />
      </Button>
    </div>
  );
};

export default CardEngagementBar;
