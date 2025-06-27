import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation, RotateCcw, Star, Clock, Crosshair, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PersonalizationDashboard from '@/components/PersonalizationDashboard';
import MyRoutesDashboard from '@/components/MyRoutesDashboard';
import CardDetails from '@/components/CardDetails';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import LocationPermissionGuide from '@/components/LocationPermissionGuide';
import restaurantsData from '@/data/restaurants.json';
import routesData from '@/data/routes.json';
import { Restaurant } from '@/types';

const MapExplorer = () => {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'routes' | 'personalization'>('map');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [minRating, setMinRating] = useState<string>('all');
  const [mostReviewedToday, setMostReviewedToday] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi, India default
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeWaypoints, setRouteWaypoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [locationDetectionAttempted, setLocationDetectionAttempted] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  const routes = routesData;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Use Google Places API for real restaurant data
  const { 
    restaurants: googleRestaurants, 
    loading: placesLoading, 
    error: placesError,
    hasApiKey,
    refetch: refetchPlaces
  } = useGooglePlaces({
    location: mapCenter,
    radius: 5000,
    type: 'restaurant',
    enabled: !!apiKey && activeTab === 'map'
  });

  // Fallback to mock data if no API key or error
  const mockRestaurants = restaurantsData as Restaurant[];
  const restaurants = hasApiKey && !placesError ? googleRestaurants : mockRestaurants;

  // Get user's current location automatically on load
  useEffect(() => {
    const requestLocation = async () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        setLocationDetectionAttempted(true);
        return;
      }

      setLocationDetectionAttempted(true);

      try {
        // Request permission first
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'denied') {
          console.warn('Geolocation permission denied');
          setLocationPermissionDenied(true);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            setMapCenter(location);
            setLocationPermissionDenied(false);
            console.log('✅ Location detected:', location);
          },
          (error) => {
            console.warn('Geolocation error:', error);
            setLocationPermissionDenied(true);
            console.log('Using default location (Delhi). Please enable location access for automatic detection.');
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000 // 1 minute
          }
        );
      } catch (error) {
        console.warn('Error requesting geolocation permission:', error);
        setLocationPermissionDenied(true);
      }
    };

    requestLocation();
  }, []);

  // Randomly select 3 restaurants as "most reviewed today" on component mount
  useEffect(() => {
    const shuffled = [...restaurants].sort(() => 0.5 - Math.random());
    setMostReviewedToday(shuffled.slice(0, 3).map(r => r.id));
  }, []);

  // Filter restaurants based on selected criteria
  const filteredRestaurants = restaurants.filter(restaurant => {
    const cuisineMatch = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
    const ratingMatch = minRating === 'all' || restaurant.rating >= parseFloat(minRating);
    return cuisineMatch && ratingMatch;
  });

  // Get unique cuisines for filter dropdown
  const uniqueCuisines = [...new Set(restaurants.map(r => r.cuisine))];

  const handleShowRoute = () => {
    if (startPoint && endPoint) {
      setShowRoute(true);
      // In a real implementation, we would use Google Directions API
      // For now, we'll simulate route waypoints
      const mockWaypoints = [
        { lat: mapCenter.lat + 0.01, lng: mapCenter.lng + 0.01 },
        { lat: mapCenter.lat - 0.01, lng: mapCenter.lng - 0.01 }
      ];
      setRouteWaypoints(mockWaypoints);
    }
  };

  const handleReset = () => {
    setStartPoint('');
    setEndPoint('');
    setShowRoute(false);
    setSelectedRestaurant(null);
    setSelectedCuisine('all');
    setMinRating('all');
    setRouteWaypoints([]);
  };

  const handlePinClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      return;
    }

    // Reset permission states for retry
    setLocationPermissionDenied(false);
    setLocationDetectionAttempted(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setLocationPermissionDenied(false);
          console.log('✅ Location detected on retry:', location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermissionDenied(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000 // 1 minute for retry
        }
      );
    } else {
      setLocationPermissionDenied(true);
    }
  };

  const handleLocationPreset = (location: { lat: number; lng: number }, name: string) => {
    setMapCenter(location);
    setStartPoint(name);
  };

  const handlePlaceSelect = (place: any, isStartPoint: boolean) => {
    if (isStartPoint) {
      setStartPoint(place.formatted_address || place.name);
    } else {
      setEndPoint(place.formatted_address || place.name);
    }
    
    if (place.geometry?.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setMapCenter(location);
    }
  };

  const getCuisineIcon = (cuisine: string) => {
    const icons: { [key: string]: string } = {
      'Italian': '🍝',
      'Japanese': '🍣',
      'American': '🍔',
      'Thai': '🌶️',
      'Mexican': '🌮',
      'French': '🥐',
      'Indian': '🍛'
    };
    return icons[cuisine] || '🍽️';
  };

  const getPinColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-500 border-green-600';
    if (rating >= 3.5) return 'bg-yellow-500 border-yellow-600';
    return 'bg-red-500 border-red-600';
  };

  const getPriceColor = (priceRange: string) => {
    switch (priceRange) {
      case '$': return 'bg-blue-500 border-blue-600';
      case '$$': return 'bg-purple-500 border-purple-600';
      case '$$$': 
      case '$$$$': return 'bg-gray-800 border-gray-900';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div>
      <Header title="Explore" showSearchButton />
      
      <div className="fuzo-page">
        <div className="fuzo-container">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'map' 
                  ? 'bg-white text-fuzo-dark shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              Smart Map
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'routes' 
                  ? 'bg-white text-fuzo-dark shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              My Routes
            </button>
            <button
              onClick={() => setActiveTab('personalization')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'personalization' 
                  ? 'bg-white text-fuzo-dark shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              AI Profile
            </button>
          </div>

          {activeTab === 'map' && (
            <>
              {/* Location Detection Status */}
              {!userLocation && !locationDetectionAttempted && (
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <Crosshair className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <div className="flex items-center justify-between">
                      <span>🔍 Detecting your location to find nearby restaurants...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Location Permission Guide */}
              {!userLocation && locationDetectionAttempted && locationPermissionDenied && (
                <div className="mb-4">
                  <LocationPermissionGuide onRetryLocation={handleUseCurrentLocation} />
                </div>
              )}

              {userLocation && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <Crosshair className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    ✅ Location detected! Showing restaurants near you ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                  </AlertDescription>
                </Alert>
              )}

              {/* API Status Indicator */}
              {!hasApiKey && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Google Maps API key not configured. Using mock data. Please add VITE_GOOGLE_MAPS_API_KEY to your .env.local file.
                  </AlertDescription>
                </Alert>
              )}
              
              {placesError && (
                <Alert className="mb-4 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Google Places API error: {placesError}. Falling back to mock data.
                  </AlertDescription>
                </Alert>
              )}

              {placesLoading && (
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-700">
                    Loading restaurants from Google Places API...
                  </AlertDescription>
                </Alert>
              )}

              {hasApiKey && !placesError && !placesLoading && googleRestaurants.length > 0 && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    ✅ Using live Google Places API data - {googleRestaurants.length} restaurants found near your selected location
                  </AlertDescription>
                </Alert>
              )}

              {hasApiKey && !placesError && !placesLoading && googleRestaurants.length === 0 && (
                <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    No restaurants found in this area. Try selecting a different city or searching for a specific location.
                  </AlertDescription>
                </Alert>
              )}

              {/* Route Input Section */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Plan Your Food Journey</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUseCurrentLocation}
                      className="flex items-center space-x-1"
                    >
                      <Crosshair size={16} />
                      <span>Current Location</span>
                    </Button>
                  </div>
                </div>
                
                {/* Fallback Manual Location Selection (only if location permission denied) */}
                {!userLocation && locationPermissionDenied && (
                  <details className="mb-3" open>
                    <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                      📍 Or select your city manually
                    </summary>
                    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-gray-50 rounded">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationPreset({ lat: 28.6139, lng: 77.2090 }, 'Delhi')}
                        className="text-xs"
                      >
                        Delhi
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationPreset({ lat: 19.0760, lng: 72.8777 }, 'Mumbai')}
                        className="text-xs"
                      >
                        Mumbai
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationPreset({ lat: 12.9716, lng: 77.5946 }, 'Bangalore')}
                        className="text-xs"
                      >
                        Bangalore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationPreset({ lat: 13.0827, lng: 80.2707 }, 'Chennai')}
                        className="text-xs"
                      >
                        Chennai
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationPreset({ lat: 22.5726, lng: 88.3639 }, 'Kolkata')}
                        className="text-xs"
                      >
                        Kolkata
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationPreset({ lat: 17.3850, lng: 78.4867 }, 'Hyderabad')}
                        className="text-xs"
                      >
                        Hyderabad
                      </Button>
                    </div>
                  </details>
                )}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin size={20} className="text-fuzo-coral" />
                    {apiKey ? (
                      <PlacesAutocomplete
                        placeholder="Starting point..."
                        onPlaceSelect={(place) => handlePlaceSelect(place, true)}
                        value={startPoint}
                        onChange={setStartPoint}
                      />
                    ) : (
                      <Input
                        placeholder="Starting point..."
                        value={startPoint}
                        onChange={(e) => setStartPoint(e.target.value)}
                        className="flex-1"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Navigation size={20} className="text-fuzo-purple" />
                    {apiKey ? (
                      <PlacesAutocomplete
                        placeholder="Destination..."
                        onPlaceSelect={(place) => handlePlaceSelect(place, false)}
                        value={endPoint}
                        onChange={setEndPoint}
                      />
                    ) : (
                      <Input
                        placeholder="Destination..."
                        value={endPoint}
                        onChange={(e) => setEndPoint(e.target.value)}
                        className="flex-1"
                      />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleShowRoute} className="flex-1 bg-fuzo-coral hover:bg-fuzo-coral/90">
                      Find Smart Route
                    </Button>
                    <Button variant="outline" onClick={handleReset} size="icon">
                      <RotateCcw size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="font-semibold mb-3">Filter Restaurants</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                    <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Cuisines" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cuisines</SelectItem>
                        {uniqueCuisines.map(cuisine => (
                          <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                    <Select value={minRating} onValueChange={setMinRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="4.0">4.0+ Stars</SelectItem>
                        <SelectItem value="3.5">3.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="fuzo-card h-96 relative overflow-hidden">
                {apiKey ? (
                  <GoogleMapComponent
                    apiKey={apiKey}
                    center={mapCenter}
                    zoom={13}
                    restaurants={filteredRestaurants}
                    onRestaurantClick={handlePinClick}
                    showRoute={showRoute}
                    routeWaypoints={routeWaypoints}
                    userLocation={userLocation}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium">Google Maps API key required</p>
                      <p className="text-gray-500 text-sm">Add your API key to .env.local to enable maps</p>
                    </div>
                  </div>
                )}

                {!showRoute && filteredRestaurants.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 text-center">
                        Enter start and end points to discover food along your route
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Restaurant List */}
              <div className="mt-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  {showRoute ? 'Restaurants Along Your Route' : 'Nearby Restaurants'}
                  <Badge variant="secondary" className="ml-2 bg-fuzo-purple/20 text-fuzo-purple">
                    {filteredRestaurants.length} Found
                  </Badge>
                </h3>
                <div className="space-y-3">
                  {filteredRestaurants.slice(0, showRoute ? 5 : 3).map((restaurant) => {
                    const isMostReviewed = mostReviewedToday.includes(restaurant.id);
                    return (
                      <div key={restaurant.id} className="fuzo-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => handlePinClick(restaurant)}>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={restaurant.image} 
                            alt={restaurant.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{restaurant.name}</h4>
                              {isMostReviewed && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  🔥 Hot
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="bg-fuzo-yellow/20 text-fuzo-dark">
                                {restaurant.cuisine}
                              </Badge>
                              <span className="text-sm text-gray-500">{restaurant.priceRange}</span>
                              {restaurant.travelTimeMin && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock size={12} className="mr-1" />
                                  {restaurant.travelTimeMin} mins
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <Star size={14} className="text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{restaurant.rating}</span>
                              <span className="text-xs text-gray-500 ml-2">({restaurant.reviewCount} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'routes' && <MyRoutesDashboard />}
          {activeTab === 'personalization' && <PersonalizationDashboard />}
        </div>
      </div>

      {/* Restaurant Detail Dialog */}
      {selectedRestaurant && (
        <CardDetails 
          restaurant={selectedRestaurant}
          isOpen={!!selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}
    </div>
  );
};

export default MapExplorer;
