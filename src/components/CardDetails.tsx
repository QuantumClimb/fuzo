import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Clock, Users, Star, Phone, Globe, ExternalLink, Car, 
  Navigation, Camera, MessageCircle, Heart, Share2, Bookmark,
  DollarSign, Info, CalendarDays, StarIcon
} from 'lucide-react';
import CommentModal from '@/components/CommentModal';
import { useGoogleDirections } from '@/hooks/useGooglePlaces';
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
    author_name?: string;
    author_url?: string;
    profile_photo_url?: string;
    relative_time_description?: string;
  }[];
  visitedByFriends?: string[];
  googlePlaceId?: string;
  detailedPhotos?: string[];
  detailedReviews?: any[];
  businessStatus?: string;
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  openingHours?: google.maps.places.PlaceOpeningHours;
  geometry?: google.maps.places.PlaceGeometry;
  url?: string;
  price_level?: number;
  types?: string[];
}

interface CardDetailsProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

const CardDetails = ({ restaurant, isOpen, onClose }: CardDetailsProps) => {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDirections, setShowDirections] = useState(false);

  const { getDirections, directions, loading: directionsLoading } = useGoogleDirections();

  const allPhotos = [restaurant.image, ...(restaurant.detailedPhotos || [])].filter(Boolean);
  const users = usersData;

  const friendsWhoVisited = restaurant.visitedByFriends?.map(friendId => 
    users.find(user => user.id === friendId)
  ).filter(Boolean) || [];

  const openingHoursText = restaurant.openingHours?.weekday_text || [];
  const isOpenNow = restaurant.openingHours?.open_now;

  const handleGetDirections = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        getDirections(userLocation, restaurant.coordinates);
        setShowDirections(true);
      });
    }
  };

  const handleCall = () => {
    if (restaurant.phoneNumber || restaurant.internationalPhoneNumber) {
      window.open(`tel:${restaurant.phoneNumber || restaurant.internationalPhoneNumber}`);
    }
  };

  const handleWebsite = () => {
    if (restaurant.website) {
      window.open(restaurant.website, '_blank');
    }
  };

  const handleGoogleMaps = () => {
    if (restaurant.url) {
      window.open(restaurant.url, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`, '_blank');
    }
  };

  const formatTravelTime = (time: number) => {
    if (time < 60) return `${time} mins`;
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex flex-col h-full">
            {/* Header with Photos */}
            <div className="relative h-64 bg-gray-100">
              <img 
                src={allPhotos[currentPhotoIndex]} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              {allPhotos.length > 1 && (
                <>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {allPhotos.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    <Camera size={14} className="inline mr-1" />
                    {currentPhotoIndex + 1} / {allPhotos.length}
                  </div>
                </>
              )}
              <div className="absolute top-4 left-4 flex space-x-2">
                <Badge className={`${isOpenNow ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {isOpenNow ? 'Open Now' : 'Closed'}
                </Badge>
                {restaurant.businessStatus === 'OPERATIONAL' && (
                  <Badge className="bg-blue-500 text-white">Verified</Badge>
                )}
              </div>
            </div>

            {/* Restaurant Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{restaurant.name}</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">{restaurant.rating}</span>
                      <span className="text-gray-500 ml-1">({restaurant.reviewCount} reviews)</span>
                    </div>
                    <Badge variant="secondary">{restaurant.cuisine}</Badge>
                    <span className="text-sm text-gray-500">{restaurant.priceRange}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{restaurant.formattedAddress || restaurant.address}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={isLiked ? 'bg-red-50 border-red-200' : ''}
                  >
                    <Heart size={16} className={isLiked ? 'text-red-500 fill-current' : ''} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSaved(!isSaved)}
                    className={isSaved ? 'bg-blue-50 border-blue-200' : ''}
                  >
                    <Bookmark size={16} className={isSaved ? 'text-blue-500 fill-current' : ''} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-3 mt-4">
                <Button onClick={handleGetDirections} disabled={directionsLoading}>
                  <Navigation size={16} className="mr-2" />
                  {directionsLoading ? 'Getting Directions...' : 'Directions'}
                </Button>
                {(restaurant.phoneNumber || restaurant.internationalPhoneNumber) && (
                  <Button variant="outline" onClick={handleCall}>
                    <Phone size={16} className="mr-2" />
                    Call
                  </Button>
                )}
                {restaurant.website && (
                  <Button variant="outline" onClick={handleWebsite}>
                    <Globe size={16} className="mr-2" />
                    Website
                  </Button>
                )}
                <Button variant="outline" onClick={handleGoogleMaps}>
                  <ExternalLink size={16} className="mr-2" />
                  View on Maps
                </Button>
              </div>
            </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({restaurant.reviewCount})</TabsTrigger>
                  <TabsTrigger value="photos">Photos ({allPhotos.length})</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">About</h3>
                        <p className="text-gray-600 mb-4">{restaurant.description}</p>
                        
                        {restaurant.features && (
                          <div>
                            <h4 className="font-medium mb-2">Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {restaurant.features.map((feature, index) => (
                                <Badge key={index} variant="secondary">{feature}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Hours */}
                    {openingHoursText.length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">Hours</h3>
                          <div className="space-y-1">
                            {openingHoursText.map((dayHours, index) => (
                              <div key={index} className="text-sm text-gray-600">{dayHours}</div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Friends Activity */}
                    {friendsWhoVisited.length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">Friends who visited</h3>
                          <div className="flex space-x-2">
                            {friendsWhoVisited.slice(0, 5).map((friend, index) => (
                              <Avatar key={index} className="w-8 h-8">
                                <AvatarImage src={friend?.avatar} />
                                <AvatarFallback>{friend?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ))}
                            {friendsWhoVisited.length > 5 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                +{friendsWhoVisited.length - 5}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Directions */}
                    {directions && showDirections && (
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">Directions</h3>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Car size={14} className="mr-2" />
                              Distance: {directions.routes[0]?.legs[0]?.distance?.text}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock size={14} className="mr-2" />
                              Duration: {directions.routes[0]?.legs[0]?.duration?.text}
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`, '_blank')}
                            >
                              Open in Google Maps
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-4 space-y-4">
                    {restaurant.reviews && restaurant.reviews.length > 0 ? (
                      restaurant.reviews.map((review, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.profile_photo_url} />
                                <AvatarFallback>{review.author_name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium">{review.author_name || 'Anonymous'}</h4>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        size={14}
                                        className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                      />
                                    ))}
                                  </div>
                                  {review.relative_time_description && (
                                    <span className="text-xs text-gray-500">{review.relative_time_description}</span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">{review.text}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No reviews yet</p>
                        <Button onClick={() => setIsCommentModalOpen(true)} className="mt-2">
                          Write a Review
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="photos" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {allPhotos.map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setCurrentPhotoIndex(index)}
                        >
                          <img 
                            src={photo} 
                            alt={`${restaurant.name} photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="mt-4 space-y-4">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Address</span>
                          <span className="text-sm text-gray-600">{restaurant.formattedAddress || restaurant.address}</span>
                        </div>
                        <Separator />
                        
                        {(restaurant.phoneNumber || restaurant.internationalPhoneNumber) && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Phone</span>
                              <span className="text-sm text-gray-600">{restaurant.phoneNumber || restaurant.internationalPhoneNumber}</span>
                            </div>
                            <Separator />
                          </>
                        )}
                        
                        {restaurant.website && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Website</span>
                              <Button variant="link" className="p-0 h-auto text-sm" onClick={handleWebsite}>
                                Visit Website
                              </Button>
                            </div>
                            <Separator />
                          </>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Price Range</span>
                          <span className="text-sm text-gray-600">{restaurant.priceRange}</span>
                        </div>
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Rating</span>
                          <span className="text-sm text-gray-600">{restaurant.rating}/5 ({restaurant.reviewCount} reviews)</span>
                        </div>
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Cuisine</span>
                          <span className="text-sm text-gray-600">{restaurant.cuisine}</span>
                        </div>
                        
                        {restaurant.types && (
                          <>
                            <Separator />
                            <div className="flex items-start justify-between">
                              <span className="text-sm font-medium">Categories</span>
                              <div className="text-right">
                                {restaurant.types.slice(0, 3).map((type, index) => (
                                  <div key={index} className="text-sm text-gray-600 capitalize">
                                    {type.replace(/_/g, ' ')}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        foodTitle={restaurant.name}
        comments={[]}
        onAddComment={(text) => console.log('Review added:', text)}
      />
    </>
  );
};

export default CardDetails;
