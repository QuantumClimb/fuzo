import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, MapPin, Crosshair } from 'lucide-react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';

const AddPost = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tag, setTag] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const popularTags = [
    'Must Try', 'Hidden Gem', 'Street Food', 'Brunch Fav', 
    'Date Night', 'Comfort Food', 'Healthy', 'Sweet Tooth'
  ];

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      // Use reverse geocoding to get address from coordinates
      if (typeof google !== 'undefined' && google.maps) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: userLocation },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              setLocation(results[0].formatted_address);
              setCoordinates(userLocation);
            }
          }
        );
      } else {
        setLocation(`${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`);
        setCoordinates(userLocation);
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setCoordinates(location);
          
          // Try to get address
          if (typeof google !== 'undefined' && google.maps) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  setLocation(results[0].formatted_address);
                } else {
                  setLocation(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
                }
              }
            );
          } else {
            setLocation(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setLocation(place.formatted_address || place.name || '');
    if (place.geometry?.location) {
      setCoordinates({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    }
  };

  const handlePost = () => {
    if (image && caption) {
      // In a real app, this would upload to a server
      console.log('Posting:', { image, caption, location, tag, coordinates });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Share Your Food" showBackButton />
      
      <div className="max-w-lg mx-auto pt-20 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="mr-3">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-fuzo-dark">Share Your Food</h1>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {image ? (
                <div className="relative">
                  <img src={image} alt="Upload preview" className="max-w-full h-64 object-cover rounded-lg mx-auto" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Upload a photo of your delicious dish</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block bg-fuzo-coral text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-fuzo-coral/90"
                  >
                    Choose Photo
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this delicious dish..."
              className="fuzo-input h-24 resize-none"
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                className="flex items-center space-x-1 text-xs"
              >
                <Crosshair size={12} />
                <span>Use Current</span>
              </Button>
            </div>
            <div className="relative">
              {apiKey ? (
                <PlacesAutocomplete
                  placeholder="Add restaurant or location"
                  value={location}
                  onChange={setLocation}
                  onPlaceSelect={handlePlaceSelect}
                  className="fuzo-input pl-10"
                />
              ) : (
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add restaurant or location"
                  className="fuzo-input pl-10"
                />
              )}
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
            {coordinates && (
              <p className="text-xs text-gray-500 mt-1">
                📍 Location saved ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})
              </p>
            )}
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <input 
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Add a tag"
              className="fuzo-input"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {popularTags.map(t => (
                <button 
                  key={t}
                  onClick={() => setTag(t)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full py-1 px-3"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handlePost}
            disabled={!image || !caption}
            className="w-full bg-fuzo-coral hover:bg-fuzo-coral/90 text-white font-semibold py-3 rounded-lg"
          >
            Share Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
