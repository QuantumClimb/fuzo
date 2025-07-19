
import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, ArrowLeft, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGeolocation } from '@/hooks/useGeolocation';

const Camera: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    if (locationError) {
      setCameraError('Unable to access location. Photos won\'t include location data.');
    }
  }, [locationError]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        // Stop the camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
      }
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setCameraError(null);
  };

  return (
    <div className="flex flex-col h-full lg:pb-0 pb-20">
      <div className="sticky top-0 ios-header p-4 z-10 lg:max-w-4xl lg:mx-auto lg:w-full">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Camera</h1>
          <Button variant="ghost" size="sm" className="text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 lg:max-w-4xl lg:mx-auto lg:w-full">
        {cameraError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {cameraError}
            </AlertDescription>
          </Alert>
        )}

        {!capturedImage ? (
          <div className="space-y-4">
            <Card className="ios-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gray-100 aspect-square rounded-lg overflow-hidden">
                  {isCapturing ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Tap to start camera</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              {!isCapturing ? (
                <Button 
                  onClick={startCamera}
                  className="btn-ios px-8 py-3"
                >
                  Start Camera
                </Button>
              ) : (
                <Button 
                  onClick={capturePhoto}
                  className="btn-ios px-8 py-3"
                >
                  Take Photo
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="ios-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={resetCamera}
                variant="outline"
                className="px-6 py-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button 
                className="btn-ios px-6 py-2"
              >
                Use Photo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
