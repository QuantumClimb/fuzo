import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FoodCard from '@/components/FoodCard';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { Search, MapPin, Filter, Loader2, RefreshCw } from 'lucide-react';
import cardsData from '@/data/cards.json';

// Enhanced interface for food cards with real restaurant data
interface EnhancedFoodCard {
  id: string;
  name: string;
  type: string;
  cuisine: string;
  image: string;
  tags: string[];
  user: {
    id: string;
    name: string;
    avatar: string;
    location: string;
  };
  restaurant: {
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
      weekday_text?: string[];
    };
  };
  ingredients?: string[];
  description: string;
}

const FoodFeed = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('discover');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());
  const [enhancedCards, setEnhancedCards] = useState<EnhancedFoodCard[]>([]);

  // Get location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Unable to get your location');
          // Fallback to Delhi, India
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setLocationError('Geolocation not supported');
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Google Places search based on location and filters
  const { 
    restaurants: nearbyRestaurants, 
    loading: placesLoading, 
    error: placesError,
    refetch: refetchPlaces
  } = useGooglePlaces({
    location: userLocation || { lat: 28.6139, lng: 77.2090 },
    radius: 5000,
    type: 'restaurant',
    keyword: selectedCuisine === 'all' ? searchQuery : `${selectedCuisine} ${searchQuery}`,
    enabled: !!userLocation
  });

  // Available cuisines for filtering
  const cuisineOptions = [
    'all', 'Italian', 'Japanese', 'Chinese', 'Mexican', 'Indian', 'Thai', 
    'French', 'American', 'Korean', 'Mediterranean', 'Vietnamese', 'Greek'
  ];

  // Convert mock cards to enhanced format and merge with real restaurant data
  useEffect(() => {
    const mockCards = cardsData as any[];
    const enhanced: EnhancedFoodCard[] = mockCards.map((card, index) => {
      // Try to match with real restaurant data
      const matchingRestaurant = nearbyRestaurants[index % nearbyRestaurants.length];
      
      return {
        ...card,
        restaurant: {
          ...card.restaurant,
          ...(matchingRestaurant && {
            rating: matchingRestaurant.rating,
            priceRange: matchingRestaurant.priceRange,
            coordinates: matchingRestaurant.coordinates,
            address: matchingRestaurant.address,
            hours: matchingRestaurant.hours,
            phoneNumber: matchingRestaurant.phoneNumber,
            website: matchingRestaurant.website,
            detailedPhotos: matchingRestaurant.detailedPhotos,
            businessStatus: matchingRestaurant.businessStatus,
            openingHours: matchingRestaurant.openingHours,
            image: matchingRestaurant.image
          })
        }
      };
    });

    // Add real restaurants as new cards
    const realRestaurantCards: EnhancedFoodCard[] = nearbyRestaurants.map((restaurant, index) => ({
      id: `real_${restaurant.id}`,
      name: `Fresh ${restaurant.cuisine || 'Cuisine'} Discovery`,
      type: 'discovery',
      cuisine: restaurant.cuisine || 'Restaurant',
      image: restaurant.image,
      tags: ['fresh', 'local', 'verified'],
      user: {
        id: 'fuzo_ai',
        name: 'FUZO AI',
        avatar: 'https://ui-avatars.com/api/?name=FUZO+AI&background=4F46E5&color=white',
        location: 'AI Discovery'
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        priceRange: restaurant.priceRange,
        coordinates: restaurant.coordinates,
        address: restaurant.address,
        hours: restaurant.hours,
        image: restaurant.image,
        phoneNumber: restaurant.phoneNumber,
        website: restaurant.website,
        detailedPhotos: restaurant.detailedPhotos,
        businessStatus: restaurant.businessStatus,
        openingHours: restaurant.openingHours
      },
      description: restaurant.description || `Discover authentic ${restaurant.cuisine} cuisine at ${restaurant.name}. ${restaurant.rating ? `Rated ${restaurant.rating} stars` : ''} with ${restaurant.reviewCount || 'many'} reviews.`,
      ingredients: ['fresh ingredients', 'local sourcing', 'authentic preparation']
    }));

    setEnhancedCards([...enhanced, ...realRestaurantCards]);
  }, [nearbyRestaurants]);

  // Filter cards based on search and cuisine selection
  const filteredCards = enhancedCards.filter(card => {
    const matchesSearch = searchQuery === '' || 
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCuisine = selectedCuisine === 'all' || 
      card.cuisine.toLowerCase() === selectedCuisine.toLowerCase();
    
    return matchesSearch && matchesCuisine;
  });

  const handleLike = (cardId: string) => {
    setLikedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleSave = (cardId: string) => {
    setSavedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleRefresh = () => {
    refetchPlaces();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Food Discovery</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={placesLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw size={16} className={placesLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Location Status */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin size={16} />
              {locationError ? (
                <span className="text-amber-600">Using default location (Delhi) - {locationError}</span>
              ) : userLocation ? (
                <span className="text-green-600">✓ Using your location for discovery</span>
              ) : (
                <span className="text-gray-500">Getting your location...</span>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search restaurants, dishes, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-fuzo-coral"
                >
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine === 'all' ? 'All Cuisines' : cuisine}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover">
              Discover ({filteredCards.length})
            </TabsTrigger>
            <TabsTrigger value="liked">
              Liked ({likedCards.size})
            </TabsTrigger>
            <TabsTrigger value="saved">
              Saved ({savedCards.size})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            {/* Loading State */}
            {placesLoading && (
              <Card className="p-8">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 size={32} className="animate-spin text-fuzo-coral" />
                  <p className="text-gray-600">Discovering amazing restaurants near you...</p>
                </div>
              </Card>
            )}

            {/* Error State */}
            {placesError && (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Error loading restaurants: {placesError}</p>
                  <Button onClick={handleRefresh} variant="outline">
                    Try Again
                  </Button>
                </div>
              </Card>
            )}

            {/* Enhanced Food Cards Grid */}
            {!placesLoading && filteredCards.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCards.map((card) => (
                  <FoodCard
                    key={card.id}
                    card={card}
                    onLike={handleLike}
                    onSave={handleSave}
                    isLiked={likedCards.has(card.id)}
                    isSaved={savedCards.has(card.id)}
                    userLocation={userLocation}
                    enhanceWithGoogleData={true}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!placesLoading && filteredCards.length === 0 && (
              <Card className="p-8">
                <div className="text-center">
                  <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or selecting a different cuisine.
                  </p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSelectedCuisine('all');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enhancedCards
                .filter(card => likedCards.has(card.id))
                .map((card) => (
                  <FoodCard
                    key={card.id}
                    card={card}
                    onLike={handleLike}
                    onSave={handleSave}
                    isLiked={true}
                    isSaved={savedCards.has(card.id)}
                    userLocation={userLocation}
                  />
                ))}
            </div>
            {likedCards.size === 0 && (
              <Card className="p-8">
                <div className="text-center">
                  <p className="text-gray-600">No liked items yet. Start exploring!</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enhancedCards
                .filter(card => savedCards.has(card.id))
                .map((card) => (
                  <FoodCard
                    key={card.id}
                    card={card}
                    onLike={handleLike}
                    onSave={handleSave}
                    isLiked={likedCards.has(card.id)}
                    isSaved={true}
                    userLocation={userLocation}
                  />
                ))}
            </div>
            {savedCards.size === 0 && (
              <Card className="p-8">
                <div className="text-center">
                  <p className="text-gray-600">No saved items yet. Save your favorites!</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FoodFeed;
