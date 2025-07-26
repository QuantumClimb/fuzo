import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MapPin, Clock, Play, ExternalLink, Share2 } from 'lucide-react';

const VideoFeedTest: React.FC = () => {
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  
  // Mock data for testing
  const mockVideos = [
    {
      id: '1',
      title: 'How to Make Perfect Pasta',
      description: 'Learn the secrets to cooking al dente pasta like a pro',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      location: 'Toronto, ON',
      tags: ['cooking', 'pasta', 'tutorial'],
      uploader: {
        id: 'chef1',
        username: 'ChefMarco',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      platform: 'youtube' as const,
      likes_count: 156,
      views_count: 1200,
      duration: 180,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Sushi Making Masterclass',
      description: 'Watch a master sushi chef create beautiful rolls',
      video_url: 'https://www.tiktok.com/@sushimaster/video/123456789',
      thumbnail_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
      location: 'Toronto, ON',
      tags: ['sushi', 'masterclass', 'japanese'],
      uploader: {
        id: 'chef2',
        username: 'SushiMaster',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      platform: 'tiktok' as const,
      likes_count: 89,
      views_count: 800,
      duration: 120,
      created_at: new Date().toISOString()
    }
  ];

  const handleVideoLike = (videoId: string) => {
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
    console.log(`Video ${videoId} ${isLiked ? 'unliked' : 'liked'}`);
  };

  const handleVideoShare = (video: typeof mockVideos[0]) => {
    console.log('Sharing video:', video.title);
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: video.video_url,
      });
    } else {
      navigator.clipboard.writeText(`${video.title}\n${video.video_url}`);
      alert('Link copied to clipboard!');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    return '2 hours ago';
  };

  return (
    <div className="space-y-6 p-4 lg:pb-0 pb-20">
      {/* iOS Header */}
      <div className="ios-header sticky top-0 z-10 p-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        {/* Logo */}
        <div className="flex items-center justify-start mb-4 lg:hidden">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
            className="h-6 w-18"
          />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{mockVideos.length} videos</Badge>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVideos.map((video) => {
          const isLiked = likedVideos.has(video.id);
          
          return (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-muted">
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Platform badge */}
                <Badge className="absolute top-2 left-2 bg-black/70 text-white text-xs">
                  {video.platform.toUpperCase()}
                </Badge>
                
                {/* Duration badge */}
                <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                  {formatDuration(video.duration)}
                </Badge>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                    onClick={() => window.open(video.video_url, '_blank')}
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Watch
                  </Button>
                </div>
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
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{video.location}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
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
    </div>
  );
};

export default VideoFeedTest; 