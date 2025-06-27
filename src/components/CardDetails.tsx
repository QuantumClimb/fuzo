
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Star, Phone, Globe, ExternalLink, Car } from 'lucide-react';
import { useState } from 'react';
import CommentModal from '@/components/CommentModal';
import usersData from '@/data/users.json';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  coordinates: { lat: number; lng: number };
  address: string;
  hours: string;
  image: string;
  description: string;
  visitCount: number;
  phoneNumber?: string;
  website?: string;
  features?: string[];
  reviewCount?: number;
  travelTimeMin?: number;
  reviews?: {
    userId: string;
    rating: number;
    text: string;
    date: string;
  }[];
  visitedByFriends?: string[];
}

interface CardDetailsProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

const CardDetails = ({ restaurant, isOpen, onClose }: CardDetailsProps) => {
  const [showComments, setShowComments] = useState(false);
  const users = usersData;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} size={16} className="text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && (
          <Star size={16} className="text-yellow-400 fill-current opacity-50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} size={16} className="text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  const getVisitedFriends = () => {
    if (!restaurant.visitedByFriends) return [];
    return restaurant.visitedByFriends
      .map(userId => users.find(user => user.id === userId))
      .filter(Boolean)
      .slice(0, 3);
  };

  const getReviewsWithUserInfo = () => {
    if (!restaurant.reviews) return [];
    return restaurant.reviews.map(review => {
      const user = users.find(u => u.id === review.userId);
      return {
        ...review,
        userName: user?.name || 'Anonymous',
        userAvatar: user?.avatar || `https://ui-avatars.com/api/?name=Anonymous&background=random`
      };
    });
  };

  const visitedFriends = getVisitedFriends();
  const reviewsWithUserInfo = getReviewsWithUserInfo();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-fuzo-yellow text-fuzo-dark">
                {restaurant.cuisine}
              </Badge>
            </div>
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-xl">{restaurant.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Rating and Price */}
            <div className="flex items-center justify-between">
              {renderStars(restaurant.rating)}
              <span className="text-lg font-semibold text-fuzo-purple">{restaurant.priceRange}</span>
            </div>
            
            <p className="text-gray-600">{restaurant.description}</p>
            
            {/* Travel Time */}
            {restaurant.travelTimeMin && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <Car size={16} className="mr-2" />
                  <span className="font-medium">🚗 Estimated travel time: {restaurant.travelTimeMin} mins</span>
                </div>
              </div>
            )}
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2 text-fuzo-coral" />
                <span className="text-sm">{restaurant.address}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock size={16} className="mr-2 text-fuzo-purple" />
                <span className="text-sm">{restaurant.hours}</span>
              </div>
              
              {restaurant.phoneNumber && (
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2 text-fuzo-coral" />
                  <span className="text-sm">{restaurant.phoneNumber}</span>
                </div>
              )}
              
              {restaurant.website && (
                <div className="flex items-center text-gray-600">
                  <Globe size={16} className="mr-2 text-fuzo-purple" />
                  <span className="text-sm">{restaurant.website}</span>
                </div>
              )}
            </div>
            
            {/* Features */}
            {restaurant.features && restaurant.features.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {restaurant.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Visited by Friends */}
            {visitedFriends.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Visited by {visitedFriends.length} of your friends
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {visitedFriends.map((friend, index) => (
                    <img
                      key={index}
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-6 h-6 rounded-full border border-white"
                      title={friend.name}
                    />
                  ))}
                  <span className="text-xs text-blue-600">
                    {visitedFriends.map(f => f.name).join(', ')}
                  </span>
                </div>
              </div>
            )}
            
            {/* Visit Count and Review Count */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                <span>{restaurant.visitCount} people have been here</span>
              </div>
              {restaurant.reviewCount && (
                <div className="flex items-center">
                  <Star size={14} className="mr-1" />
                  <span>{restaurant.reviewCount} reviews</span>
                </div>
              )}
            </div>
            
            {/* Reviews */}
            {reviewsWithUserInfo.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recent Reviews</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {reviewsWithUserInfo.map((review, index) => (
                    <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium">{review.userName}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 pt-4">
              <Button className="flex-1 bg-fuzo-coral hover:bg-fuzo-coral/90">
                Get Directions
              </Button>
              <Button variant="outline" className="flex-1">
                <ExternalLink size={16} className="mr-1" />
                Call
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowComments(true)}
              >
                Add Review
              </Button>
              <Button variant="outline" className="flex-1">
                Save Place
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        foodTitle={restaurant.name}
        comments={[]}
        onAddComment={(text) => console.log('Review added:', text)}
      />
    </>
  );
};

export default CardDetails;
