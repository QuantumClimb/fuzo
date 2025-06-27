import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { Heart, X, MapPin, Star, Clock, Phone, Globe, Navigation, RotateCcw, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import cardsData from '@/data/cards.json';

// Enhanced restaurant card for swiping
interface SwipeRestaurantCard {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  rating?: number;
  priceRange?: string;
  address?: string;
  description?: string;
  coordinates?: { lat: number; lng: number };
  phoneNumber?: string;
  website?: string;
  detailedPhotos?: string[];
  businessStatus?: string;
  openingHours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  isGoogleData?: boolean;
}

const SwipeFeed = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [likedRestaurants, setLikedRestaurants] = useState<SwipeRestaurantCard[]>([]);
  const [skippedRestaurants, setSkippedRestaurants] = useState<string[]>([]);
  const [swipeCards, setSwipeCards] = useState<SwipeRestaurantCard[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const { toast } = useToast();

  // Get location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Fallback to Delhi, India
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Google Places search for restaurant discovery
  const { 
    restaurants: nearbyRestaurants, 
    loading: placesLoading, 
    error: placesError,
    refetch: refetchPlaces
  } = useGooglePlaces({
    location: userLocation || { lat: 28.6139, lng: 77.2090 },
    radius: 3000,
    type: 'restaurant',
    keyword: selectedCuisine === 'all' ? '' : selectedCuisine,
    enabled: !!userLocation
  });

  // Create swipe cards from Google Places and mock data
  useEffect(() => {
    const mockCards = cardsData as any[];
    
    // Convert mock data to swipe cards
    const mockSwipeCards: SwipeRestaurantCard[] = mockCards.map(card => ({
      id: card.id,
      name: card.restaurant.name || card.name,
      cuisine: card.cuisine,
      image: card.image,
      description: card.description,
      isGoogleData: false
    }));

    // Convert Google Places data to swipe cards
    const googleSwipeCards: SwipeRestaurantCard[] = nearbyRestaurants.map(restaurant => ({
      id: `google_${restaurant.id}`,
      name: restaurant.name,
      cuisine: restaurant.cuisine || 'Restaurant',
      image: restaurant.image,
      rating: restaurant.rating,
      priceRange: restaurant.priceRange,
      address: restaurant.address,
      description: restaurant.description,
      coordinates: restaurant.coordinates,
      phoneNumber: restaurant.phoneNumber,
      website: restaurant.website,
      detailedPhotos: restaurant.detailedPhotos,
      businessStatus: restaurant.businessStatus,
      openingHours: restaurant.openingHours,
      isGoogleData: true
    }));

    // Shuffle and combine cards
    const allCards = [...googleSwipeCards, ...mockSwipeCards]
      .filter(card => !skippedRestaurants.includes(card.id))
      .sort(() => 0.5 - Math.random());

    setSwipeCards(allCards);
  }, [nearbyRestaurants, skippedRestaurants]);

  // Available cuisines for filtering
  const cuisineOptions = [
    'all', 'Italian', 'Japanese', 'Chinese', 'Mexican', 'Indian', 'Thai', 
    'French', 'American', 'Korean', 'Mediterranean', 'Vietnamese', 'Greek'
  ];

  const currentCard = swipeCards[currentCardIndex];
  const isOpenNow = currentCard?.openingHours?.open_now;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || !currentCard) return;

    setSwipeDirection(direction);
    setIsAnimating(true);

    // Process the swipe
    if (direction === 'right') {
      // Like the restaurant
      setLikedRestaurants(prev => [...prev, currentCard]);
      toast({
        title: "❤️ Liked!",
        description: `${currentCard.name} added to your likes`,
        className: "bg-green-600 border-green-500 text-white",
      });
    } else {
      // Skip the restaurant
      setSkippedRestaurants(prev => [...prev, currentCard.id]);
      toast({
        title: "⏭️ Skipped",
        description: "You won't see this again",
        className: "bg-gray-600 border-gray-500 text-white",
      });
    }

    // Move to next card after animation
    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleQuickAction = (action: string) => {
    if (!currentCard) return;

    switch (action) {
      case 'call':
        if (currentCard.phoneNumber) {
          window.open(`tel:${currentCard.phoneNumber}`);
        }
        break;
      case 'directions':
        if (currentCard.coordinates) {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentCard.coordinates.lat},${currentCard.coordinates.lng}`, '_blank');
        }
        break;
      case 'website':
        if (currentCard.website) {
          window.open(currentCard.website, '_blank');
        }
        break;
    }
  };

  const handleResetStack = () => {
    setCurrentCardIndex(0);
    setSkippedRestaurants([]);
    setSwipeDirection(null);
    setIsAnimating(false);
    refetchPlaces();
    toast({
      title: "🔄 Reset",
      description: "Fresh restaurants loaded!",
    });
  };

  const handleCuisineFilter = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    setCurrentCardIndex(0);
    refetchPlaces();
  };

  if (placesLoading && swipeCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuzo-coral via-fuzo-purple to-fuzo-yellow flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-fuzo-coral border-t-transparent rounded-full" />
            <p className="text-gray-600">Discovering amazing restaurants...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (currentCardIndex >= swipeCards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuzo-coral via-fuzo-purple to-fuzo-yellow flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
            <p className="text-gray-600 mb-4">
              You've seen all available restaurants. Check your likes or discover more!
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleResetStack}
              className="w-full bg-fuzo-coral hover:bg-fuzo-coral/90"
            >
              <RotateCcw size={16} className="mr-2" />
              Discover More
            </Button>
            
            {likedRestaurants.length > 0 && (
              <Button variant="outline" className="w-full">
                View {likedRestaurants.length} Liked Restaurant{likedRestaurants.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuzo-coral via-fuzo-purple to-fuzo-yellow p-4">
      {/* Header */}
      <div className="max-w-md mx-auto mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Discover</h1>
          <div className="flex items-center space-x-2">
            <select
              value={selectedCuisine}
              onChange={(e) => handleCuisineFilter(e.target.value)}
              className="px-3 py-1 rounded-full bg-white/20 text-white text-sm backdrop-blur-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {cuisineOptions.map(cuisine => (
                <option key={cuisine} value={cuisine} className="text-gray-900">
                  {cuisine === 'all' ? 'All' : cuisine}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetStack}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-white/80 text-sm mt-2">
          <span>{currentCardIndex + 1} / {swipeCards.length}</span>
          <span>{likedRestaurants.length} liked</span>
        </div>
      </div>

      {/* Swipe Card */}
      <div className="max-w-md mx-auto relative">
        <div className="relative h-[600px]">
          {/* Next card (background) */}
          {currentCardIndex + 1 < swipeCards.length && (
            <Card className="absolute inset-0 transform rotate-2 scale-95 opacity-50">
              <div className="h-full rounded-lg bg-gray-200" />
            </Card>
          )}

          {/* Current card */}
          {currentCard && (
            <Card 
              className={`absolute inset-0 overflow-hidden transition-all duration-300 ${
                swipeDirection === 'left' ? 'transform -translate-x-full -rotate-12 opacity-0' :
                swipeDirection === 'right' ? 'transform translate-x-full rotate-12 opacity-0' : ''
              }`}
            >
              {/* Restaurant Image */}
              <div className="relative h-2/3">
                <img
                  src={currentCard.image}
                  alt={currentCard.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Status badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {currentCard.isGoogleData && (
                    <Badge className="bg-green-500 text-white text-xs">
                      ✓ Live Data
                    </Badge>
                  )}
                  {isOpenNow !== undefined && (
                    <Badge className={`${isOpenNow ? 'bg-green-500' : 'bg-red-500'} text-white text-xs`}>
                      {isOpenNow ? 'Open Now' : 'Closed'}
                    </Badge>
                  )}
                </div>

                {/* Restaurant info overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl font-bold mb-2">{currentCard.name}</h2>
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {currentCard.cuisine}
                    </Badge>
                    {currentCard.rating && (
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="font-medium">{currentCard.rating}</span>
                      </div>
                    )}
                    {currentCard.priceRange && (
                      <span className="text-sm">{currentCard.priceRange}</span>
                    )}
                  </div>
                  {currentCard.address && (
                    <div className="flex items-center text-white/80 text-sm">
                      <MapPin size={14} className="mr-1" />
                      <span>{currentCard.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Restaurant Details */}
              <CardContent className="p-4 h-1/3 flex flex-col justify-between">
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    {currentCard.description || `Experience authentic ${currentCard.cuisine} cuisine at ${currentCard.name}.`}
                  </p>

                  {/* Quick Actions */}
                  <div className="flex justify-center space-x-3 mb-4">
                    {currentCard.phoneNumber && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('call')}
                        className="flex-1"
                      >
                        <Phone size={16} className="mr-1" />
                        Call
                      </Button>
                    )}
                    {currentCard.coordinates && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('directions')}
                        className="flex-1"
                      >
                        <Navigation size={16} className="mr-1" />
                        Directions
                      </Button>
                    )}
                    {currentCard.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('website')}
                        className="flex-1"
                      >
                        <Globe size={16} className="mr-1" />
                        Website
                      </Button>
                    )}
                  </div>
                </div>

                {/* Swipe Action Buttons */}
                <div className="flex justify-center space-x-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleSwipe('left')}
                    disabled={isAnimating}
                    className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 group"
                  >
                    <X size={24} className="text-gray-500 group-hover:text-red-500" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleSwipe('right')}
                    disabled={isAnimating}
                    className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 group"
                  >
                    <Heart size={24} className="text-gray-500 group-hover:text-green-500" />
                  </Button>
                </div>
              </CardContent>

              {/* Swipe hints */}
              {swipeDirection === 'left' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg transform -rotate-12">
                    SKIP
                  </div>
                </div>
              )}
              {swipeDirection === 'right' && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
                  <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg transform rotate-12">
                    LIKE
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Swipe instructions */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Swipe right to like • Swipe left to skip
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwipeFeed;
