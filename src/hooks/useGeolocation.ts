
import { useState, useEffect } from 'react';
import { UserLocation } from '@/types';

interface GeolocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const getCurrentLocation = () => {
    console.log('getCurrentLocation called');
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    console.log('Requesting location with high accuracy...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        // Determine location source based on accuracy
        const locationSource = accuracy && accuracy < 100 ? 'GPS' : 
                              accuracy && accuracy < 1000 ? 'Network (WiFi/Cell)' : 
                              'IP-based (Low accuracy)';
        
        console.log('Location obtained successfully:', { 
          lat: latitude, 
          lng: longitude,
          accuracy: accuracy ? `${accuracy}m` : 'unknown',
          locationSource,
          altitude: altitude ? `${altitude}m` : 'unknown',
          heading: heading ? `${heading}°` : 'unknown',
          speed: speed ? `${speed}m/s` : 'unknown',
          timestamp: new Date(position.timestamp).toISOString()
        });
        setState({
          location: { lat: latitude, lng: longitude },
          loading: false,
          error: null,
        });
        console.log('Location obtained:', { lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setState({
          location: null,
          loading: false,
          error: errorMessage,
        });
        console.error('Geolocation error:', errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // 30 seconds to allow GPS to acquire
        maximumAge: 0, // Force fresh location, no caching
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    ...state,
    getCurrentLocation,
  };
};
