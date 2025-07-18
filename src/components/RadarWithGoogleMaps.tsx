import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { useGeolocation } from '@/hooks/useGeolocation';

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

const RadarWithGoogleMaps: React.FC = () => {
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const [map, setMap] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (!location && !locationLoading) getCurrentLocation();
  }, [location, locationLoading, getCurrentLocation]);

  // Set tilt and heading for 3D effect when map loads
  const handleMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    if (mapInstance && mapInstance.setTilt && mapInstance.setHeading) {
      mapInstance.setTilt(45);
      mapInstance.setHeading(0);
    }
  };

  return (
    <div className="flex flex-col h-full pb-20 bg-gradient-to-b from-pink-50 to-pink-100">
      {/* Candy Header with Fuzocube Logo */}
      <div className="candy-header sticky top-0 z-10 p-4">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/Fuzocube.png" 
            alt="Rubik's Chef Logo" 
            className="h-12 w-12 candy-bounce"
          />
        </div>
        <div className="w-full glass-candy text-center py-3 px-4 font-cta text-base my-3 rounded-2xl border-2 border-white/30">
          Scout locations nearby and pin them to win candy rewards! 🍭
        </div>
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
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: location.lat, lng: location.lng }}
                zoom={18}
                options={mapOptions}
                onLoad={handleMapLoad}
              >
                <Circle
                  center={{ lat: location.lat, lng: location.lng }}
                  radius={RADIUS_METERS}
                  options={{
                    fillColor: '#ff3d3d',
                    fillOpacity: 0.15,
                    strokeColor: '#ff3d3d',
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                  }}
                />
              </GoogleMap>
            </div>
          </div>
        )}
        {!location && !locationLoading && (
          <div className="flex flex-col items-center w-full">
            <button
              onClick={getCurrentLocation}
              className="mt-8 px-6 py-3 btn-candy text-white rounded-2xl font-cta text-lg shadow-lg font-bold candy-pulse"
            >
              Detect My Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadarWithGoogleMaps; 