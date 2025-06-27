import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Send, Sparkles, MapPin, Navigation, Clock } from 'lucide-react';
import { getCurrentLocation, findNearbyRestaurants, formatDistance, LocationCoordinates } from '@/utils/geolocation';
import restaurantsData from '@/data/restaurants.json';
import { Restaurant } from '@/types';

// Typing animation for the chatbot
const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-3">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
    <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
  </div>
);

// Message types
type MessageType = 'text' | 'recommendation' | 'location';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  type: MessageType;
  recommendations?: Array<{id: string, name: string, image: string, distance?: string}>;
  location?: {
    name: string;
    address: string;
    distance: string;
    coordinates?: LocationCoordinates;
  };
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI food assistant. I can help you discover amazing restaurants nearby, plan food routes, and answer any food-related questions. What are you craving today?",
      sender: 'assistant',
      timestamp: 'now',
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const restaurants = restaurantsData as Restaurant[];

  // Get user location on component mount
  useEffect(() => {
    getCurrentLocation().then(result => {
      if (!result.error) {
        setUserLocation(result.coordinates);
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Location-based queries
    if ((lowerMessage.includes('near') || lowerMessage.includes('nearby') || lowerMessage.includes('close')) && userLocation) {
      const nearbyRestaurants = findNearbyRestaurants(userLocation, restaurants, 5);
      const topRestaurants = nearbyRestaurants.slice(0, 3);
      
      return {
        id: Date.now().toString(),
        content: `I found ${nearbyRestaurants.length} restaurants near you! Here are the top-rated ones:`,
        sender: 'assistant',
        timestamp: 'now',
        type: 'recommendation',
        recommendations: topRestaurants.map(r => ({
          id: r.id,
          name: r.name,
          image: r.image,
          distance: formatDistance(r.distance)
        }))
      };
    }

    // Cuisine-specific queries
    const cuisineKeywords = ['italian', 'japanese', 'sushi', 'pizza', 'thai', 'mexican', 'indian', 'french', 'american', 'burger'];
    const mentionedCuisine = cuisineKeywords.find(cuisine => lowerMessage.includes(cuisine));
    
    if (mentionedCuisine) {
      let cuisineType = mentionedCuisine.charAt(0).toUpperCase() + mentionedCuisine.slice(1);
      if (mentionedCuisine === 'sushi') cuisineType = 'Japanese';
      if (mentionedCuisine === 'pizza') cuisineType = 'Italian';
      if (mentionedCuisine === 'burger') cuisineType = 'American';
      
      const cuisineRestaurants = restaurants.filter(r => 
        r.cuisine.toLowerCase() === cuisineType.toLowerCase()
      );
      
      if (userLocation) {
        const nearbyWithDistance = findNearbyRestaurants(userLocation, cuisineRestaurants, 10);
        const topRestaurants = nearbyWithDistance.slice(0, 3);
        
        return {
          id: Date.now().toString(),
          content: `Great choice! I found some excellent ${cuisineType} restaurants for you:`,
          sender: 'assistant',
          timestamp: 'now',
          type: 'recommendation',
          recommendations: topRestaurants.map(r => ({
            id: r.id,
            name: r.name,
            image: r.image,
            distance: formatDistance(r.distance)
          }))
        };
      } else {
        const topRestaurants = cuisineRestaurants.slice(0, 3);
        return {
          id: Date.now().toString(),
          content: `Great choice! Here are some excellent ${cuisineType} restaurants:`,
          sender: 'assistant',
          timestamp: 'now',
          type: 'recommendation',
          recommendations: topRestaurants.map(r => ({
            id: r.id,
            name: r.name,
            image: r.image
          }))
        };
      }
    }

    // Rating-based queries
    if (lowerMessage.includes('best') || lowerMessage.includes('top rated') || lowerMessage.includes('highest rated')) {
      const topRated = restaurants
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
      
      return {
        id: Date.now().toString(),
        content: "Here are the highest-rated restaurants in our database:",
        sender: 'assistant',
        timestamp: 'now',
        type: 'recommendation',
        recommendations: topRated.map(r => ({
          id: r.id,
          name: r.name,
          image: r.image
        }))
      };
    }

    // Specific restaurant queries
    const mentionedRestaurant = restaurants.find(r => 
      lowerMessage.includes(r.name.toLowerCase())
    );
    
    if (mentionedRestaurant) {
      let distance = '';
      if (userLocation) {
        const restaurantDistance = Math.sqrt(
          Math.pow(userLocation.lat - mentionedRestaurant.coordinates.lat, 2) +
          Math.pow(userLocation.lng - mentionedRestaurant.coordinates.lng, 2)
        ) * 111; // Rough conversion to km
        distance = formatDistance(restaurantDistance);
      }
      
      return {
        id: Date.now().toString(),
        content: `${mentionedRestaurant.name} is a fantastic choice! Here are the details:`,
        sender: 'assistant',
        timestamp: 'now',
        type: 'location',
        location: {
          name: mentionedRestaurant.name,
          address: mentionedRestaurant.address,
          distance: distance || 'Location needed',
          coordinates: mentionedRestaurant.coordinates
        }
      };
    }

    // Default responses
    const defaultResponses = [
      "I'd be happy to help you find great food! Try asking me about restaurants near you, or mention a specific cuisine you're craving.",
      "What type of food are you in the mood for? I can recommend Italian, Japanese, Thai, Mexican, and many other cuisines!",
      "I can help you find the best restaurants nearby. Just tell me what you're looking for!",
      "Looking for something specific? I can help you find restaurants by cuisine, rating, or location."
    ];
    
    return {
      id: Date.now().toString(),
      content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      sender: 'assistant',
      timestamp: 'now',
      type: 'text'
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: 'now',
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleGetDirections = (location: LocationCoordinates) => {
    if (userLocation) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${location.lat},${location.lng}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header title="AI Food Assistant" showBackButton />
      
      <div className="flex-1 overflow-hidden pt-16">
        <div className="h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.sender === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-fuzo-purple text-white flex items-center justify-center mr-2 mb-1">
                      <Sparkles size={16} />
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                    message.sender === 'user' 
                      ? 'bg-fuzo-coral text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {message.type === 'recommendation' && message.recommendations && (
                      <div className="mt-3 space-y-2">
                        {message.recommendations.map((rec) => (
                          <div key={rec.id} className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2">
                            <img src={rec.image} alt={rec.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{rec.name}</p>
                              {rec.distance && (
                                <p className="text-xs text-fuzo-coral">{rec.distance} away</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.type === 'location' && message.location && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start">
                          <MapPin className="text-fuzo-coral mt-1 mr-2" size={16} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{message.location.name}</p>
                            <p className="text-xs text-gray-600">{message.location.address}</p>
                            <p className="text-xs text-fuzo-coral mt-1">{message.location.distance}</p>
                          </div>
                        </div>
                        {message.location.coordinates && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 text-xs w-full flex items-center justify-center space-x-1"
                            onClick={() => handleGetDirections(message.location!.coordinates!)}
                          >
                            <Navigation size={12} />
                            <span>Get Directions</span>
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs mt-1 text-right opacity-70">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="h-8 w-8 rounded-full bg-fuzo-purple text-white flex items-center justify-center mr-2 mt-1">
                  <Sparkles size={16} />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-none shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about restaurants, cuisines, or food recommendations..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-fuzo-coral hover:bg-fuzo-coral/90"
              >
                <Send size={16} />
              </Button>
            </div>
            
            {!userLocation && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 flex items-center">
                  <MapPin size={12} className="mr-1" />
                  Enable location access for personalized nearby recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
