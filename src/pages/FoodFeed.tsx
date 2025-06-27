import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FoodCard from '@/components/FoodCard';
import { FoodItem } from '@/types';
import { foodItems as initialFoodItems } from '@/data/mockData';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DailyDiscoveryCard from '@/components/DailyDiscoveryCard';
import { behavioralEngine } from '@/utils/behavioralEngine';

const FoodFeed = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [showPersonalized, setShowPersonalized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Apply personalization to initial food items
    const personalizedItems = behavioralEngine.getPersonalizedRecommendations(initialFoodItems);
    setFoodItems(personalizedItems);
    
    // Simulate AI personalization on first load
    if (showPersonalized) {
      toast({
        title: "Personalized For You",
        description: "AI-powered recommendations based on your preferences",
      });
    }
  }, []);

  const handleSwipeLeft = (id: string) => {
    const item = foodItems.find(food => food.id === id);
    if (item) {
      // Record behavioral data
      behavioralEngine.recordSwipe('left', id, 'food', item.tag);
    }
    
    // Skip this item (remove from feed)
    setFoodItems(prev => prev.filter(item => item.id !== id));
    
    // Show toast
    toast({
      title: "❌ Skipped",
      description: "You won't see this item again",
      className: "bg-gray-700 border-gray-600",
    });
  };

  const handleSwipeRight = (id: string) => {
    const item = foodItems.find(food => food.id === id);
    if (item) {
      // Record behavioral data
      behavioralEngine.recordSwipe('right', id, 'food', item.tag);
    }
    
    // Save to plate
    setSavedItems(prev => [...prev, id]);
    toast({
      title: "🍽️ Saved to Plate!",
      description: "Find it in your saved items",
      className: "bg-green-600 border-green-500",
    });
    // But don't remove from feed so users can still view it
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  const refreshRecommendations = () => {
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      // Apply personalization to recommendations
      const personalizedItems = behavioralEngine.getPersonalizedRecommendations(initialFoodItems);
      setFoodItems([...personalizedItems].sort(() => 0.5 - Math.random()));
      setIsLoading(false);
      
      toast({
        title: "✨ Fresh Recommendations",
        description: "Updated based on your recent activity",
      });
    }, 1500);
  };

  const openAssistant = () => {
    navigate('/assistant');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Your Feed" 
        showSearchButton 
        onSearchClick={handleSearchClick}
      />
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="fuzo-container py-4 pb-24">
            {/* Daily Discovery Card */}
            <DailyDiscoveryCard />
            
            {showPersonalized && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Sparkles size={18} className="text-fuzo-coral mr-2" />
                  <h2 className="font-medium">Personalized For You</h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={refreshRecommendations}
                  disabled={isLoading}
                  className="text-sm text-fuzo-coral"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-fuzo-coral border-t-transparent rounded-full mr-2" />
                      Updating...
                    </span>
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            )}
            
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
            
            {foodItems.length > 0 ? (
              <div className="space-y-6">
                {foodItems.map((item) => (
                  <FoodCard 
                    key={item.id}
                    {...item}
                    onSwipeLeft={() => handleSwipeLeft(item.id)}
                    onSwipeRight={() => handleSwipeRight(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-20 text-center">
                <h3 className="text-xl font-semibold text-gray-600">No more items</h3>
                <p className="text-gray-500 mt-2">Check back later for more delicious discoveries!</p>
                <button 
                  onClick={() => setFoodItems(behavioralEngine.getPersonalizedRecommendations(initialFoodItems))}
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

export default FoodFeed;
