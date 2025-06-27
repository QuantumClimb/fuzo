import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Restaurant } from '@/types';
import { useGoogleDirections } from '@/hooks/useGooglePlaces';

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
  selectedRestaurant?: Restaurant | null;
  showDirections?: boolean;
}

const MapComponent: React.FC<MapProps> = ({ 
  center, 
  zoom, 
  restaurants, 
  onRestaurantClick, 
  showRoute = false,
  routeWaypoints = [],
  userLocation,
  selectedRestaurant,
  showDirections = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { getDirections, directions } = useGoogleDirections();

  // Initialize map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: false,
        fullscreenControl: true
      });

      mapInstanceRef.current = map;
      
      // Initialize info window
      infoWindowRef.current = new google.maps.InfoWindow();
      
      // Initialize directions renderer
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4F46E5',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      directionsRendererRef.current.setMap(map);

      setIsMapLoaded(true);
    };

    if (window.google) {
      initMap();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initMap();
        }
      }, 100);
    }
  }, [center]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [mapInstanceRef, center]);

  // Handle user location marker
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // Create user location marker
    userMarkerRef.current = new google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" fill="#4285f4"/>
            <circle cx="10" cy="10" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(20, 20),
        anchor: new google.maps.Point(10, 10)
      }
    });
  }, [isMapLoaded, userLocation]);

  // Handle restaurant markers
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers with enhanced info windows
    restaurants?.forEach((restaurant) => {
      const marker = new google.maps.Marker({
        position: restaurant.coordinates,
        map: mapInstanceRef.current!,
        title: restaurant.name,
        icon: {
          url: createRestaurantMarkerIcon(restaurant),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 40)
        }
      });

      // Enhanced info window with photos and actions
      const infoContent = createEnhancedInfoWindow(restaurant);
      
      marker.addListener('click', () => {
        // Close any open info window
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        
        // Set content and open
        infoWindowRef.current!.setContent(infoContent);
        infoWindowRef.current!.open(mapInstanceRef.current!, marker);
        
        // Call parent click handler
        if (onRestaurantClick) {
          onRestaurantClick(restaurant);
        }
      });

      markersRef.current.push(marker);
    });
  }, [isMapLoaded, restaurants, onRestaurantClick]);

  // Handle route display
  useEffect(() => {
    if (!showDirections || !userLocation || routeWaypoints.length === 0) return;
    
    const waypoints = routeWaypoints.map(point => ({ lat: point.lat, lng: point.lng }));
    const destination = waypoints[waypoints.length - 1];
    const intermediateWaypoints = waypoints.slice(0, -1);
    
    getDirections(userLocation, destination, intermediateWaypoints);
  }, [showDirections, userLocation, routeWaypoints, getDirections]);

  // Handle directions
  useEffect(() => {
    if (!directions || !directionsRendererRef.current) return;
    
    directionsRendererRef.current.setDirections(directions);
  }, [directions]);

  // Create restaurant marker icon based on cuisine and rating
  const createRestaurantMarkerIcon = (restaurant: any): string => {
    const rating = restaurant.rating;
    const color = rating >= 4.5 ? '#10B981' : rating >= 4.0 ? '#F59E0B' : '#EF4444';
    const isSelected = selectedRestaurant?.id === restaurant.id;
    const scale = isSelected ? 1.2 : 1;
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${40 * scale}" height="${40 * scale}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="20" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
              text-anchor="middle" fill="white">${rating}</text>
        <path d="M20 35 L15 30 L25 30 Z" fill="${color}"/>
      </svg>
    `)}`;
  };

  // Create enhanced info window content
  const createEnhancedInfoWindow = (restaurant: any): string => {
    const primaryPhoto = restaurant.image;
    const additionalPhotos = restaurant.detailedPhotos?.slice(0, 2) || [];
    const reviews = restaurant.reviews?.slice(0, 2) || [];
    const isOpenNow = restaurant.openingHours?.open_now;
    
    return `
      <div style="max-width: 320px; font-family: Arial, sans-serif;">
        <!-- Header Image -->
        <div style="position: relative; margin: -10px -10px 12px -10px;">
          <img src="${primaryPhoto}" alt="${restaurant.name}" 
               style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px 8px 0 0;">
          ${isOpenNow !== undefined ? `
            <div style="position: absolute; top: 8px; left: 8px; background: ${isOpenNow ? '#10B981' : '#EF4444'}; 
                        color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
              ${isOpenNow ? 'Open Now' : 'Closed'}
            </div>
          ` : ''}
          ${additionalPhotos.length > 0 ? `
            <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); 
                        color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
              +${additionalPhotos.length + 1} photos
            </div>
          ` : ''}
        </div>

        <!-- Restaurant Info -->
        <div style="padding: 0 4px;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #1F2937;">
            ${restaurant.name}
          </h3>
          
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 2px;">
              ${'★'.repeat(Math.floor(restaurant.rating))}${'☆'.repeat(5 - Math.floor(restaurant.rating))}
              <span style="font-weight: bold; margin-left: 4px;">${restaurant.rating}</span>
              <span style="color: #6B7280; font-size: 14px;">(${restaurant.reviewCount || 0})</span>
            </div>
            <span style="background: #F3F4F6; padding: 2px 6px; border-radius: 8px; font-size: 12px; color: #374151;">
              ${restaurant.cuisine}
            </span>
            <span style="color: #6B7280; font-size: 14px;">${restaurant.priceRange}</span>
          </div>

          <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px; line-height: 1.4;">
            ${restaurant.formattedAddress || restaurant.address}
          </p>

          <!-- Quick Actions -->
          <div style="display: flex; gap: 8px; margin: 12px 0;">
            <button onclick="window.open('tel:${restaurant.phoneNumber || restaurant.internationalPhoneNumber}', '_self')" 
                    style="flex: 1; background: #4F46E5; color: white; border: none; padding: 8px 12px; 
                           border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;"
                    ${!restaurant.phoneNumber && !restaurant.internationalPhoneNumber ? 'disabled style="opacity: 0.5;"' : ''}>
              📞 Call
            </button>
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}', '_blank')" 
                    style="flex: 1; background: #059669; color: white; border: none; padding: 8px 12px; 
                           border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;">
              🧭 Directions
            </button>
            ${restaurant.website ? `
              <button onclick="window.open('${restaurant.website}', '_blank')" 
                      style="flex: 1; background: #7C3AED; color: white; border: none; padding: 8px 12px; 
                             border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;">
                🌐 Website
              </button>
            ` : ''}
          </div>

          <!-- Recent Reviews -->
          ${reviews.length > 0 ? `
            <div style="border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 12px;">
              <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #374151;">Recent Reviews</h4>
              ${reviews.map((review: any) => `
                <div style="margin-bottom: 8px; padding: 8px; background: #F9FAFB; border-radius: 6px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <img src="${review.profile_photo_url || '/placeholder.svg'}" alt="${review.author_name || 'User'}" 
                         style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                    <span style="font-weight: 500; font-size: 12px;">${review.author_name || 'Anonymous'}</span>
                    <span style="color: #F59E0B; font-size: 12px;">${'★'.repeat(review.rating)}</span>
                  </div>
                  <p style="margin: 0; font-size: 12px; color: #4B5563; line-height: 1.4;">
                    ${review.text.length > 100 ? review.text.substring(0, 100) + '...' : review.text}
                  </p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Additional Photos -->
          ${additionalPhotos.length > 0 ? `
            <div style="border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 12px;">
              <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #374151;">More Photos</h4>
              <div style="display: flex; gap: 4px; overflow-x: auto;">
                ${additionalPhotos.map((photo: string) => `
                  <img src="${photo}" alt="${restaurant.name}" 
                       style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; flex-shrink: 0;">
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

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