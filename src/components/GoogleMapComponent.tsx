import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  restaurants?: Array<{
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    coordinates: { lat: number; lng: number };
  }>;
  onRestaurantClick?: (restaurant: any) => void;
  showRoute?: boolean;
  routeWaypoints?: Array<{ lat: number; lng: number }>;
  userLocation?: { lat: number; lng: number } | null;
}

const MapComponent: React.FC<MapProps> = ({ 
  center, 
  zoom, 
  restaurants, 
  onRestaurantClick, 
  showRoute = false,
  routeWaypoints = [],
  userLocation 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapId: 'FUZO_MAP'
      });
      setMap(newMap);

      // Initialize directions renderer
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll use custom markers
        polylineOptions: {
          strokeColor: '#FF6B6B',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      renderer.setMap(newMap);
      setDirectionsRenderer(renderer);
    }
  }, [mapRef, map, center, zoom]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [map, center]);

  // Handle user location marker
  useEffect(() => {
    if (map && userLocation) {
      // Clear existing user marker
      if (userMarker) {
        userMarker.map = null;
      }

      // Create user location marker
      const userMarkerElement = document.createElement('div');
      userMarkerElement.innerHTML = `
        <div style="
          width: 20px; 
          height: 20px; 
          background-color: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -8px;
            left: -8px;
            width: 36px;
            height: 36px;
            background-color: rgba(66, 133, 244, 0.2);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
      `;

      const newUserMarker = new google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map: map,
        title: 'Your Location',
        content: userMarkerElement
      });

      setUserMarker(newUserMarker);
    }
  }, [map, userLocation]);

  // Handle restaurant markers
  useEffect(() => {
    if (map && restaurants && google.maps.marker) {
      // Clear existing markers
      markers.forEach(marker => marker.map = null);
      
      // Create new markers using AdvancedMarkerElement
      const newMarkers = restaurants.map(restaurant => {
        // Get cuisine icon
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

        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.innerHTML = `
          <div style="
            width: 36px; 
            height: 36px; 
            background-color: ${restaurant.rating >= 4.5 ? '#10B981' : restaurant.rating >= 3.5 ? '#F59E0B' : '#EF4444'};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${getCuisineIcon(restaurant.cuisine)}
          </div>
        `;

        // Add hover effects
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.1)';
        });
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
        });

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: restaurant.coordinates,
          map: map,
          title: restaurant.name,
          content: markerElement
        });

        // Add click listener
        markerElement.addEventListener('click', () => {
          if (onRestaurantClick) {
            onRestaurantClick(restaurant);
          }
        });

        return marker;
      });
      
      setMarkers(newMarkers);
    }
  }, [map, restaurants, onRestaurantClick]);

  // Handle route display
  useEffect(() => {
    if (map && directionsRenderer && showRoute && routeWaypoints.length >= 2) {
      const directionsService = new google.maps.DirectionsService();
      
      const waypoints = routeWaypoints.slice(1, -1).map(point => ({
        location: point,
        stopover: true
      }));

      directionsService.route(
        {
          origin: routeWaypoints[0],
          destination: routeWaypoints[routeWaypoints.length - 1],
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
          } else {
            console.warn('Directions request failed:', status);
            // Fallback: just show a simple polyline
            const routePath = new google.maps.Polyline({
              path: routeWaypoints,
              geodesic: true,
              strokeColor: '#FF6B6B',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            });
            routePath.setMap(map);
          }
        }
      );
    } else if (directionsRenderer && !showRoute) {
      directionsRenderer.setDirections({ routes: [] } as any);
    }
  }, [map, directionsRenderer, showRoute, routeWaypoints]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

interface GoogleMapComponentProps extends MapProps {
  apiKey: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ apiKey, ...mapProps }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const render = (status: any) => {
    if (status === 'LOADING') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuzo-coral mx-auto mb-2"></div>
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      );
    }

    if (status === 'FAILURE') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50">
          <div className="text-center p-4">
            <p className="text-red-600 font-semibold">Failed to load Google Maps</p>
            <p className="text-red-500 text-sm">Please check your API key configuration</p>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        </div>
      );
    }

    return <MapComponent {...mapProps} />;
  };

  return (
    <Wrapper
      apiKey={apiKey}
      render={render}
      libraries={['places', 'geometry', 'marker']}
    />
  );
};

export default GoogleMapComponent; 