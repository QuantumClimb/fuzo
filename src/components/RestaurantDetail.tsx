
import React, { useState, memo } from 'react';
import { ArrowLeft, Phone, Globe, Clock, Star, MapPin, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Restaurant } from '@/types';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onBack: () => void;
}

// Skeleton loader for photo grid
const PhotoGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-2">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-muted animate-pulse h-24 rounded-md" />
    ))}
  </div>
);

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ restaurant, onBack }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  // Use the existing restaurant image from the Feed
  const heroImageUrl = restaurant.image;

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Hero Image Section */}
      {restaurant.image && restaurant.image !== '/placeholder.svg' && (
        <div className="relative h-48 bg-muted">
          <img
            src={heroImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white text-xl font-bold">{restaurant.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {renderStars(restaurant.rating)}
              <span className="text-white text-sm font-medium">{restaurant.rating}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                {restaurant.cuisine}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar (only if no hero image) */}
      {(!restaurant.image || restaurant.image === '/placeholder.svg') && (
        <div className="ios-header p-4 z-10">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold truncate text-foreground">{restaurant.name}</h1>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Header Card (only if no hero image) */}
          {(!restaurant.image || restaurant.image === '/placeholder.svg') && (
            <Card className="ios-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <span>{restaurant.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {restaurant.cuisine}
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-1">
                  {renderStars(restaurant.rating)}
                  <span className="ml-2 text-sm font-medium text-foreground">{restaurant.rating}</span>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Contact Information */}
          <Card className="ios-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <span className="text-sm text-foreground">{restaurant.address}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-primary">{restaurant.rating} stars</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-xs">
                  {restaurant.cuisine}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {restaurant.distance.toFixed(1)} km away
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Photo Attribution */}
          {restaurant.photoAttributions && restaurant.photoAttributions.length > 0 && (
            <Card className="ios-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center text-foreground">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Photo Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {restaurant.photoAttributions.map((attr, index) => (
                    <div key={index} className="text-sm text-foreground">
                      Photo by{' '}
                      {attr.uri ? (
                        <a 
                          href={attr.uri.startsWith('http') ? attr.uri : `https:${attr.uri}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline"
                        >
                          {attr.displayName || 'Contributor'}
                        </a>
                      ) : (
                        attr.displayName || 'Contributor'
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.name}&query_place_id=${restaurant.id}`;
                window.open(url, '_blank');
              }}
              className="flex items-center space-x-2 btn-ios"
            >
              <MapPin className="h-4 w-4" />
              <span>Directions</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.name}`;
                window.open(url, '_blank');
              }}
              className="flex items-center space-x-2 btn-ios"
            >
              <Globe className="h-4 w-4" />
              <span>View on Maps</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RestaurantDetail);
