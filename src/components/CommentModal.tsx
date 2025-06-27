import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import { validateAndSanitize, commentSchema, rateLimitedAction } from '@/utils/validation';
import { securityLogger } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodTitle: string;
  comments: Comment[];
  onAddComment: (text: string) => void;
}

const CommentModal = ({
  isOpen,
  onClose,
  foodTitle,
  comments,
  onAddComment
}: CommentModalProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    // Validate and sanitize input
    const validation = validateAndSanitize(commentSchema, {
      text: newComment,
      userId: 'current_user',
      username: 'current_user',
      timestamp: new Date().toISOString()
    }, 'comment_submission');

    if (!validation.success) {
      setValidationError(validation.errors?.[0] || 'Invalid input');
      securityLogger.logEvent('suspicious_activity', {
        action: 'invalid_comment_submission',
        errors: validation.errors
      }, 'medium');
      
      toast({
        title: "Security Warning",
        description: "Your comment contains invalid content and cannot be posted.",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    const allowed = rateLimitedAction(() => {
      onAddComment(validation.data!.text);
      setNewComment('');
      setReplyTo(null);
      setValidationError(null);
    }, `comment_${Date.now()}`, 5);

    if (!allowed) {
      toast({
        title: "Rate Limit Exceeded",
        description: "You're posting comments too quickly. Please wait a moment.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewComment(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
    
    // Real-time validation feedback
    if (value.length > 500) {
      setValidationError('Comment is too long (max 500 characters)');
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex space-x-3 ${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <img 
        src={comment.userAvatar} 
        alt={comment.username}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{comment.username}</span>
            <span className="text-xs text-gray-500">{comment.timestamp}</span>
          </div>
          <p className="text-sm text-gray-800">{comment.text}</p>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <button className="flex items-center space-x-1 text-xs text-gray-500">
            <Heart size={12} />
            <span>{comment.likes}</span>
          </button>
          {!isReply && (
            <button 
              onClick={() => setReplyTo(comment.id)}
              className="text-xs text-gray-500"
            >
              Reply
            </button>
          )}
        </div>
        {comment.replies?.map((reply) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">Comments on {foodTitle}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No comments yet</p>
                <p className="text-gray-400 text-sm">Be the first to comment!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t pt-4 mt-4">
          {replyTo && (
            <div className="mb-2 text-sm text-gray-600">
              Replying to comment...
              <button 
                onClick={() => setReplyTo(null)}
                className="ml-2 text-fuzo-coral"
              >
                Cancel
              </button>
            </div>
          )}
          
          {validationError && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-center text-sm text-red-700">
              <AlertTriangle size={16} className="mr-2" />
              {validationError}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              value={newComment}
              onChange={handleInputChange}
              placeholder="Add a comment..."
              className={`flex-1 ${validationError ? 'border-red-300' : ''}`}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              maxLength={500}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!newComment.trim() || !!validationError}
              size="sm"
              className="bg-fuzo-coral hover:bg-fuzo-coral/90"
            >
              <Send size={16} />
            </Button>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{newComment.length}/500 characters</span>
            <span>Comments are moderated for security</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;
