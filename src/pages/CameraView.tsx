import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flashlight, 
  Filter, 
  Music, 
  SwitchCamera,
  Star, 
  Heart, 
  Eye, 
  Flame
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import FilterCircle from '@/components/FilterCircle';
import TimeSticker from '@/components/TimeSticker';

const CameraView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [frontCamera, setFrontCamera] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showStickers, setShowStickers] = useState(true);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const filters = [
    { id: 'normal', name: 'Normal', color: '#f97316', icon: 'camera' },
    { id: 'spicy', name: 'Spicy Cam', color: '#ef4444', icon: 'flame' },
    { id: 'dessert', name: 'Dessert Zoom', color: '#ec4899', icon: 'heart' },
    { id: 'foodie', name: 'Foodie Blur', color: '#8b5cf6', icon: 'star' },
    { id: 'fresh', name: 'Fresh Vibes', color: '#10b981', icon: 'eye' }
  ];

  // Initialize camera
  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    
    return () => {
      // Cleanup camera
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage, frontCamera]);

  const startCamera = async () => {
    try {
      const facingMode = frontCamera ? "user" : "environment";
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
    toast({
      title: isFlashOn ? "Flash Off" : "Flash On",
      duration: 1000
    });
  };

  const toggleCamera = () => {
    setFrontCamera(!frontCamera);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame onto canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get base64 image from canvas
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);

      // Animate capture with flash effect
      const flashElement = document.getElementById('camera-flash');
      if (flashElement) {
        flashElement.classList.add('animate-flash');
        setTimeout(() => {
          flashElement?.classList.remove('animate-flash');
        }, 300);
      }
      
      toast({
        title: "Photo captured!",
        description: "Swipe up to create a post",
        duration: 3000
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (capturedImage) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (capturedImage && touchStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diff = touchStartY - currentY;
      
      // If swiped up at least 100px
      if (diff > 100) {
        navigateToPost();
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
  };

  const navigateToPost = () => {
    if (capturedImage) {
      // Store the image to use in post creation
      localStorage.setItem('capturedImage', capturedImage);
      navigate('/add-post');
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
  };

  return (
    <div className="h-screen bg-black relative">
      {/* Camera flash overlay */}
      <div 
        id="camera-flash" 
        className="absolute inset-0 bg-white opacity-0 z-30"
      ></div>
      
      {/* Camera viewfinder */}
      <div 
        className={`relative h-full flex items-center justify-center overflow-hidden ${capturedImage ? 'hidden' : ''}`}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`min-h-full min-w-full object-cover ${isFlashOn ? 'brightness-125' : ''} ${selectedFilter === 'spicy' ? 'sepia' : ''} ${selectedFilter === 'dessert' ? 'brightness-110 contrast-110' : ''} ${selectedFilter === 'foodie' ? 'blur-sm' : ''} ${selectedFilter === 'fresh' ? 'hue-rotate-15 saturate-150' : ''}`}
        />
      </div>
      
      {/* Captured image view */}
      <div 
        className={`relative h-full flex items-center justify-center ${!capturedImage ? 'hidden' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={capturedImage || ''} 
          alt="Captured" 
          className="min-h-full min-w-full object-cover"
        />
        <div className="absolute bottom-32 left-0 right-0 text-center text-white">
          <div className="animate-bounce-gentle">
            <p className="text-lg font-bold">Swipe up to post</p>
            <div className="h-12 w-1 mx-auto bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Top control bar */}
      <div className="absolute top-4 right-4 flex gap-4 z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-black/30 text-white hover:bg-black/50" 
          onClick={toggleFlash}
        >
          <Flashlight className={`${isFlashOn ? 'text-yellow-400' : 'text-white'}`} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-black/30 text-white hover:bg-black/50"
        >
          <Filter />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-black/30 text-white hover:bg-black/50"
        >
          <Music />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-black/30 text-white hover:bg-black/50" 
          onClick={toggleCamera}
        >
          <SwitchCamera />
        </Button>
      </div>
      
      {/* Stickers and tags (only shown on live camera view) */}
      {showStickers && !capturedImage && (
        <>
          <TimeSticker />
          
          <div className="absolute top-1/3 right-4 z-20">
            <Badge className="bg-fuzo-yellow text-fuzo-dark font-bold px-3 py-2 text-sm animate-pulse-scale">
              Add to Must Try?
            </Badge>
          </div>
          
          <div className="absolute top-1/2 left-4 flex flex-col gap-4 z-20">
            <div className="bg-fuzo-coral rounded-full p-2 animate-bounce-gentle">
              <Flame size={24} className="text-white" />
            </div>
            <div className="bg-fuzo-purple rounded-full p-2 animate-pulse-scale">
              <Heart size={24} className="text-white" />
            </div>
            <div className="bg-fuzo-teal rounded-full p-2 animate-bounce-gentle delay-300">
              <Eye size={24} className="text-white" />
            </div>
          </div>
        </>
      )}
      
      {/* Filter carousel */}
      <div className="absolute bottom-32 left-0 right-0 z-20">
        <div className="flex overflow-x-auto pb-4 px-4 gap-4 hide-scrollbar">
          {filters.map(filter => (
            <FilterCircle
              key={filter.id}
              name={filter.name}
              color={filter.color}
              icon={filter.icon}
              isSelected={selectedFilter === filter.id}
              onSelect={() => setSelectedFilter(filter.id === selectedFilter ? null : filter.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom capture button */}
      {!capturedImage ? (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center z-20">
          <button 
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-white"></div>
          </button>
        </div>
      ) : (
        <div className="absolute bottom-12 left-0 right-0 flex justify-between items-center z-20 px-12">
          <Button 
            onClick={resetCamera}
            className="rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md"
          >
            Retake
          </Button>
          
          <Button 
            onClick={navigateToPost}
            className="rounded-full bg-fuzo-coral text-white hover:bg-fuzo-coral/80"
          >
            Create Post
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraView;
