import React, { useState } from 'react';
import { MapPin, Search, X, Star, Navigation, Utensils, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RestaurantDetail from './RestaurantDetail';
import { useLocationSearch, useNearbyRestaurants } from '@/hooks/useGoogleMaps';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Restaurant, UserLocation } from '@/types';
import { LocationSearchResult } from '@/lib/googleMaps';

const QuickSearch: React.FC = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  // Location detection
  const { location: currentLocation, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();

  // Use current location or selected location for restaurants
  const activeLocation = selectedLocation || currentLocation;
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useNearbyRestaurants(activeLocation);

  // Location search functionality
  const { results, loading: searchLoading, error: searchError, searchLocations, clearResults } = useLocationSearch();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant.id);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      setShowSearchResults(true);
      searchLocations(value);
    } else {
      setShowSearchResults(false);
      clearResults();
    }
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation({
      lat: location.location.lat,
      lng: location.location.lng,
    });
    setLocationName(location.name);
    setSearchQuery('');
    setShowSearchResults(false);
    clearResults();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    clearResults();
  };

  const handleDetectLocation = () => {
    getCurrentLocation();
    setSelectedLocation(null);
    setLocationName('');
  };

  const clearSelectedLocation = () => {
    setSelectedLocation(null);
    setLocationName('');
  };

  // Convert Restaurant to Post-like format for display
  const createPostFromRestaurant = (restaurant: Restaurant, index: number) => {
    return {
      id: restaurant.id,
      image: restaurant.image,
      caption: `Great ${restaurant.cuisine} spot with ${restaurant.rating} stars! Perfect for a delicious meal.`,
      location: restaurant.address,
      coordinates: restaurant.coordinates,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Random time within last 24h
      username: 'FoodieBot',
      avatar: '/placeholder.svg',
      type: 'restaurant' as const,
      place_id: restaurant.id,
      rating: restaurant.rating,
      cuisine: restaurant.cuisine,
      distance: restaurant.distance,
      imageWebp: restaurant.image.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
    };
  };

  // Filter restaurants to only those with a valid name and image
  const validRestaurants = restaurants.filter((restaurant) => {
    const hasValidName = typeof restaurant.name === 'string' && restaurant.name.trim().length > 0;
    const hasValidImage = typeof restaurant.image === 'string' && restaurant.image.trim().length > 0 && !restaurant.image.includes('placeholder');
    return hasValidName && hasValidImage;
  });

  if (selectedRestaurant) {
    const selectedRestaurantData = validRestaurants.find(r => r.id === selectedRestaurant);
    if (!selectedRestaurantData) {
      setSelectedRestaurant(null);
      return null;
    }
    
    return (
      <RestaurantDetail 
        restaurant={selectedRestaurantData}
        onBack={() => setSelectedRestaurant(null)}
      />
    );
  }

  return (
    <div className="flex flex-col space-y-4 pb-20">
      {/* Candy Header with Fuzocube Logo */}
      <div className="candy-header sticky top-0 z-10 p-4">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/Fuzocube.png" 
            alt="Rubik's Chef Logo" 
            className="h-12 w-12 candy-bounce"
          />
        </div>
        
        {/* Hero Image */}
        <img
          src="/quick_search.png"
          alt="Quick Search Hero"
          className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-4 object-cover aspect-[16/7] candy-pulse"
          style={{ maxHeight: '180px' }}
        />
        
        {/* Banner */}
        <div className="w-full glass-candy text-center py-3 px-4 font-cta text-base my-3 rounded-2xl border-2 border-white/30">
          Instantly search for nearby restaurants and places! 🔍
        </div>
        <p className="text-sm text-white/90 text-center mt-1 font-body">
          {activeLocation ? `${restaurants.length} restaurants found${locationName ? ` in ${locationName}` : ' nearby'}` : 'Search for a location to discover restaurants'}
        </p>
        
        {/* Selected Location Display */}
        {selectedLocation && locationName && (
          <div className="mt-2 flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-2 glass-candy px-3 py-2 rounded-full border-2 border-white/30">
              <MapPin className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white font-cta">{locationName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelectedLocation}
                className="h-4 w-4 p-0 hover:bg-white/30 text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Location Detection Button */}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleDetectLocation}
            disabled={locationLoading}
            className="btn-candy flex items-center space-x-2 font-cta"
          >
            <Navigation className={`h-4 w-4 ${locationLoading ? 'animate-spin' : ''}`} />
            <span>
              {locationLoading ? 'Detecting Location...' : 'DETECT MY LOCATION'}
            </span>
          </Button>
        </div>
        
        {/* Search Section */}
        <div className="mt-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for a location (city, address, place)..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="pl-10 pr-10 input-candy font-body"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/30 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* Location Search Results */}
          {showSearchResults && (
            <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 border shadow-lg">
              <CardContent className="p-0">
                {searchLoading && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Searching locations...</span>
                    </div>
                  </div>
                )}
                {searchError && (
                  <div className="p-4 text-center text-sm text-red-500">
                    <p>Error: {searchError}</p>
                    <p className="text-xs mt-1">Check if Google Maps API is configured correctly</p>
                  </div>
                )}
                {!searchLoading && !searchError && results.length === 0 && searchQuery && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No locations found for "{searchQuery}"
                  </div>
                )}
                {results.map((location) => (
                  <div
                    key={location.place_id}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{location.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {location.formatted_address}
                        </p>
                        <div className="flex items-center space-x-1 mt-2">
                          {location.types.slice(0, 2).map((type: string) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        {/* Location Error */}
        {locationError && (
          <Alert className="mt-4">
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}
      </div>
      {/* Main Content */}
      <div className="px-4">
        {/* Loading State */}
        {restaurantsLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading restaurants...</span>
          </div>
        )}
        {/* Error State */}
        {restaurantsError && (
          <Alert>
            <AlertDescription>{restaurantsError}</AlertDescription>
          </Alert>
        )}
        {/* No Location Selected */}
        {!activeLocation && !locationLoading && (
          <div className="text-center py-8 space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Find Great Restaurants</h3>
              <p className="text-sm text-gray-600 mt-1">
                Search for a location or detect your current location to discover amazing restaurants nearby
              </p>
            </div>
          </div>
        )}
        {/* Restaurants Feed */}
        {activeLocation && validRestaurants.length > 0 && (
          <div className="space-y-6">
            {validRestaurants.map((restaurant, index) => {
              const post = createPostFromRestaurant(restaurant, index);
              const badgeColors = ['badge-strawberry', 'badge-orange', 'badge-lemon', 'badge-lime', 'badge-blueberry', 'badge-grape', 'badge-cherry'];
              const badgeColor = badgeColors[index % badgeColors.length];
              
              return (
                <Card key={restaurant.id} className="candy-card overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-4 pb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="avatar-candy h-8 w-8">
                          <AvatarImage src={post.avatar} alt={post.username} />
                          <AvatarFallback className="glass-candy text-white font-cta">
                            {post.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm text-white font-cta" style={{ fontSize: '1.25em' }}>{post.username}</span>
                            <span className="text-xs text-white/60">•</span>
                            <span className="text-xs text-white/60 font-body">{formatTimeAgo(post.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Image */}
                    <div 
                      className="relative aspect-square cursor-pointer px-4 pb-4"
                      onClick={() => handleRestaurantClick(restaurant)}
                    >
                      <picture>
                        <source srcSet={post.imageWebp} type="image/webp" />
                        <img
                          src={post.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover rounded-2xl"
                          srcSet={`${post.image} 1x, ${post.image.replace(/(\.[a-z]+)$/i, '@2x$1')} 2x`}
                          sizes="(max-width: 600px) 100vw, 400px"
                          loading="lazy"
                        />
                      </picture>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="space-y-2">
                          {/* Restaurant Name */}
                          <h3 className="text-white font-bold text-lg leading-tight font-headline">{restaurant.name}</h3>
                          
                          {/* Restaurant Address */}
                          <p className="text-white/90 text-sm font-body">{restaurant.address}</p>
                          
                          {/* Badges Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={`${badgeColor} text-xs font-cta`}>
                                {post.cuisine}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-white text-xs font-medium font-body">{post.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            
                            {/* Distance Badge */}
                            <Badge className="badge-lemon text-xs font-cta">
                              {post.distance.toFixed(1)} km away
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 pt-2">
                      <div className="flex items-center space-x-4 mb-3">
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 p-0 hover:text-white text-white/80 font-cta">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{Math.floor(Math.random() * 100) + 10}</span>
                        </Button>
                      </div>
                      <div className="text-sm leading-relaxed">
                        <span className="font-semibold text-white font-cta">{post.username}</span>
                        <span className="ml-2 break-words text-white/80 font-body">{post.caption}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {/* No Restaurants Found */}
        {activeLocation && validRestaurants.length === 0 && !restaurantsLoading && (
          <div className="text-center py-8 space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Utensils className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No Restaurants Found</h3>
              <p className="text-sm text-gray-600 mt-1">
                Try searching for a different location or expand your search area
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickSearch; 