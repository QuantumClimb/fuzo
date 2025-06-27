import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crosshair, MapPin, Shield } from 'lucide-react';

interface LocationPermissionGuideProps {
  onRetryLocation: () => void;
}

const LocationPermissionGuide: React.FC<LocationPermissionGuideProps> = ({ onRetryLocation }) => {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <Shield className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-700">
        <div className="space-y-3">
          <p className="font-medium">📍 Location Access Needed</p>
          <p className="text-sm">
            To show restaurants near you, please enable location access:
          </p>
          
          <div className="text-sm space-y-2">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>Click the location icon (🔒 or 📍) in your browser's address bar</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>Select "Allow" for location permissions</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>Click "Retry Location" below</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={onRetryLocation}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Crosshair size={14} className="mr-1" />
              Retry Location
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const url = window.location.protocol === 'https:' 
                  ? 'https://support.google.com/chrome/answer/142065'
                  : 'https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API';
                window.open(url, '_blank');
              }}
            >
              <MapPin size={14} className="mr-1" />
              Need Help?
            </Button>
          </div>

          {window.location.protocol !== 'https:' && (
            <div className="text-xs text-amber-600 bg-amber-100 p-2 rounded">
              ⚠️ Note: Location detection works best on HTTPS. If you're having issues, try accessing the app via HTTPS.
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LocationPermissionGuide; 