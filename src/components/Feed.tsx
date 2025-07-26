
import React, { useState, useEffect } from 'react';
import { memo } from 'react';
import { Heart, MessageCircle, Share, MapPin, Clock, Utensils, Search, X, Star, Navigation, ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import GlassButton from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// Skeleton loader component
const FeedSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse ios-card p-4 flex space-x-4">
        <div className="bg-muted h-24 w-24 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

interface ImagePost {
  id: string;
  name: string;
  url: string;
  created_at: string;
  metadata?: {
    user_email?: string;
    location?: string;
    user_avatar?: string;
  };
}

const Feed: React.FC = () => {
  const [imageFeed, setImageFeed] = useState<ImagePost[]>([]);
  const [imageFeedLoading, setImageFeedLoading] = useState(false);
  const [imageFeedError, setImageFeedError] = useState<string | null>(null);

  useEffect(() => {
    loadImageFeed();
  }, []);

  const loadImageFeed = async () => {
    setImageFeedLoading(true);
    setImageFeedError(null);

    try {
      // List all files in the guest folder of the guestimages bucket
      const { data: files, error } = await supabase.storage
        .from('guestimages')
        .list('guest', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error loading images:', error);
        setImageFeedError('Failed to load images from storage');
        return;
      }

      if (!files || files.length === 0) {
        setImageFeed([]);
        return;
      }

      // Get public URLs for all images
      const imagePosts: ImagePost[] = files
        .filter(file => file.name && (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png') || file.name.endsWith('.webp')))
        .map(file => {
          const { data: urlData } = supabase.storage
            .from('guestimages')
            .getPublicUrl(`guest/${file.name}`);

          return {
            id: file.id || file.name,
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at || new Date().toISOString(),
            metadata: file.metadata || {}
          };
        });

      setImageFeed(imagePosts);
      console.log('Loaded images:', imagePosts.length);
    } catch (error) {
      console.error('Error in loadImageFeed:', error);
      setImageFeedError('Failed to load images');
    } finally {
      setImageFeedLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleLike = (postId: string) => {
    console.log('Liked post:', postId);
    toast.success('Post liked!');
  };

  const handleShare = (post: ImagePost) => {
    console.log('Sharing post:', post.name);
    if (navigator.share) {
      navigator.share({
        title: 'Check out this food photo!',
        text: 'Shared from FUZO',
        url: post.url,
      });
    } else {
      navigator.clipboard.writeText(post.url);
      toast.success('Image URL copied to clipboard!');
    }
  };

  // Show skeleton loader while loading
  if (imageFeedLoading) {
    return <FeedSkeleton />;
  }

  return (
    <div className="flex flex-col space-y-4 lg:pb-0 pb-20">
      {/* iOS Header */}
      <div className="ios-header sticky top-0 z-10 p-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        <div className="flex items-center justify-start mb-4 lg:hidden">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
            className="h-6 w-18"
          />
        </div>

        {/* Enhanced Info Banner */}
        <div className="glass-candy text-center py-4 px-6 text-sm mb-4 rounded-2xl shadow-md border border-white/30">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">🍰</span>
            <span className="font-cta text-base font-semibold text-gradient">Community Snaps</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You're viewing snaps from the community. Add your own from the Camera tab!
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        {/* Error State */}
        {imageFeedError && (
          <Alert className="border-destructive/50 bg-destructive/10 mb-4">
            <AlertDescription className="text-destructive">{imageFeedError}</AlertDescription>
          </Alert>
        )}

        {/* No Images Found */}
        {imageFeed.length === 0 && !imageFeedLoading && (
          <div className="text-center py-8 space-y-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
              <Utensils className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No Images Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share a food photo! Use the Camera tab to upload your delicious finds.
              </p>
            </div>
            <Button 
              onClick={loadImageFeed}
              className="btn-ios mt-4"
            >
              Refresh Feed
            </Button>
          </div>
        )}

        {/* Images Feed */}
        {imageFeed.length > 0 && (
          <div className="space-y-6">
            {imageFeed.map((post) => (
              <GlassCard key={post.id} className="overflow-hidden floating transform-gpu transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <div className="p-0">
                  {/* Header */}
                  <div className="p-4 pb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="avatar-ios h-8 w-8">
                        <AvatarImage src={post.metadata?.user_avatar || '/placeholder.svg'} alt={post.metadata?.user_email || 'Guest'} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {post.metadata?.user_email ? post.metadata.user_email[0] : 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-foreground">{post.metadata?.user_email || 'Guest'}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
                        </div>
                        {post.metadata?.location && (
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">{post.metadata.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Image */}
                  <div className="relative aspect-square">
                    <img
                      src={post.url}
                      alt="Community food photo"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Failed to load image:', post.url);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  {/* Footer */}
                  <div className="p-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-1 p-0 hover:text-primary text-muted-foreground"
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{Math.floor(Math.random() * 100) + 10}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-1 p-0 hover:text-primary text-muted-foreground"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{Math.floor(Math.random() * 20) + 1}</span>
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-1 p-0 hover:text-primary text-muted-foreground"
                        onClick={() => handleShare(post)}
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Feed);
