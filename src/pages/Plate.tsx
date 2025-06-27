
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { MapPin } from 'lucide-react';
import { FoodItem } from '@/types';
import { foodItems, currentUser } from '@/data/mockData';
import FoodDetailsDialog from '@/components/FoodDetailsDialog';

const Plate = () => {
  const [savedItems, setSavedItems] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  useEffect(() => {
    // Get saved items from mock data
    const saved = foodItems.filter(item => 
      currentUser.savedItems.includes(item.id)
    );
    setSavedItems(saved);
  }, []);

  const handleViewDetails = (food: FoodItem) => {
    setSelectedFood(food);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  return (
    <div>
      <Header title="My Plate" showSearchButton />
      
      <div className="fuzo-page">
        <div className="fuzo-container">
          <h2 className="text-xl font-semibold mb-4">Saved Items</h2>
          
          {savedItems.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-1">Your plate is empty</h3>
              <p className="text-gray-500">Swipe right on food you like to save it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedItems.map(item => (
                <div key={item.id} className="fuzo-card">
                  <div className="flex">
                    <div className="w-1/3">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-32 object-cover" 
                      />
                    </div>
                    <div className="w-2/3 p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{item.title}</h3>
                        <span className="fuzo-tag text-xs">{item.tag}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin size={14} className="mr-1" />
                        <span>{item.location}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Shared by {item.username}
                      </p>
                      <div className="flex mt-2">
                        <button 
                          className="bg-fuzo-purple text-white text-xs rounded-full px-3 py-1"
                          onClick={() => handleViewDetails(item)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FoodDetailsDialog
        food={selectedFood}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        isSaved={true}
      />
    </div>
  );
};

export default Plate;
