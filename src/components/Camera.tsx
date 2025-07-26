
import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, ArrowLeft, RotateCcw, Settings, AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/lib/supabaseClient';

const Camera: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    if (locationError) {
      setCameraError('Unable to access location. Photos won\'t include location data.');
    }
  }, [locationError]);

  // Handle camera stream when videoRef is available
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      console.log('Setting video srcObject with stream:', cameraStream);
      videoRef.current.srcObject = cameraStream;
      setIsCapturing(true);
    }
  }, [cameraStream]);

  // Check camera permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionStatus(permission.state);
          
          permission.onchange = () => {
            setPermissionStatus(permission.state);
          };
        }
      } catch (error) {
        console.log('Permission API not supported, will check on camera access');
      }
    };
    
    checkPermissions();
  }, []);

  const startCamera = async () => {
    console.log('startCamera called');
    setIsLoading(true);
    setCameraError(null);
    
    try {
      // Check if we're on HTTPS (required for camera access)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        throw new Error('Camera access requires HTTPS. Please use HTTPS or localhost.');
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      setCameraStream(stream);
      console.log('Camera stream stored in state, will be set when videoRef is available');
    } catch (error: unknown) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Unable to access camera. Please check permissions.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera is not supported on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else if (error.message.includes('HTTPS')) {
          errorMessage = error.message;
        }
      }
      
      setCameraError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    console.log('capturePhoto called, videoRef.current:', !!videoRef.current);
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        // Create filename with timestamp and coordinates
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const coords = location ? `${location.lat.toFixed(4)}_${location.lng.toFixed(4)}` : 'no-location';
        const filename = `guest-image-${timestamp}-${coords}.jpg`;
        
        // Save to local storage
        const localImageKey = `camera_${timestamp}`;
        localStorage.setItem(localImageKey, imageData);
        console.log('Photo captured and saved to local storage:', localImageKey);
        console.log('Filename will be:', filename);
        console.log('Location data:', location);
        
        // Stop the camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
        console.log('Photo captured successfully');
      } else {
        console.error('Could not get canvas context');
      }
    } else {
      console.error('videoRef.current is null');
    }
  };

  const uploadImage = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    setUploadStatus('Uploading image to guestimages bucket...');

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create filename with timestamp and coordinates
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const coords = location ? `${location.lat.toFixed(4)}_${location.lng.toFixed(4)}` : 'no-location';
      const filename = `guest-image-${timestamp}-${coords}.jpg`;
      console.log('Uploading with filename:', filename);

      // Create FormData for the edge function
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('filename', filename);

      // Upload to Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://poxkkgxonmzdhizzworc.supabase.co';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const uploadResponse = await fetch(`${supabaseUrl}/functions/v1/upload-guest-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Upload failed: ${errorData.error || 'Unknown error'}`);
      }

      const result = await uploadResponse.json();
      console.log('Upload successful:', result);
      setUploadStatus('Image uploaded successfully to guestimages bucket!');
      
      // Clear from local storage after successful upload
      const localImages = Object.keys(localStorage).filter(key => key.startsWith('camera_'));
      localImages.forEach(key => {
        if (localStorage.getItem(key) === capturedImage) {
          localStorage.removeItem(key);
          console.log('Removed from local storage:', key);
        }
      });
      
      // Reset camera after successful upload
      setTimeout(() => {
        resetCamera();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setCameraError(null);
    setUploadStatus(null);
    setCameraStream(null);
    setIsCapturing(false);
  };



  return (
    <div className="flex flex-col h-full lg:pb-0 pb-20">
      <div className="sticky top-0 ios-header p-4 z-10 lg:max-w-4xl lg:mx-auto lg:w-full">
        {/* Logo */}
        <div className="flex items-center justify-start mb-4 lg:hidden">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
            className="h-6 w-18"
          />
        </div>
        
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {cameraError}
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus && (
          <Alert className={`mb-4 ${uploadStatus.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={uploadStatus.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
              {uploadStatus}
            </AlertDescription>
          </Alert>
        )}

        {!capturedImage ? (
          <div className="space-y-4">
            <Card className="ios-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gray-100 aspect-square rounded-lg overflow-hidden">
                  {cameraStream ? (
                    <video
                      ref={(el) => {
                        videoRef.current = el;
                        console.log('Video ref set:', !!el);
                        if (el && cameraStream) {
                          console.log('Setting stream on video element');
                          el.srcObject = cameraStream;
                          setIsCapturing(true);
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      onLoadedMetadata={() => console.log('Video metadata loaded')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => console.error('Video error:', e)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Tap to start camera</p>
                        {permissionStatus === 'denied' && (
                          <p className="text-xs text-red-600 mt-2">
                            Camera access denied
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              {!cameraStream ? (
                <Button 
                  onClick={startCamera}
                  disabled={isLoading}
                  className="btn-ios px-8 py-3"
                >
                  {isLoading ? 'Starting...' : 'Start Camera'}
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
                disabled={isUploading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button 
                onClick={uploadImage}
                disabled={isUploading}
                className="btn-ios px-6 py-2"
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload to Feed
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
