
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import SwipeCard from '@/components/SwipeCard';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DailyDiscoveryCard from '@/components/DailyDiscoveryCard';
import cardsData from '@/data/cards.json';

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

const SwipeFeed = () => {
  const [foodCards, setFoodCards] = useState<FoodCard[]>([]);
  const [savedCards, setSavedCards] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setFoodCards(cardsData as FoodCard[]);
  }, []);

  const handleSwipeUp = (id: string) => {
    // Save to favorites
    setSavedCards(prev => [...prev, id]);
    toast({
      title: "❤️ Added to Favorites!",
      description: "Saved to your collection",
      className: "bg-red-500 border-red-400",
    });
    removeCard(id);
  };

  const handleSwipeDown = (id: string) => {
    // Skip/Not interested
    toast({
      title: "👎 Not Interested",
      description: "Won't show similar items",
      className: "bg-gray-600 border-gray-500",
    });
    removeCard(id);
  };

  const handleSwipeLeft = (id: string) => {
    // Skip this item
    toast({
      title: "⏭️ Skipped",
      description: "Moving to next item",
      className: "bg-orange-500 border-orange-400",
    });
    removeCard(id);
  };

  const handleSwipeRight = (id: string) => {
    // Save to plate
    setSavedCards(prev => [...prev, id]);
    toast({
      title: "🍽️ Saved to Plate!",
      description: "Find it in your saved items",
      className: "bg-green-600 border-green-500",
    });
    removeCard(id);
  };

  const removeCard = (id: string) => {
    setFoodCards(prev => prev.filter(card => card.id !== id));
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  const openAssistant = () => {
    navigate('/assistant');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Discover" 
        showSearchButton 
        onSearchClick={handleSearchClick}
      />
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="fuzo-container py-4 pb-24">
            {/* Daily Discovery Card */}
            <DailyDiscoveryCard />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Sparkles size={18} className="text-fuzo-coral mr-2" />
                <h2 className="font-medium">For You</h2>
              </div>
            </div>
            
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-white"
                onClick={openAssistant}
              >
                <MessageCircle size={16} className="mr-2 text-fuzo-purple" />
                Ask FUZO Assistant
              </Button>
            </div>
            
            {foodCards.length > 0 ? (
              <div className="space-y-6">
                {foodCards.map((card) => (
                  <SwipeCard 
                    key={card.id}
                    card={card}
                    onSwipeUp={() => handleSwipeUp(card.id)}
                    onSwipeDown={() => handleSwipeDown(card.id)}
                    onSwipeLeft={() => handleSwipeLeft(card.id)}
                    onSwipeRight={() => handleSwipeRight(card.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-20 text-center">
                <h3 className="text-xl font-semibold text-gray-600">No more cards</h3>
                <p className="text-gray-500 mt-2">Check back later for more delicious discoveries!</p>
                <button 
                  onClick={() => setFoodCards(cardsData as FoodCard[])}
                  className="fuzo-btn fuzo-btn-primary py-2 px-6 mt-4"
                >
                  Restart Demo
                </button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SwipeFeed;
