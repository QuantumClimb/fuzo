
import React, { useState, useEffect } from 'react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share, MapPin, Clock, Utensils, Search, X, Star, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
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
import { LocationSearchResult, calculateDistance } from '@/lib/googleMaps';
import { Switch } from '@/components/ui/switch';
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

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [showImageFeed, setShowImageFeed] = useState(false);
  const [imageFeed, setImageFeed] = useState<Array<{ id: string; user_email: string | null; image_url: string; timestamp: string; location: string | null; user_avatar?: string | null; }>>([]);
  const [imageFeedLoading, setImageFeedLoading] = useState(false);
  const [imageFeedError, setImageFeedError] = useState<string | null>(null);
  const [isLocationAccordionOpen, setIsLocationAccordionOpen] = useState(false);

  // Location detection
  const { location: currentLocation, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  
  // Use current location or selected location for restaurants
  const activeLocation = selectedLocation || currentLocation;
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useNearbyRestaurants(activeLocation);
  
  // Location search functionality
  const { results, loading: searchLoading, error: searchError, searchLocations, clearResults } = useLocationSearch();

  useEffect(() => {
    toast("Welcome back, explorer. Your next food find awaits.");
  }, []);

  useEffect(() => {
    if (activeLocation && !locationLoading && !locationError) {
      toast.success("Location locked. Scanning for deliciousness...");
    }
  }, [activeLocation, locationLoading, locationError]);

  React.useEffect(() => {
    if (showImageFeed) {
      setImageFeedLoading(true);
      setImageFeedError(null);
      supabase
        .from('feed')
        .select('*')
        .order('timestamp', { ascending: false })
        .then(({ data, error }) => {
          if (error) setImageFeedError(error.message);
          else setImageFeed(data || []);
          setImageFeedLoading(false);
        });
    }
  }, [showImageFeed]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setShowSearchResults(true);
      // Search for locations instead of restaurants
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
    // Calculate distance from user's current location to restaurant
    let distanceFromUser = restaurant.distance;
    
    // If user has a current location and we're showing restaurants from a searched location,
    // calculate the actual distance from user's current location to the restaurant
    if (currentLocation && selectedLocation && currentLocation !== selectedLocation) {
      distanceFromUser = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        restaurant.coordinates.lat,
        restaurant.coordinates.lng
      );
    }
    
    return {
      id: restaurant.id,
      image: restaurant.image,
      caption: `Great ${restaurant.cuisine} spot with ${restaurant.rating} stars! Perfect for a delicious meal.`,
      location: restaurant.address,
      coordinates: restaurant.coordinates,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Random time within last 24h
      username: 'TakosPicks',
      avatar: '/placeholder.svg',
      type: 'restaurant' as const,
      place_id: restaurant.id,
      rating: restaurant.rating,
      cuisine: restaurant.cuisine,
      distance: distanceFromUser,
      // Responsive image sources
      imageWebp: restaurant.image.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
    };
  };

  // Filter restaurants to only those with a valid name and image
  const validRestaurants = restaurants.filter((restaurant) => {
    const hasValidName = typeof restaurant.name === 'string' && restaurant.name.trim().length > 0;
    const hasValidImage = typeof restaurant.image === 'string' && restaurant.image.trim().length > 0 && !restaurant.image.includes('placeholder');
    if (!hasValidName || !hasValidImage) {
      // Optional: log skipped restaurants for debugging
      // console.warn('Skipping invalid restaurant:', restaurant);
    }
    return hasValidName && hasValidImage;
  });

  if (selectedRestaurant) {
    return (
      <RestaurantDetail 
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
      />
    );
  }

  // Show skeleton loader while loading
  if (restaurantsLoading) {
    return <FeedSkeleton />;
  }

  return (
    <div className="flex flex-col space-y-4 lg:pb-0 pb-20">
      {/* iOS Header */}
      <div className="ios-header sticky top-0 z-10 p-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        <div className="flex items-center justify-center mb-4 lg:hidden">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
            className="h-12 w-36"
          />
        </div>
        
        {/* Feed Toggle */}
        <div className="flex items-center justify-center mb-4">
          <span className="mr-2 text-sm font-medium text-foreground">Google Maps Feed</span>
          <Switch checked={showImageFeed} onCheckedChange={setShowImageFeed} />
          <span className="ml-2 text-sm font-medium text-foreground">Image Feed</span>
        </div>

        {/* Enhanced Info Banner */}
        <div className="glass-candy text-center py-4 px-6 text-sm mb-4 rounded-2xl shadow-md border border-white/30">
          <div className="flex items-center justify-center gap-2 mb-1">
            {showImageFeed ? (
              <>
                <span className="text-2xl">🍰</span>
                <span className="font-cta text-base font-semibold text-gradient">Community Snaps</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🍕</span>
                <span className="font-cta text-base font-semibold text-gradient">Local Restaurants</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {showImageFeed 
              ? "You're viewing snaps from the community. Add your own from the Camera tab!" 
              : "These restaurants are recommended based on your location. Tap a photo for more details."}
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-1">
          {activeLocation ? `${restaurants.length} restaurants found${locationName ? ` in ${locationName}` : ' nearby'}` : 'Search for a location to discover restaurants'}
        </p>
        
        {/* Location Accordion */}
        <div className="mt-4">
          <button
            onClick={() => setIsLocationAccordionOpen(!isLocationAccordionOpen)}
            className="w-full flex items-center justify-between p-4 glass-effect rounded-xl hover:shadow-glow transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-foreground" />
              <span className="font-medium text-foreground">Location & Search</span>
            </div>
            {isLocationAccordionOpen ? (
              <ChevronUp className="h-5 w-5 text-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-foreground" />
            )}
          </button>
          
          {/* Accordion Content */}
          {isLocationAccordionOpen && (
            <div className="mt-3 space-y-3">
              {/* Selected Location Display */}
              {selectedLocation && locationName && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex items-center space-x-2 bg-primary/10 px-3 py-2 rounded-full border border-primary/20">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{locationName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelectedLocation}
                      className="h-4 w-4 p-0 hover:bg-primary/20 text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Location Detection Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleDetectLocation}
                  disabled={locationLoading}
                  className="btn-ios flex items-center space-x-2"
                >
                  <Navigation className={`h-4 w-4 ${locationLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {locationLoading ? 'Detecting Location...' : 'DETECT MY LOCATION'}
                  </span>
                </Button>
              </div>
              
              {/* Search Section */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search for a location (city, address, place)..."
                    value={searchQuery}
                    onChange={handleSearchInput}
                    className="pl-10 pr-10 input-ios"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Location Search Results */}
                {showSearchResults && (
                  <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 border shadow-lg ios-card">
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
                        <div className="p-4 text-center text-sm text-destructive">
                          <p>Error: {searchError}</p>
                          <p className="text-xs mt-1">Check if Google Maps API is configured correctly</p>
                        </div>
                      )}
                      
                      {!searchLoading && !searchError && results.length === 0 && searchQuery && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No locations found for "{searchQuery}"
                        </div>
                      )}
                      
                      {results.map((location, index) => (
                        <div
                          key={location.place_id}
                          className="p-4 border-b last:border-b-0 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate text-foreground">{location.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {location.formatted_address}
                              </p>
                              <div className="flex items-center space-x-1 mt-2">
                                {location.types.slice(0, 2).map((type, idx) => (
                                  <Badge 
                                    key={type} 
                                    className={`text-xs ${
                                      idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                                    }`}
                                  >
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
                <Alert className="mt-4 border-destructive/50 bg-destructive/10">
                  <AlertDescription className="text-destructive">{locationError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        {showImageFeed ? (
          imageFeedLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading images...</span>
            </div>
          ) : imageFeedError ? (
            <Alert className="border-destructive/50 bg-destructive/10"><AlertDescription className="text-destructive">{imageFeedError}</AlertDescription></Alert>
          ) : imageFeed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No images found in feed.</div>
          ) : (
            <div className="space-y-6">
              {imageFeed.map((item, index) => (
                <div key={item.id} className="ios-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 pb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="avatar-ios h-8 w-8">
                          <AvatarImage src={item.user_avatar || '/placeholder.svg'} alt={item.user_email || 'Guest'} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {item.user_email ? item.user_email[0] : 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm text-foreground">{item.user_email || 'Guest'}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(item.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">{item.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="relative aspect-square">
                      <img
                        src={item.image_url}
                        alt="Feed upload"
                        className="w-full h-full object-cover rounded-t-lg"
                        loading="lazy"
                      />
                    </div>
                  </CardContent>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            {/* Loading State */}
            {restaurantsLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading restaurants...</span>
              </div>
            )}

            {/* Error State */}
            {restaurantsError && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertDescription className="text-destructive">{restaurantsError}</AlertDescription>
              </Alert>
            )}

            {/* No Location Selected */}
            {!activeLocation && !locationLoading && (
              <div className="text-center py-8 space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                  <MapPin className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Find Great Restaurants</h3>
                  <p className="text-sm text-muted-foreground mt-1">
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
                  const badgeColors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-muted', 'bg-destructive'];
                  const badgeColor = badgeColors[index % badgeColors.length];
                  
                  return (
                    <div key={restaurant.id} className="ios-card overflow-hidden floating transform-gpu">
                      <CardContent className="p-0">
                        {/* Header */}
                        <div className="p-4 pb-2">
                          <div className="flex items-center space-x-3">
                            <Avatar className="avatar-ios h-8 w-8">
                              <AvatarImage src={post.username === 'TakosPicks' ? '/tako_pic.png' : post.avatar} alt={post.username} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {post.username === 'TakosPicks' ? (
                                  <img src="/tako_pic.png" alt="TakosPicks" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  post.username[0]
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm text-foreground" style={{ fontSize: '1.25em' }}>{post.username}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{formatTimeAgo(post.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Image */}
                        <div 
                          className="relative aspect-square cursor-pointer"
                          onClick={() => handleRestaurantClick(restaurant)}
                        >
                          <picture>
                            <source srcSet={post.imageWebp} type="image/webp" />
                            <img
                              src={post.image}
                              alt={restaurant.name}
                              className="w-full h-full object-cover rounded-lg"
                              srcSet={`${post.image} 1x, ${post.image.replace(/(\.[a-z]+)$/i, '@2x$1')} 2x`}
                              sizes="(max-width: 600px) 100vw, 400px"
                              loading="lazy"
                            />
                          </picture>
                          {/* Restaurant Info Overlay */}
                          <div className="absolute top-0 left-0 right-0 p-4">
                            <div className="flex items-start justify-between">
                              {/* Left side - Food type and rating */}
                              <div className="space-y-2">
                                <Badge className={`${badgeColor} text-primary-foreground text-xs`}>
                                  {post.cuisine}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-white text-xs font-medium">{post.rating.toFixed(1)}</span>
                                </div>
                              </div>
                              {/* Right side - Distance */}
                              <Badge className="bg-accent text-accent-foreground text-xs">
                                {post.distance.toFixed(1)} km
                              </Badge>
                            </div>
                          </div>
                          {/* Restaurant name and address at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg leading-tight mb-1">{restaurant.name}</h3>
                            <p className="text-white/90 text-sm">{restaurant.address}</p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 pt-2">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 p-0 hover:text-primary text-muted-foreground">
                              <Heart className="h-4 w-4" />
                              <span className="text-sm">{Math.floor(Math.random() * 100) + 10}</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No Restaurants Found */}
            {activeLocation && validRestaurants.length === 0 && !restaurantsLoading && (
              <div className="text-center py-8 space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                  <Utensils className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No Restaurants Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try searching for a different location or expand your search area
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default memo(Feed);
