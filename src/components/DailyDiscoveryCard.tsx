
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, MapPin } from 'lucide-react';
import { behavioralEngine } from '@/utils/behavioralEngine';

interface DailyRecommendation {
  id: string;
  type: 'food' | 'eatery';
  title: string;
  subtitle: string;
  image: string;
  reason: string;
  relevanceScore: number;
  location?: string;
}

const DailyDiscoveryCard = () => {
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [showReason, setShowReason] = useState(false);

  useEffect(() => {
    generateDailyRecommendation();
  }, []);

  const generateDailyRecommendation = () => {
    const profile = behavioralEngine.getLearningProfile();
    const preferences = behavioralEngine.getUserPreferences();
    
    // Get top cuisine preference
    const topCuisine = Object.entries(profile.cuisineAffinities)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Italian';
    
    // Get current time preference
    const currentTime = getCurrentTimeCategory();
    
    // Generate synthetic recommendation
    const recommendations: DailyRecommendation[] = [
      {
        id: '1',
        type: 'food',
        title: `Spicy ${topCuisine} Bowl`,
        subtitle: 'Perfect for your taste profile',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        reason: `Because you loved ${topCuisine} dishes this week and enjoy ${currentTime} discoveries`,
        relevanceScore: 95,
        location: 'Fusion Kitchen Downtown'
      },
      {
        id: '2',
        type: 'eatery',
        title: 'Hidden Gem Cafe',
        subtitle: 'New spot matching your preferences',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
        reason: `Based on your frequent saves of cozy cafes and ${topCuisine} preferences`,
        relevanceScore: 88,
        location: '2.1 km from your usual route'
      },
      {
        id: '3',
        type: 'food',
        title: 'Artisan Dessert Collection',
        subtitle: 'Sweet discovery for you',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
        reason: `Your recent late-night swipes suggest you love trying new desserts`,
        relevanceScore: 82,
        location: 'Sweet Dreams Bakery'
      }
    ];
    
    // Select highest scoring recommendation
    const selected = recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
    setRecommendation(selected);
  };

  const getCurrentTimeCategory = (): string => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'dinner';
    return 'late-night';
  };

  const handleAcceptRecommendation = () => {
    if (recommendation) {
      // Record positive interaction
      behavioralEngine.recordSwipe('right', recommendation.id, recommendation.type, recommendation.title);
    }
  };

  if (!recommendation) return null;

  return (
    <Card className="bg-gradient-to-r from-fuzo-purple/10 to-fuzo-coral/10 border-fuzo-purple/20 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <Sparkles size={20} className="text-fuzo-coral mr-2" />
          <h3 className="font-semibold text-fuzo-dark">Today's Smart Discovery</h3>
          <Badge variant="secondary" className="ml-auto bg-fuzo-yellow/20 text-fuzo-dark">
            {recommendation.relevanceScore}% match
          </Badge>
        </div>
        
        <div className="flex space-x-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden">
            <img 
              src={recommendation.image} 
              alt={recommendation.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-fuzo-dark">{recommendation.title}</h4>
            <p className="text-sm text-gray-600 mb-1">{recommendation.subtitle}</p>
            
            {recommendation.location && (
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <MapPin size={12} className="mr-1" />
                {recommendation.location}
              </div>
            )}
            
            <button
              onClick={() => setShowReason(!showReason)}
              className="text-xs text-fuzo-purple underline"
            >
              Why this suggestion?
            </button>
            
            {showReason && (
              <p className="text-xs text-gray-600 mt-1 italic">
                {recommendation.reason}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2 mt-3">
          <Button 
            size="sm" 
            className="flex-1 bg-fuzo-coral hover:bg-fuzo-coral/90"
            onClick={handleAcceptRecommendation}
          >
            <Star size={14} className="mr-1" />
            Try This
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={generateDailyRecommendation}
          >
            Show Different
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyDiscoveryCard;
