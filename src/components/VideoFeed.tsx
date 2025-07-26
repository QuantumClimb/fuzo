import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MapPin, Clock, Play, ExternalLink, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { VideoPost } from '@/types';
import { toast } from 'sonner';

interface VideoFeedProps {
  onVideoLike?: (videoId: string) => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ onVideoLike }) => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());

  // Fetch video posts from Supabase
  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('video_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Filter by tag if selected
      if (selectedTag !== 'all') {
        query = query.contains('tags', [selectedTag]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  // Handle video like
  const handleVideoLike = async (videoId: string) => {
    try {
      const isLiked = likedVideos.has(videoId);
      
      if (isLiked) {
        setLikedVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
      } else {
        setLikedVideos(prev => new Set(prev).add(videoId));
      }

      // Update like count in Supabase
      const video = videos.find(v => v.id === videoId);
      if (video) {
        const newLikesCount = isLiked ? video.likes_count - 1 : video.likes_count + 1;
        
        const { error } = await supabase
          .from('video_posts')
          .update({ likes_count: newLikesCount })
          .eq('id', videoId);

        if (error) {
          console.error('Error updating like count:', error);
        } else {
          // Update local state
          setVideos(prev => prev.map(v => 
            v.id === videoId 
              ? { ...v, likes_count: newLikesCount }
              : v
          ));
        }
      }

      onVideoLike?.(videoId);
    } catch (error) {
      console.error('Error handling video like:', error);
    }
  };

  // Handle video share
  const handleVideoShare = async (video: VideoPost) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: video.video_url,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${video.title}\n${video.video_url}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  // Extract video ID from different platforms
  const getVideoEmbedUrl = (videoUrl: string, platform: string) => {
    try {
      const url = new URL(videoUrl);
      
      switch (platform) {
        case 'youtube': {
          const youtubeId = url.searchParams.get('v') || url.pathname.split('/').pop();
          return `https://www.youtube.com/embed/${youtubeId}`;
        }
        
        case 'tiktok':
          // TikTok doesn't provide direct embed URLs, so we'll show the original URL
          return videoUrl;
        
        case 'instagram': {
          // Instagram Reels embed
          const instagramId = url.pathname.split('/').pop();
          return `https://www.instagram.com/p/${instagramId}/embed/`;
        }
        
        default:
          return videoUrl;
      }
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return videoUrl;
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const videoTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - videoTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Get all unique tags from videos
  const getAllTags = () => {
    const tags = new Set<string>();
    videos.forEach(video => {
      video.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  // Load videos on mount and when filters change
  useEffect(() => {
    fetchVideos();
  }, [selectedTag]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading videos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Video Feed</h2>
          <Badge variant="secondary">{videos.length} videos</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1 rounded-full bg-background border text-sm"
          >
            <option value="all">All Tags</option>
            {getAllTags().map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const isLiked = likedVideos.has(video.id);
          const embedUrl = getVideoEmbedUrl(video.video_url, video.platform);
          
          return (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Video Thumbnail/Embed */}
              <div className="relative aspect-video bg-muted">
                {video.platform === 'youtube' ? (
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : video.platform === 'tiktok' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-600">
                    <div className="text-center text-white">
                      <Play className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">TikTok Video</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
                        onClick={() => window.open(video.video_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Watch on TikTok
                      </Button>
                    </div>
                  </div>
                ) : video.platform === 'instagram' ? (
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency={true}
                  />
                ) : (
                  <video
                    src={video.video_url}
                    poster={video.thumbnail_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                
                {/* Platform badge */}
                <Badge className="absolute top-2 left-2 bg-black/70 text-white text-xs">
                  {video.platform.toUpperCase()}
                </Badge>
                
                {/* Duration badge */}
                {video.duration && (
                  <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                    {formatDuration(video.duration)}
                  </Badge>
                )}
              </div>

              {/* Video Info */}
              <CardContent className="p-4">
                {/* Uploader info */}
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={video.uploader.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {video.uploader.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.uploader.username}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatTimeAgo(video.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Video title and description */}
                <div className="mb-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                </div>

                {/* Location */}
                {video.location && (
                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{video.location}</span>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {video.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{video.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats and actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{video.views_count} views</span>
                    <span>{video.likes_count} likes</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVideoLike(video.id)}
                      className={`p-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVideoShare(video)}
                      className="p-2 text-muted-foreground"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {videos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No videos found</h3>
          <p className="text-sm text-muted-foreground">
            {selectedTag !== 'all' ? `No videos with tag "${selectedTag}"` : 'No videos available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoFeed; 