
import { useState } from 'react';
import { Heart, MessageCircle, Share, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CardDetails from '@/components/CardDetails';

interface FoodCard {
  id: string;
  name: string;
  type: string;
  cuisine: string;
  image: string;
  tags: string[];
  user: {
    id: string;
    name: string;
    avatar: string;
    location: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
  ingredients: string[];
  description: string;
}

interface SwipeCardProps {
  card: FoodCard;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SwipeCard = ({ card, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight }: SwipeCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCardClick = () => {
    setShowDetails(true);
  };

  // Transform FoodCard to Restaurant format for CardDetails
  const transformToRestaurant = () => {
    return {
      id: card.restaurant.id,
      name: card.restaurant.name,
      cuisine: card.cuisine,
      rating: 4.5, // Default rating
      priceRange: "$$", // Default price range
      coordinates: { lat: 40.7128, lng: -74.0060 }, // Default coordinates
      address: "123 Food Street, City",
      hours: "9:00 AM - 10:00 PM",
      image: card.image,
      description: card.description,
      visitCount: 15,
      phoneNumber: "+1 (555) 123-4567",
      website: "www.restaurant.com",
      features: card.tags,
      reviews: [],
      visitedByFriends: []
    };
  };

  return (
    <>
      <div className="fuzo-card relative overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <div className={`transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
          {!isFlipped ? (
            // Front of card
            <div>
              <div className="relative">
                <img 
                  src={card.image} 
                  alt={card.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-fuzo-yellow text-fuzo-dark">
                    {card.cuisine}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white text-xl font-bold mb-1">{card.name}</h3>
                  <p className="text-white/90 text-sm">{card.description}</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={card.user.avatar} 
                    alt={card.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{card.user.name}</p>
                    <p className="text-sm text-gray-500">{card.user.location}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {card.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500">
                      <Heart size={20} />
                      <span className="text-sm">24</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500">
                      <MessageCircle size={20} />
                      <span className="text-sm">8</span>
                    </button>
                    <button className="text-gray-500">
                      <Share size={20} />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlip();
                    }}
                    className="text-fuzo-coral"
                  >
                    <RotateCcw size={16} className="mr-1" />
                    Recipe
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Back of card - Recipe/Ingredients
            <div className="p-6 min-h-[400px] bg-gradient-to-br from-fuzo-yellow/10 to-fuzo-coral/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{card.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className="text-fuzo-coral"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Back
                </Button>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-fuzo-dark">Ingredients:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {card.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-fuzo-coral rounded-full"></div>
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-fuzo-dark">About:</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
              </div>
              
              <div className="mt-4 p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-gray-500">
                  Recipe shared by <span className="font-medium">{card.user.name}</span> from {card.restaurant.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Swipe Buttons */}
      <div className="flex justify-between items-center mt-4 px-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white shadow-lg border-2 hover:bg-orange-50 hover:border-orange-300"
          onClick={(e) => {
            e.stopPropagation();
            onSwipeLeft();
          }}
        >
          <ArrowLeft size={20} className="text-orange-500" />
        </Button>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-lg border-2 hover:bg-gray-50 hover:border-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onSwipeDown();
            }}
          >
            <ArrowDown size={20} className="text-gray-500" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-lg border-2 hover:bg-red-50 hover:border-red-300"
            onClick={(e) => {
              e.stopPropagation();
              onSwipeUp();
            }}
          >
            <ArrowUp size={20} className="text-red-500" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white shadow-lg border-2 hover:bg-green-50 hover:border-green-300"
          onClick={(e) => {
            e.stopPropagation();
            onSwipeRight();
          }}
        >
          <ArrowRight size={20} className="text-green-500" />
        </Button>
      </div>
      
      {/* Swipe Instructions */}
      <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
        <span>Skip</span>
        <div className="flex space-x-8">
          <span>Pass</span>
          <span>❤️</span>
        </div>
        <span>Save</span>
      </div>

      <CardDetails
        restaurant={transformToRestaurant()}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default SwipeCard;
