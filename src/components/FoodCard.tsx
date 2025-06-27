import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MapPin, Star, Clock, Phone, Globe, Navigation } from 'lucide-react';
import FoodDetailsDialog from '@/components/FoodDetailsDialog';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
}

interface RestaurantInfo {
  id: string;
  name: string;
  cuisine?: string;
  rating?: number;
  priceRange?: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  hours?: string;
  image?: string;
  phoneNumber?: string;
  website?: string;
  detailedPhotos?: string[];
  businessStatus?: string;
  openingHours?: {
    open_now?: boolean;
    isOpen?: boolean;
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
}

interface FoodCardData {
  id: string;
  name: string;
  type: string;
  cuisine: string;
  image: string;
  tags: string[];
  user: User;
  restaurant: RestaurantInfo;
  ingredients?: string[];
  description: string;
}

interface FoodCardProps {
  card: FoodCardData;
  onLike?: (cardId: string) => void;
  onShare?: (cardId: string) => void;
  onSave?: (cardId: string) => void;
  isLiked?: boolean;
  isSaved?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  enhanceWithGoogleData?: boolean;
}

const FoodCard = ({
  card,
  onLike,
  onShare,
  onSave,
  isLiked = false,
  isSaved = false,
  userLocation,
  enhanceWithGoogleData = true
}: FoodCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [expandedDescription, setExpandedDescription] = useState(false);

  // Get enhanced restaurant data from Google Places if coordinates available
  const { 
    restaurants: nearbyRestaurants, 
    loading: placesLoading 
  } = useGooglePlaces({
    location: card.restaurant.coordinates || { lat: 0, lng: 0 },
    radius: 100, // Very small radius to find exact restaurant
    keyword: card.restaurant.name,
    enabled: enhanceWithGoogleData && !!card.restaurant.coordinates
  });

  // Find matching restaurant or use original data
  const enhancedRestaurant = nearbyRestaurants.find(r => 
    r.name.toLowerCase().includes(card.restaurant.name.toLowerCase())
  ) || card.restaurant;

  // Get all available photos
  const allPhotos = [
    card.image,
    ...(enhancedRestaurant.detailedPhotos || []),
    enhancedRestaurant.image
  ].filter((photo, index, arr) => photo && arr.indexOf(photo) === index);

  const currentPhoto = allPhotos[currentPhotoIndex] || card.image;
  const isOpenNow = (enhancedRestaurant.openingHours as any)?.isOpen ?? (enhancedRestaurant.openingHours as any)?.open_now;
  const hasEnhancedData = enhancedRestaurant.detailedPhotos && enhancedRestaurant.detailedPhotos.length > 0;

  const handlePhotoNavigation = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'next') {
      setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
    } else {
      setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
    }
  };

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'call':
        if (enhancedRestaurant.phoneNumber) {
          window.open(`tel:${enhancedRestaurant.phoneNumber}`);
        }
        break;
      case 'directions':
        if (enhancedRestaurant.coordinates) {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${enhancedRestaurant.coordinates.lat},${enhancedRestaurant.coordinates.lng}`, '_blank');
        }
        break;
      case 'website':
        if (enhancedRestaurant.website) {
          window.open(enhancedRestaurant.website, '_blank');
        }
        break;
    }
  };

  const truncatedDescription = card.description.length > 120 
    ? card.description.substring(0, 120) + '...' 
    : card.description;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="relative">
          {/* Enhanced Photo Section */}
          <div className="relative h-64 overflow-hidden">
            <img 
              src={currentPhoto}
              alt={card.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={() => setShowDetails(true)}
            />
            
            {/* Photo Navigation */}
            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => handlePhotoNavigation('prev', e)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => handlePhotoNavigation('next', e)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ›
                </button>
                
                {/* Photo Indicators */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {allPhotos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Photo Counter */}
                <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                  {currentPhotoIndex + 1} / {allPhotos.length}
                </div>
              </>
            )}

            {/* Status Badges */}
            <div className="absolute top-3 left-3 flex flex-col space-y-2">
              {hasEnhancedData && (
                <Badge className="bg-green-500 text-white text-xs">
                  ✓ Verified
                </Badge>
              )}
              {isOpenNow !== undefined && (
                <Badge className={`${isOpenNow ? 'bg-green-500' : 'bg-red-500'} text-white text-xs`}>
                  {isOpenNow ? 'Open Now' : 'Closed'}
                </Badge>
              )}
              {enhancedRestaurant.businessStatus === 'OPERATIONAL' && (
                <Badge className="bg-blue-500 text-white text-xs">
                  Live Data
                </Badge>
              )}
            </div>

            {/* Quick Actions Overlay */}
            <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {enhancedRestaurant.phoneNumber && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-gray-800 hover:bg-white"
                  onClick={(e) => handleQuickAction('call', e)}
                >
                  <Phone size={14} />
                </Button>
              )}
              {enhancedRestaurant.coordinates && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-gray-800 hover:bg-white"
                  onClick={(e) => handleQuickAction('directions', e)}
                >
                  <Navigation size={14} />
                </Button>
              )}
              {enhancedRestaurant.website && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-gray-800 hover:bg-white"
                  onClick={(e) => handleQuickAction('website', e)}
                >
                  <Globe size={14} />
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Content */}
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 group-hover:text-fuzo-coral transition-colors">
                  {card.name}
                </h3>
                
                {/* Enhanced Restaurant Info */}
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="bg-fuzo-yellow/20 text-fuzo-dark">
                    {card.cuisine}
                  </Badge>
                  {enhancedRestaurant.priceRange && (
                    <span className="text-sm text-gray-600">{enhancedRestaurant.priceRange}</span>
                  )}
                  {enhancedRestaurant.rating && (
                    <div className="flex items-center space-x-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{enhancedRestaurant.rating}</span>
                    </div>
                  )}
                </div>

                {/* Restaurant Location */}
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin size={12} className="mr-1" />
                  <span>{enhancedRestaurant.address || card.user.location}</span>
                </div>

                {/* Enhanced Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {expandedDescription ? card.description : truncatedDescription}
                  {card.description.length > 120 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDescription(!expandedDescription);
                      }}
                      className="text-fuzo-coral hover:underline ml-1"
                    >
                      {expandedDescription ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike?.(card.id);
                  }}
                  className={`p-2 ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave?.(card.id);
                  }}
                  className={`p-2 ${isSaved ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      fill={isSaved ? 'currentColor' : 'none'}
                    />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Enhanced Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {card.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* User Info with Enhanced Data */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-2">
                <img 
                  src={card.user.avatar} 
                  alt={card.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{card.user.name}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={10} className="mr-1" />
                    <span>at {enhancedRestaurant.name}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Restaurant Hours */}
              {enhancedRestaurant.hours && (
                <div className="text-xs text-gray-500 text-right">
                  <div className="flex items-center">
                    <Clock size={10} className="mr-1" />
                    <span>{enhancedRestaurant.hours}</span>
                  </div>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <Button 
              className="w-full mt-3 bg-fuzo-coral hover:bg-fuzo-coral/90"
              onClick={() => setShowDetails(true)}
            >
              View Details & Reviews
            </Button>
          </CardContent>
        </div>
      </Card>

      {/* Enhanced Details Dialog */}
      <FoodDetailsDialog
        food={{
          id: card.id,
          image: currentPhoto,
          title: card.name,
          location: enhancedRestaurant.address || card.user.location,
          username: card.user.name,
          tag: card.cuisine,
          timestamp: new Date().toISOString(),
          description: card.description,
          coordinates: enhancedRestaurant.coordinates
        }}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onSaveToggle={onSave}
        isSaved={isSaved}
      />
    </>
  );
};

export default FoodCard;
