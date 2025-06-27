import React, { useState } from 'react';
import { FoodItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MapPin, Clock, Share, ArrowLeft, Star, Phone, Globe, Navigation, ExternalLink, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FoodDetailsDialogProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToggle?: (id: string) => void;
  isSaved?: boolean;
}

// Mock Google Reviews data structure
interface GoogleReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  time: string;
  relativeTime: string;
}

const FoodDetailsDialog = ({
  food,
  isOpen,
  onClose,
  onSaveToggle,
  isSaved = false,
}: FoodDetailsDialogProps) => {
  const [saved, setSaved] = useState(isSaved);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  if (!food) return null;

  // Mock enhanced data (in real app, this would come from Google Places)
  const enhancedData = {
    rating: 4.5,
    reviewCount: 342,
    priceLevel: '$$',
    phoneNumber: '+91 11 2345 6789',
    website: 'https://restaurant-website.com',
    address: food.location || 'Restaurant Address',
    coordinates: food.coordinates || { lat: 28.6139, lng: 77.2090 },
    businessStatus: 'OPERATIONAL',
    openingHours: {
      open_now: true,
      periods: [
        { open: '11:00', close: '23:00', day: 'Monday' },
        { open: '11:00', close: '23:00', day: 'Tuesday' },
        { open: '11:00', close: '23:00', day: 'Wednesday' },
        { open: '11:00', close: '23:00', day: 'Thursday' },
        { open: '11:00', close: '23:00', day: 'Friday' },
        { open: '10:00', close: '24:00', day: 'Saturday' },
        { open: '10:00', close: '24:00', day: 'Sunday' },
      ]
    },
    photos: [
      food.image,
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&h=600&fit=crop'
    ],
    reviews: [
      {
        id: '1',
        author: 'Priya Sharma',
        avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random',
        rating: 5,
        text: 'Absolutely amazing experience! The food was incredible, service was top-notch, and the ambiance was perfect for a special dinner.',
        time: '2024-01-15',
        relativeTime: '2 weeks ago'
      },
      {
        id: '2',
        author: 'Rahul Gupta',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Gupta&background=random',
        rating: 4,
        text: 'Great food and reasonable prices. The pasta was exceptional. Only downside was the wait time, but totally worth it!',
        time: '2024-01-10',
        relativeTime: '3 weeks ago'
      },
      {
        id: '3',
        author: 'Sarah Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
        rating: 5,
        text: 'Best restaurant in the area! Fresh ingredients, creative dishes, and friendly staff. Will definitely come back.',
        time: '2024-01-08',
        relativeTime: '3 weeks ago'
      }
    ] as GoogleReview[]
  };

  const handleSaveToggle = () => {
    setSaved(!saved);
    if (onSaveToggle) {
      onSaveToggle(food.id);
    }
    
    toast({
      title: saved ? "Removed from plate" : "Added to plate",
      description: saved 
        ? "This item has been removed from your saved items" 
        : "This item has been added to your saved items",
      className: saved 
        ? "bg-gray-700 border-gray-600" 
        : "bg-green-600 border-green-500",
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'call':
        if (enhancedData.phoneNumber) {
          window.open(`tel:${enhancedData.phoneNumber}`);
        }
        break;
      case 'directions':
        if (enhancedData.coordinates) {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${enhancedData.coordinates.lat},${enhancedData.coordinates.lng}`, '_blank');
        }
        break;
      case 'website':
        if (enhancedData.website) {
          window.open(enhancedData.website, '_blank');
        }
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: food.title,
            text: `Check out ${food.title} on FUZO!`,
            url: window.location.href,
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link copied!",
            description: "Restaurant link copied to clipboard",
          });
        }
        break;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    return `${diffMonths} months ago`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl mx-auto p-0 overflow-hidden rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header with main photo */}
        <div className="relative">
          <AspectRatio ratio={16/9}>
            <img
              src={enhancedData.photos[currentPhotoIndex]}
              alt={food.title}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          
          {/* Photo navigation */}
          {enhancedData.photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentPhotoIndex((prev) => 
                  prev === 0 ? enhancedData.photos.length - 1 : prev - 1
                )}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentPhotoIndex((prev) => 
                  (prev + 1) % enhancedData.photos.length
                )}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                ›
              </button>
              
              {/* Photo indicators */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {enhancedData.photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Header controls */}
          <div className="absolute top-4 left-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/80 backdrop-blur-sm hover:bg-white" 
              onClick={onClose}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </Button>
          </div>

          {/* Status badges */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Badge className="bg-fuzo-yellow text-fuzo-dark font-medium">
              {food.tag}
            </Badge>
            {enhancedData.businessStatus === 'OPERATIONAL' && (
              <Badge className="bg-green-500 text-white">
                {enhancedData.openingHours.open_now ? 'Open Now' : 'Closed'}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-3xl font-bold mb-2">{food.title}</DialogTitle>
                
                {/* Rating and basic info */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(enhancedData.rating)}
                    <span className="font-medium ml-1">{enhancedData.rating}</span>
                    <span className="text-gray-500">({enhancedData.reviewCount} reviews)</span>
                  </div>
                  <span className="text-gray-600">{enhancedData.priceLevel}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin size={18} className="mr-2 text-fuzo-coral" />
                  <span>{enhancedData.address}</span>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('call')}
                >
                  <Phone size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('directions')}
                >
                  <Navigation size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('website')}
                >
                  <Globe size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('share')}
                >
                  <Share size={16} />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Description */}
                {food.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-700 leading-relaxed">{food.description}</p>
                  </div>
                )}

                {/* User info */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                    <img
                      src={`https://ui-avatars.com/api/?name=${food.username}&background=random`}
                      alt={food.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Shared by @{food.username}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      <span>Posted {formatDate(food.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleQuickAction('call')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Phone size={16} className="mr-2" />
                    Call Restaurant
                  </Button>
                  <Button 
                    onClick={() => handleQuickAction('directions')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Navigation size={16} className="mr-2" />
                    Get Directions
                  </Button>
                </div>

                {/* Save button */}
                <Button 
                  onClick={handleSaveToggle}
                  className={`w-full ${saved 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-fuzo-purple hover:bg-fuzo-purple/90'
                  }`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                  {saved ? 'Remove from Plate' : 'Add to Plate'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Customer Reviews</h3>
                  <div className="flex items-center space-x-2">
                    {renderStars(enhancedData.rating)}
                    <span className="font-medium">{enhancedData.rating} out of 5</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {enhancedData.reviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={review.avatar}
                          alt={review.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{review.author}</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">{review.relativeTime}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.text}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  View All {enhancedData.reviewCount} Reviews
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Photos ({enhancedData.photos.length})</h3>
                <div className="grid grid-cols-2 gap-3">
                  {enhancedData.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setCurrentPhotoIndex(index)}
                    >
                      <img
                        src={photo}
                        alt={`${food.title} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === currentPhotoIndex && (
                        <div className="absolute inset-0 border-2 border-fuzo-coral" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-6">
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone size={18} className="text-gray-500" />
                      <span>{enhancedData.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe size={18} className="text-gray-500" />
                      <a 
                        href={enhancedData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-fuzo-coral hover:underline flex items-center"
                      >
                        Visit Website
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin size={18} className="text-gray-500" />
                      <span>{enhancedData.address}</span>
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div>
                  <h3 className="font-semibold mb-3">Opening Hours</h3>
                  <div className="space-y-2">
                    {enhancedData.openingHours.periods.map((period, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium">{period.day}</span>
                        <span>{period.open} - {period.close}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center text-green-800">
                      <Clock size={16} className="mr-2" />
                      <span className="font-medium">
                        {enhancedData.openingHours.open_now ? 'Open Now' : 'Currently Closed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h3 className="font-semibold mb-3">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Price Range:</span>
                      <p>{enhancedData.priceLevel}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Rating:</span>
                      <p>{enhancedData.rating}/5 ({enhancedData.reviewCount} reviews)</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <p className="text-green-600">Operational</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Cuisine:</span>
                      <p>{food.tag}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodDetailsDialog;
