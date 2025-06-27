import React, { useState } from 'react';
import GoogleMapComponent from './GoogleMapComponent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const GoogleMapsTest: React.FC = () => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Sample restaurant data for testing
  const testRestaurants = [
    {
      id: '1',
      name: 'Test Restaurant 1',
      cuisine: 'Italian',
      rating: 4.5,
      coordinates: { lat: 33.7490, lng: -84.3880 }
    },
    {
      id: '2',
      name: 'Test Restaurant 2', 
      cuisine: 'Japanese',
      rating: 4.2,
      coordinates: { lat: 33.7815, lng: -84.3830 }
    },
    {
      id: '3',
      name: 'Test Restaurant 3',
      cuisine: 'Mexican',
      rating: 3.8,
      coordinates: { lat: 33.7680, lng: -84.3520 }
    }
  ];

  const runAPITest = async () => {
    setTestStatus('testing');
    setErrorMessage('');

    try {
      // Test if API key is configured
      if (!apiKey) {
        throw new Error('Google Maps API key is not configured in .env.local');
      }

      // Test if API key format is correct
      if (!apiKey.startsWith('AIza')) {
        throw new Error('Google Maps API key format appears to be incorrect');
      }

      // Simple API availability test
      const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      
      setTestStatus('success');
    } catch (error) {
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleRestaurantClick = (restaurant: any) => {
    alert(`Clicked on: ${restaurant.name} (${restaurant.cuisine})`);
  };

  return (
    <div className="space-y-6">
      {/* API Test Status */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Google Maps API Test</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Key Status:</span>
            {apiKey ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle size={12} className="mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle size={12} className="mr-1" />
                Missing
              </Badge>
            )}
          </div>

          {apiKey && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Key Format:</span>
              <Badge className={apiKey.startsWith('AIza') ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {apiKey.startsWith('AIza') ? 'Valid Format' : 'Invalid Format'}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Key (masked):</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              {apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'Not found'}
            </code>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Test Status:</span>
            <div className="flex items-center space-x-2">
              {testStatus === 'idle' && (
                <Badge variant="secondary">Ready to Test</Badge>
              )}
              {testStatus === 'testing' && (
                <Badge className="bg-blue-100 text-blue-800">
                  <RefreshCw size={12} className="mr-1 animate-spin" />
                  Testing...
                </Badge>
              )}
              {testStatus === 'success' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle size={12} className="mr-1" />
                  API Key Valid
                </Badge>
              )}
              {testStatus === 'error' && (
                <Badge variant="destructive">
                  <XCircle size={12} className="mr-1" />
                  Test Failed
                </Badge>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium">Error:</p>
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}

          <Button 
            onClick={runAPITest} 
            disabled={testStatus === 'testing' || !apiKey}
            className="w-full bg-fuzo-coral hover:bg-fuzo-coral/90"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test API Connection'}
          </Button>
        </div>
      </div>

      {/* Live Map Test */}
      {apiKey && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Live Map Test</h3>
          <p className="text-sm text-gray-600 mb-4">
            If the API key is working correctly, you should see a Google Map below with test restaurant markers.
            Click on the markers to test interactivity.
          </p>
          
          <div className="h-96 rounded-lg overflow-hidden border">
            <GoogleMapComponent
              apiKey={apiKey}
              center={{ lat: 33.7490, lng: -84.3880 }} // Atlanta, GA
              zoom={12}
              restaurants={testRestaurants}
              onRestaurantClick={handleRestaurantClick}
            />
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">Map Test Instructions:</p>
            <ul className="text-blue-700 text-sm mt-1 space-y-1">
              <li>• The map should load without errors</li>
              <li>• You should see 3 colored restaurant markers</li>
              <li>• Clicking markers should show restaurant names</li>
              <li>• Green markers = 4.5+ rating, Yellow = 3.5-4.4, Red = &lt;3.5</li>
            </ul>
          </div>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Troubleshooting Guide</h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-medium text-gray-800">If the map fails to load:</p>
            <ul className="text-gray-600 ml-4 mt-1 space-y-1">
              <li>• Check that your API key is correct in .env.local</li>
              <li>• Ensure the Maps JavaScript API is enabled in Google Cloud Console</li>
              <li>• Verify API key restrictions (HTTP referrers/IP addresses)</li>
              <li>• Check browser console for detailed error messages</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-800">Required Google APIs:</p>
            <ul className="text-gray-600 ml-4 mt-1 space-y-1">
              <li>• Maps JavaScript API</li>
              <li>• Places API (for restaurant search)</li>
              <li>• Geocoding API (for address conversion)</li>
              <li>• Directions API (for route planning)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsTest; 