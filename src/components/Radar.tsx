
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNearbyRestaurants } from '@/hooks/useGoogleMaps';
import { Restaurant } from '@/types';

const Radar: React.FC = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const { location, loading, error, getCurrentLocation } = useGeolocation();
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useNearbyRestaurants(location);

  useEffect(() => {
    if (!location && !loading) {
      getCurrentLocation();
    }
  }, [location, loading, getCurrentLocation]);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleBack = () => {
    setSelectedRestaurant(null);
  };

  if (selectedRestaurant) {
    return (
      <div className="flex flex-col h-full pb-20">
        <div className="sticky top-0 ios-header p-4 z-10">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-foreground">
              ← Back
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Restaurant Details</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="p-4">
          <Card className="ios-card">
            <CardHeader>
              <CardTitle className="text-foreground">{selectedRestaurant.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRestaurant.image && (
                <img
                  src={selectedRestaurant.image}
                  alt={selectedRestaurant.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedRestaurant.address}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{selectedRestaurant.cuisine}</Badge>
                  <Badge variant="outline">⭐ {selectedRestaurant.rating}</Badge>
                  {selectedRestaurant.distance && (
                    <Badge variant="outline">{selectedRestaurant.distance.toFixed(1)} km</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="sticky top-0 ios-header p-4 z-10">
        <h1 className="text-2xl font-bold text-center text-foreground">
          Radar
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Discover nearby restaurants
        </p>
      </div>

      <div className="p-4">
        {error && (
          <Alert className="mb-4 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-destructive">{error}</span>
              <Button onClick={getCurrentLocation} size="sm" variant="outline">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Getting your location...</span>
          </div>
        )}

        {location && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-foreground">
                Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {restaurantsLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Finding restaurants...</span>
          </div>
        )}

        {restaurantsError && (
          <Alert className="mb-4 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">{restaurantsError}</AlertDescription>
          </Alert>
        )}

        {restaurants.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Nearby Restaurants</h2>
            {restaurants.map((restaurant) => (
              <Card 
                key={restaurant.id} 
                className="ios-card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRestaurantClick(restaurant)}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {restaurant.image && (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{restaurant.cuisine}</Badge>
                        <Badge variant="outline">⭐ {restaurant.rating}</Badge>
                        {restaurant.distance && (
                          <Badge variant="outline">{restaurant.distance.toFixed(1)} km</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !restaurantsLoading && restaurants.length === 0 && location && (
          <div className="text-center py-8 space-y-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
              <Navigation className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No Restaurants Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No restaurants found in your area. Try expanding your search radius.
              </p>
            </div>
          </div>
        )}

        {!location && !loading && !error && (
          <div className="text-center py-8 space-y-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
              <MapPin className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Enable Location</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Allow location access to discover restaurants near you
              </p>
            </div>
            <Button onClick={getCurrentLocation} className="btn-ios">
              <MapPin className="h-4 w-4 mr-2" />
              Enable Location
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Radar;
