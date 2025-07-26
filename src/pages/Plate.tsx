import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Heart, Trash2, Share2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SEO from '@/components/SEO';

interface PlateItem {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  address: string;
  priceRange: string;
  savedAt: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const Plate = () => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<PlateItem[]>([]);

  // Load saved restaurants from localStorage on component mount
  useEffect(() => {
    const savedRestaurantsData = JSON.parse(localStorage.getItem('savedRestaurants') || '[]');
    setSavedItems(savedRestaurantsData);
  }, []);

  const handleRemoveItem = (itemId: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== itemId));
    
    // Also remove from localStorage
    const savedRestaurantsData = JSON.parse(localStorage.getItem('savedRestaurants') || '[]');
    const updatedData = savedRestaurantsData.filter((item: PlateItem) => item.id !== itemId);
    localStorage.setItem('savedRestaurants', JSON.stringify(updatedData));
  };

  const handleGetDirections = (coordinates: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleShareItem = (item: PlateItem) => {
    const text = `Check out ${item.name} - ${item.cuisine} restaurant in Toronto!`;
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: text,
        url: `https://maps.google.com/?q=${item.coordinates.lat},${item.coordinates.lng}`
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(text);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={`${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-iosText">
      <SEO 
        title="My Plate"
        description="View your saved restaurants and favorite dining spots. Organize your culinary bucket list and plan your next food adventure with FUZO."
        keywords="saved restaurants, favorite restaurants, dining bucket list, restaurant collection, food planning"
        tags={['saved restaurants', 'favorites', 'bucket list', 'food planning']}
      />
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-center mb-4 lg:hidden">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
            className="h-12 w-36"
          />
        </div>
        <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/profile')}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        
        <div className="flex-1">
          <h2 className="font-semibold text-lg">My Plate</h2>
          <p className="text-sm text-gray-500">
            {savedItems.length} saved restaurants
          </p>
        </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {savedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-strawberry to-grape rounded-full flex items-center justify-center">
              <Heart size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Your plate is empty</h3>
            <p className="text-gray-500">Swipe right on restaurants you like to save them here!</p>
          </div>
        ) : (
          savedItems.map((item) => (
            <GlassCard key={item.id} className="overflow-hidden">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gradient-to-r from-strawberry to-grape text-white">
                    {item.priceRange}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-white/90 text-gray-800">
                    {item.cuisine}
                  </Badge>
                </div>
              </div>
              
              <div className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-iosText">{item.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin size={14} className="text-iosText/70" />
                      <span className="text-sm text-iosText/70">{item.address}</span>
                    </div>
                    <div className="mt-2">
                      {renderStars(item.rating)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGetDirections(item.coordinates)}
                      className="p-2 text-iosText/70 hover:text-iosText"
                    >
                      <Navigation size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareItem(item)}
                      className="p-2 text-iosText/70 hover:text-iosText"
                    >
                      <Share2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-0">
                <p className="text-sm text-iosText/70 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-iosText/50">
                    Saved {item.savedAt}
                  </span>
                  <Button 
                    size="sm"
                    className="bg-iosAccent hover:bg-iosAccent/90 text-white"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Plate; 