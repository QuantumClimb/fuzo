import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Circle, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/lib/supabaseClient';
import { FriendVisit } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Users, MapPin, Star } from 'lucide-react';

const mapContainerStyle = {
  width: 'calc(100% - 32px)', // 16px padding on each side
  height: 'calc(100vh - 120px)', // Adjust for nav height and padding
  aspectRatio: '9/16',
  margin: '16px',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  overflow: 'hidden',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  tilt: 45, // Enable 3D tilt
  rotateControl: true, // Enable rotation
  mapTypeId: 'roadmap',
  styles: [
    {
      "elementType": "geometry",
      "stylers": [
        { "color": "#fff0f0" }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#a42c2c" }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        { "color": "#fff8f8" }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        { "color": "#ffe8ec" }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        { "color": "#daf9e2" }
      ]
    },
    {
      "featureType": "poi.medical",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        { "color": "#ffc2cc" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        { "color": "#ff9aa2" }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        { "color": "#fcb045" }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        { "color": "#fca311" }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "water",
      "stylers": [
        { "color": "#aee8ff" }
      ]
    },
    {
      "featureType": "poi.attraction",
      "elementType": "labels.icon",
      "stylers": [
        { "visibility": "on" }
      ]
    }
  ]
};

const RADIUS_METERS = 500;

interface RadarState {
  destination: google.maps.LatLngLiteral | null;
  directions: google.maps.DirectionsResult | null;
  sweepAngle: number;
  isScanning: boolean;
  distance: number;
  estimatedTime: number;
}

interface SocialMapState {
  showFriendsOnly: boolean;
  friendVisits: FriendVisit[];
  loadingVisits: boolean;
}

const RadarWithGoogleMaps: React.FC = () => {
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [radarState, setRadarState] = useState<RadarState>({
    destination: null,
    directions: null,
    sweepAngle: 0,
    isScanning: false,
    distance: 0,
    estimatedTime: 0,
  });

  const [socialMapState, setSocialMapState] = useState<SocialMapState>({
    showFriendsOnly: false,
    friendVisits: [],
    loadingVisits: false,
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (!location && !locationLoading) getCurrentLocation();
  }, [location, locationLoading, getCurrentLocation]);

  // Fetch friend visits for social map
  const fetchFriendVisits = useCallback(async () => {
    if (!location) return;

    try {
      setSocialMapState(prev => ({ ...prev, loadingVisits: true }));
      
      const { data, error } = await supabase
        .from('friend_visits')
        .select('*')
        .order('visit_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching friend visits:', error);
        return;
      }

      setSocialMapState(prev => ({ 
        ...prev, 
        friendVisits: data || [],
        loadingVisits: false 
      }));
    } catch (error) {
      console.error('Error fetching friend visits:', error);
      setSocialMapState(prev => ({ ...prev, loadingVisits: false }));
    }
  }, [location]);

  useEffect(() => {
    fetchFriendVisits();
  }, [fetchFriendVisits]);

  // Initialize DirectionsService when map loads
  useEffect(() => {
    if (isLoaded && !directionsService) {
      setDirectionsService(new google.maps.DirectionsService());
    }
  }, [isLoaded, directionsService]);

  // Radar sweep animation
  useEffect(() => {
    if (radarState.isScanning) {
      const interval = setInterval(() => {
        setRadarState(prev => ({
          ...prev,
          sweepAngle: (prev.sweepAngle + 5) % 360,
        }));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [radarState.isScanning]);

  // Set tilt and heading for 3D effect when map loads
  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    if (mapInstance && mapInstance.setTilt && mapInstance.setHeading) {
      mapInstance.setTilt(45);
      mapInstance.setHeading(0);
    }
  }, []);

  // Handle map click to set destination
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !location || !directionsService) return;

    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    setRadarState(prev => ({
      ...prev,
      destination: clickedLocation,
      isScanning: true,
    }));

    // Calculate route
    directionsService.route(
      {
        origin: location,
        destination: clickedLocation,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRadarState(prev => ({
            ...prev,
            directions: result,
            distance: leg.distance?.value || 0,
            estimatedTime: leg.duration?.value || 0,
            isScanning: false,
          }));
        } else {
          console.error('Directions request failed:', status);
          setRadarState(prev => ({
            ...prev,
            isScanning: false,
          }));
        }
      }
    );
  }, [location, directionsService]);

  const clearRoute = () => {
    setRadarState({
      destination: null,
      directions: null,
      sweepAngle: 0,
      isScanning: false,
      distance: 0,
      estimatedTime: 0,
    });
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const formatVisitDate = (visitDate: string) => {
    const now = new Date();
    const visit = new Date(visitDate);
    const diffInDays = Math.floor((now.getTime() - visit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return visit.toLocaleDateString();
  };

  const handleToggleFriendsOnly = () => {
    setSocialMapState(prev => ({ ...prev, showFriendsOnly: !prev.showFriendsOnly }));
  };

  return (
    <div className="flex flex-col h-full lg:pb-0 pb-20">
      {/* Candy Header with Fuzocube Logo */}
      <div className="candy-header sticky top-0 z-10 p-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        <div className="flex items-center justify-start mb-4 lg:hidden">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
            className="h-6 w-18 candy-bounce"
          />
        </div>
        <div className="w-full glass-candy text-center py-3 px-4 font-cta text-base my-3 rounded-2xl border-2 border-white/30">
          {radarState.destination ? 
            `📍 Course plotted! ${formatDistance(radarState.distance)} • ${formatTime(radarState.estimatedTime)}` :
            "Tap anywhere to plot your course! 🎯"
          }
        </div>
        
        {/* Social Map Controls */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <Users className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Friends Only</span>
            <Switch
              checked={socialMapState.showFriendsOnly}
              onCheckedChange={handleToggleFriendsOnly}
              className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/30"
            />
          </div>
          
          {socialMapState.loadingVisits && (
            <div className="flex items-center space-x-2 text-white text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Loading visits...</span>
            </div>
          )}
        </div>

        {/* Radar controls */}
        {radarState.destination && (
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={clearRoute}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-cta text-sm font-bold shadow-lg border-2 border-red-300/50 hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
            >
              Clear Route
            </button>
            <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-cta text-sm font-bold shadow-lg border-2 border-green-300/50 flex items-center gap-2">
              {radarState.isScanning ? (
                <>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <span>🎯</span>
                  Course Locked
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        {locationError && (
          <div className="text-center text-white font-body p-4 glass-candy rounded-2xl border-2 border-red-300/50">{locationError}</div>
        )}
        {locationLoading && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
            <span className="font-body text-white font-cta">Getting your location...</span>
          </div>
        )}
        {isLoaded && location && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              {/* Radar scanning effect overlay */}
              {radarState.isScanning && (
                <div className="absolute inset-0 z-10 pointer-events-none rounded-[20px] overflow-hidden">
                  <div className="relative w-full h-full">
                    <div 
                      className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent origin-left"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${radarState.sweepAngle}deg)`,
                        boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)',
                      }}
                    />
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                </div>
              )}
              
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: location.lat, lng: location.lng }}
                zoom={18}
                options={mapOptions}
                onLoad={handleMapLoad}
                onClick={handleMapClick}
              >
                {/* User location circle */}
                <Circle
                  center={{ lat: location.lat, lng: location.lng }}
                  radius={RADIUS_METERS}
                  options={{
                    fillColor: radarState.isScanning ? '#00ffff' : '#ff3d3d',
                    fillOpacity: radarState.isScanning ? 0.1 : 0.15,
                    strokeColor: radarState.isScanning ? '#00ffff' : '#ff3d3d',
                    strokeOpacity: radarState.isScanning ? 1 : 0.8,
                    strokeWeight: radarState.isScanning ? 2 : 3,
                  }}
                />

                {/* User location marker */}
                <Marker
                  position={{ lat: location.lat, lng: location.lng }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#00ff00',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                />

                {/* Destination marker */}
                {radarState.destination && (
                  <Marker
                    position={radarState.destination}
                    icon={{
                      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                      scale: 6,
                      fillColor: '#ff4444',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                      rotation: 0,
                    }}
                  />
                )}

                {/* Route display */}
                {radarState.directions && (
                  <DirectionsRenderer
                    directions={radarState.directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#ff4444',
                        strokeWeight: 4,
                        strokeOpacity: 0.8,
                      },
                    }}
                  />
                )}

                {/* Friend visit markers */}
                {socialMapState.friendVisits.map((visit) => (
                  <Marker
                    key={visit.id}
                    position={visit.coordinates}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#4CAF50',
                      fillOpacity: 0.8,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                    title={`${visit.username} visited ${visit.restaurant_name}`}
                    onClick={() => {
                      // Show visit details in info window
                      const infoWindow = new google.maps.InfoWindow({
                        content: `
                          <div style="padding: 8px; max-width: 200px;">
                            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                              <img src="${visit.avatar}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;" />
                              <div>
                                <div style="font-weight: bold; font-size: 14px;">${visit.username}</div>
                                <div style="font-size: 12px; color: #666;">${formatVisitDate(visit.visit_date)}</div>
                              </div>
                            </div>
                            <div style="font-size: 13px; margin-bottom: 4px;">
                              <strong>${visit.restaurant_name}</strong>
                            </div>
                            ${visit.rating ? `<div style="font-size: 12px; color: #666;">⭐ ${visit.rating}/5</div>` : ''}
                            ${visit.review ? `<div style="font-size: 12px; margin-top: 4px;">"${visit.review}"</div>` : ''}
                            ${visit.emoji_reaction ? `<div style="font-size: 16px; margin-top: 4px;">${visit.emoji_reaction}</div>` : ''}
                          </div>
                        `
                      });
                      infoWindow.setPosition(visit.coordinates);
                      infoWindow.open(map);
                    }}
                  />
                ))}
              </GoogleMap>
            </div>
          </div>
        )}
        {!location && !locationLoading && (
          <div className="flex flex-col items-center w-full">
                      <button
            onClick={getCurrentLocation}
            className="mt-8 px-8 py-4 btn-candy text-white rounded-2xl font-cta text-lg shadow-2xl font-bold candy-pulse transform transition-all duration-300 hover:scale-110"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              Detect My Location
            </span>
          </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadarWithGoogleMaps; 