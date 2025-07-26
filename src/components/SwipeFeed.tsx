import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, ArrowUp, ArrowDown, MapPin, Star, RotateCcw, Filter, Info } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/lib/supabaseClient';
import { SwipeCard, SwipeAction } from '@/types';
import { toast } from 'sonner';

interface SwipeFeedProps {
  onSwipeAction?: (action: SwipeAction) => void;
}

const SwipeFeed: React.FC<SwipeFeedProps> = ({ onSwipeAction }) => {
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [swipeHistory, setSwipeHistory] = useState<SwipeAction[]>([]);
  
  const { location: userLocation } = useGeolocation();
  const constraintsRef = useRef(null);

  // Motion values for swipe animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);

  // Fetch swipe cards from Supabase
  const fetchSwipeCards = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('food_cards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by cuisine if selected
      if (selectedCuisine !== 'all') {
        query = query.eq('cuisine', selectedCuisine);
      }

      // Filter by location if available
      if (userLocation) {
        // Note: Location filtering would require PostGIS extension
        // For now, we'll fetch all cards and filter client-side
        console.log('Location filtering would be implemented with PostGIS');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching swipe cards:', error);
        toast.error('Failed to load cards');
        return;
      }

      setCards(data || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  // Record swipe action to Supabase
  const recordSwipeAction = async (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!cards[currentIndex]) return;

    const swipeAction: Omit<SwipeAction, 'id' | 'timestamp'> = {
      user_id: 'guest', // Replace with actual user ID
      card_id: cards[currentIndex].id,
      direction,
      location: userLocation || undefined,
    };

    try {
      const { error } = await supabase
        .from('user_swipes')
        .insert([swipeAction]);

      if (error) {
        console.error('Error recording swipe:', error);
      } else {
        setSwipeHistory(prev => [...prev, { ...swipeAction, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
        onSwipeAction?.({ ...swipeAction, id: Date.now().toString(), timestamp: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  // Handle swipe gestures
  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const { offset, velocity } = info;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(offset.y) > swipeThreshold) {
      let direction: 'left' | 'right' | 'up' | 'down';

      if (Math.abs(offset.x) > Math.abs(offset.y)) {
        direction = offset.x > 0 ? 'right' : 'left';
      } else {
        direction = offset.y > 0 ? 'down' : 'up';
      }

      await handleSwipe(direction);
    } else {
      // Reset position if swipe wasn't strong enough
      x.set(0);
      y.set(0);
    }
  };

  // Handle swipe actions
  const handleSwipe = async (direction: 'left' | 'right' | 'up' | 'down') => {
    if (currentIndex >= cards.length) return;

    await recordSwipeAction(direction);

    // Show appropriate toast message
    switch (direction) {
      case 'right':
        toast.success('❤️ Added to My Plate!', {
          description: `${cards[currentIndex].title} has been saved.`,
        });
        break;
      case 'left':
        toast.info('⏭️ Skipped', {
          description: 'You won\'t see this again.',
        });
        break;
      case 'up':
        toast.success('🔥 Strong Interest!', {
          description: 'We\'ll prioritize similar recommendations.',
        });
        break;
      case 'down':
        toast.success('💤 Saved for Later', {
          description: 'Check your saved items later.',
        });
        break;
    }

    // Move to next card
    setCurrentIndex(prev => prev + 1);
    setIsFlipped(false);
    
    // Reset motion values
    x.set(0);
    y.set(0);
  };

  // Handle manual button clicks
  const handleButtonSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    handleSwipe(direction);
  };

  // Reset card stack
  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSwipeHistory([]);
    x.set(0);
    y.set(0);
    toast.success('🔄 Fresh cards loaded!');
  };

  // Filter by cuisine
  const handleCuisineFilter = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    setCurrentIndex(0);
    setIsFlipped(false);
    fetchSwipeCards();
  };

  // Load cards on mount and when filters change
  useEffect(() => {
    fetchSwipeCards();
  }, [selectedCuisine, userLocation]);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex >= cards.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading delicious cards...</span>
      </div>
    );
  }

  if (isLastCard) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">All Done!</h2>
        <p className="text-muted-foreground mb-6">
          You've seen all available cards. Check your saved items or discover more!
        </p>
        <div className="space-y-3">
          <Button onClick={handleReset} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Discover More
          </Button>
          <Button variant="outline" className="w-full">
            View Saved Items ({swipeHistory.filter(s => s.direction === 'right' || s.direction === 'down').length})
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Discover</h2>
          <Badge variant="secondary">{currentIndex + 1} / {cards.length}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedCuisine}
            onChange={(e) => handleCuisineFilter(e.target.value)}
            className="px-3 py-1 rounded-full bg-background border text-sm"
          >
            <option value="all">All Cuisines</option>
            <option value="Italian">Italian</option>
            <option value="Japanese">Japanese</option>
            <option value="Chinese">Chinese</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
            <option value="Thai">Thai</option>
            <option value="French">French</option>
            <option value="American">American</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Swipe Card Stack */}
      <div ref={constraintsRef} className="relative h-[500px] flex items-center justify-center">
        {/* Background cards */}
        {cards.slice(currentIndex + 1, currentIndex + 3).map((card, index) => (
          <Card
            key={card.id}
            className="absolute w-full max-w-sm h-[400px] opacity-50 scale-95"
            style={{
              zIndex: 10 - index,
              transform: `translateY(${index * 10}px) rotate(${index * 2}deg)`,
            }}
          >
            <div className="w-full h-full bg-muted rounded-lg" />
          </Card>
        ))}

        {/* Current card */}
        {currentCard && (
          <motion.div
            className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
            style={{ x, y, rotate, scale, zIndex: 20 }}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="w-full h-[400px] overflow-hidden">
              {/* Front of card */}
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Card front */}
                <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
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
                        {currentCard.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{currentCard.rating}</span>
                          </div>
                        )}
                        {currentCard.priceRange && (
                          <span className="text-sm">{currentCard.priceRange}</span>
                        )}
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
                        onClick={() => handleButtonSwipe('left')}
                        className="w-12 h-12 rounded-full border-2 border-red-300 hover:border-red-500 hover:bg-red-50"
                      >
                        <X className="w-6 h-6 text-red-500" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleButtonSwipe('down')}
                        className="w-12 h-12 rounded-full border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                      >
                        <ArrowDown className="w-6 h-6 text-blue-500" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleButtonSwipe('up')}
                        className="w-12 h-12 rounded-full border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
                      >
                        <ArrowUp className="w-6 h-6 text-orange-500" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleButtonSwipe('right')}
                        className="w-12 h-12 rounded-full border-2 border-green-300 hover:border-green-500 hover:bg-green-50"
                      >
                        <Heart className="w-6 h-6 text-green-500" />
                      </Button>
                    </div>
                  </CardContent>
                </div>

                {/* Card back (flipped) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-background p-4" 
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Details</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFlipped(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Nutritional info */}
                    {currentCard.nutritionalInfo && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Nutritional Info</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Calories: {currentCard.nutritionalInfo.calories}</div>
                          <div>Protein: {currentCard.nutritionalInfo.protein}g</div>
                          <div>Carbs: {currentCard.nutritionalInfo.carbs}g</div>
                          <div>Fat: {currentCard.nutritionalInfo.fat}g</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Recipe */}
                    {currentCard.recipe && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Recipe</h4>
                        <div className="text-sm space-y-2">
                          <div>
                            <strong>Prep:</strong> {currentCard.recipe.prepTime}min | 
                            <strong>Cook:</strong> {currentCard.recipe.cookTime}min
                          </div>
                          <div>
                            <strong>Ingredients:</strong> {currentCard.recipe.ingredients.slice(0, 3).join(', ')}...
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Source */}
                    {currentCard.source && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Source</h4>
                        <div className="text-sm space-y-1">
                          {currentCard.source.restaurant && (
                            <div>Restaurant: {currentCard.source.restaurant}</div>
                          )}
                          {currentCard.source.chef && (
                            <div>Chef: {currentCard.source.chef}</div>
                          )}
                          {currentCard.source.website && (
                            <div>Website: {currentCard.source.website}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-1">
                        {currentCard.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Flip button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Swipe instructions */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Swipe right to save • Swipe left to skip • Swipe up for strong interest • Swipe down to save for later</p>
        <p>Tap the info button to see details</p>
      </div>
    </div>
  );
};

export default SwipeFeed; 