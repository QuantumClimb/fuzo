
import React, { useState, useRef, useCallback } from 'react';
import { Camera as CameraIcon, FlipHorizontal, Download, X, Check } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import piexif from 'piexifjs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for public uploads
// Change bucket name to 'guestimages'
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Camera: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
      setIsCapturing(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
    toast.success('Photo captured successfully!');
  }, [stopCamera]);

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isCapturing) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCaption('');
    startCamera();
  };

  const savePhoto = async () => {
    if (!capturedImage) return;
    
    try {
      // Convert data URL to Blob
      let imageDataUrl = capturedImage;
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();

      // Create a filename with no separators: guest + timestamp + randomId + .jpg
      const now = new Date();
      const pad = (n: number, l = 2) => n.toString().padStart(l, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds(), 3)}`;
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `guest${timestamp}${randomId}.jpg`;
      const uploadPath = `guest/${fileName}`;

      // If location is available, embed it into EXIF
      if (location) {
        try {
          function toDMS(val: number) {
            const abs = Math.abs(val);
            const deg = Math.floor(abs);
            const minFloat = (abs - deg) * 60;
            const min = Math.floor(minFloat);
            const sec = Math.round((minFloat - min) * 6000) / 100;
            return [[deg, 1], [min, 1], [Math.round(sec * 100), 100]];
          }
          
          const gpsData = {
            [piexif.GPSIFD.GPSLatitudeRef]: location.lat >= 0 ? 'N' : 'S',
            [piexif.GPSIFD.GPSLatitude]: toDMS(location.lat),
            [piexif.GPSIFD.GPSLongitudeRef]: location.lng >= 0 ? 'E' : 'W',
            [piexif.GPSIFD.GPSLongitude]: toDMS(location.lng),
          };
          
          const exifObj = { '0th': {}, Exif: {}, GPS: gpsData };
          const exifBytes = piexif.dump(exifObj);
          imageDataUrl = piexif.insert(exifBytes, imageDataUrl);
        } catch (err) {
          console.warn('Failed to embed EXIF location:', err);
        }
      }

      // Convert (possibly EXIF-modified) data URL to final Blob
      const finalRes = await fetch(imageDataUrl);
      const finalBlob = await finalRes.blob();

      // Single upload with proper error handling
      const { data, error } = await supabase.storage
        .from('guestimages') // <-- updated bucket name
        .upload(uploadPath, finalBlob, {
          cacheControl: '3600',
          upsert: true, // Allow overwriting if needed
          contentType: 'image/jpeg',
        });

      if (error) {
        console.error('Upload error:', error);
        
        // Fallback to download
        const url = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.error("Upload failed. But hey, it’s saved to your device. 📷");
        setCapturedImage(null);
        setCaption('');
        setUploadedImageUrl(null);
        return;
      }

      console.log('Upload success:', data.path);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('guestimages') // <-- updated bucket name
        .getPublicUrl(uploadPath);
      const imageUrl = publicUrlData.publicUrl;
      setUploadedImageUrl(imageUrl); // <-- set preview

      // Get user info
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      // Insert into feed table
      const { error: insertError } = await supabase.from('feed').insert([
        {
          user_id: user?.id,
          user_email: user?.email,
          image_url: imageUrl,
          timestamp: new Date().toISOString(),
          coordinates: location ? `${location.lat},${location.lng}` : '',
          location: location ? `${location.lat},${location.lng}` : '',
          place_id: '',
        },
      ]);

      if (insertError) {
        console.error('Database insert error:', insertError);
        toast.error('Image uploaded but failed to save to feed');
      } else {
        toast.success('Photo saved to feed!');
      }
      
      setCapturedImage(null);
      setCaption('');
      
    } catch (error) {
      console.error('Save photo error:', error);
      toast.error('Failed to save photo. Please try again.');
      setUploadedImageUrl(null);
    }
  };

  const downloadPhoto = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `fuzo-${Date.now()}.jpg`;
    link.click();
    toast.success('Photo downloaded!');
  };

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Candy Header */}
      <div className="candy-header sticky top-0 z-10 p-4">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/Fuzocube.png" 
            alt="Rubik's Chef Logo" 
            className="h-12 w-12 candy-bounce"
          />
        </div>
        {/* Banner */}
        <div className="w-full glass-candy text-center py-3 px-4 font-cta text-base my-3 rounded-2xl border-2 border-white/30">
          Snap your favorite food and restaurant moments! Share the deliciousness! 🍰
        </div>
      </div>

      <div className="flex-1 p-4">
        {locationError && (
          <Alert className="mb-4 glass-candy border-red-300/50">
            <AlertDescription className="text-white">
              {locationError} Location data won't be added to your photos.
            </AlertDescription>
          </Alert>
        )}

        {!capturedImage ? (
          <div className="space-y-4">
            <Card className="candy-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-black aspect-square rounded-2xl overflow-hidden">
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
                      <div className="text-center text-white">
                        <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50 candy-bounce" />
                        <p className="text-sm opacity-75 font-cta">Tap to start camera</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center space-x-4">
              {!isCapturing ? (
                <Button onClick={startCamera} size="lg" className="btn-candy flex-1 font-cta">
                  <CameraIcon className="h-5 w-5 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button onClick={flipCamera} variant="outline" size="lg" className="glass-candy border-white/30 text-white hover:bg-white/20 font-cta">
                    <FlipHorizontal className="h-5 w-5" />
                  </Button>
                  <Button onClick={capturePhoto} size="lg" className="btn-candy text-white shadow-lg font-cta">
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="outline" size="lg" className="glass-candy border-white/30 text-white hover:bg-white/20 font-cta">
                    <X className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="candy-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-white font-headline">Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full aspect-square object-cover rounded-2xl"
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="caption" className="text-white font-cta">Caption</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="mt-1 input-candy font-body"
                />
              </div>

              {location && (
                <div className="p-3 glass-candy rounded-2xl border-2 border-white/30">
                  <p className="text-sm font-medium text-white font-cta">Location</p>
                  <p className="text-xs text-white/80 font-body">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={retakePhoto} variant="outline" className="flex-1 glass-candy border-white/30 text-white hover:bg-white/20 font-cta">
                  <X className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={downloadPhoto} variant="outline" className="flex-1 glass-candy border-white/30 text-white hover:bg-white/20 font-cta">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={savePhoto} className="btn-candy font-cta">
                  <Check className="h-4 w-4 mr-2" />
                  Save to Feed
                </Button>
              </div>
            </div>
          </div>
        )}

        {uploadedImageUrl && (
          <div className="my-4">
            <h2 className="text-center font-semibold text-white font-headline">Uploaded Image Preview</h2>
            <img src={uploadedImageUrl} alt="Uploaded preview" className="mx-auto max-w-xs rounded-2xl shadow-lg candy-pulse" />
          </div>
        )}
        {uploadedImageUrl && (
          <div className="w-full glass-candy text-center text-sm py-3 mt-4 rounded-2xl border-2 border-green-300/50 text-white font-cta">
            Your photo has been added to the feed. Share more moments! 🎉
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default Camera;
