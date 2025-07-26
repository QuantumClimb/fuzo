import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, ArrowUp, ArrowDown, MapPin, Star } from 'lucide-react';

const SwipeFeedTest: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Mock data for testing
  const mockCards = [
    {
      id: '1',
      title: 'Margherita Pizza',
      description: 'Classic Italian pizza with fresh mozzarella and basil',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      cuisine: 'Italian',
      location: 'Toronto, ON',
      rating: 4.5,
      priceRange: '$$',
      tags: ['pizza', 'italian', 'classic']
    },
    {
      id: '2',
      title: 'Sushi Roll Combo',
      description: 'Fresh salmon and tuna rolls with miso soup',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
      cuisine: 'Japanese',
      location: 'Toronto, ON',
      rating: 4.8,
      priceRange: '$$$',
      tags: ['sushi', 'japanese', 'fresh']
    }
  ];

  const currentCard = mockCards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    console.log(`Swiped ${direction} on ${currentCard.title}`);
    if (currentIndex < mockCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">All Done!</h2>
        <p className="text-muted-foreground mb-6">
          You've seen all available cards.
        </p>
        <Button onClick={() => setCurrentIndex(0)}>
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Swipe Feed Test</h2>
          <Badge variant="secondary">{currentIndex + 1} / {mockCards.length}</Badge>
        </div>
      </div>

      {/* Swipe Card */}
      <div className="max-w-md mx-auto">
        <Card className="w-full h-[400px] overflow-hidden">
          <div className="relative h-2/3">
            <img
              src={currentCard.image}
              alt={currentCard.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Card info overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold mb-2">{currentCard.title}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {currentCard.cuisine}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{currentCard.rating}</span>
                </div>
                <span className="text-sm">{currentCard.priceRange}</span>
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{currentCard.location}</span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4 h-1/3 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {currentCard.description}
            </p>
            
            {/* Swipe action buttons */}
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipe('left')}
                className="w-12 h-12 rounded-full border-2 border-red-300 hover:border-red-500 hover:bg-red-50"
              >
                <X className="w-6 h-6 text-red-500" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipe('down')}
                className="w-12 h-12 rounded-full border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
              >
                <ArrowDown className="w-6 h-6 text-blue-500" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipe('up')}
                className="w-12 h-12 rounded-full border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
              >
                <ArrowUp className="w-6 h-6 text-orange-500" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipe('right')}
                className="w-12 h-12 rounded-full border-2 border-green-300 hover:border-green-500 hover:bg-green-50"
              >
                <Heart className="w-6 h-6 text-green-500" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Swipe right to save • Swipe left to skip • Swipe up for strong interest • Swipe down to save for later</p>
      </div>
    </div>
  );
};

export default SwipeFeedTest; 