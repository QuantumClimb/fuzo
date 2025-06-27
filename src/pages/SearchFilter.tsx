
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Slider } from '@/components/ui/slider';
import { CheckIcon, XIcon, Sparkles, Search, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LanguageSelector from '@/components/LanguageSelector';

const SearchFilter = () => {
  const navigate = useNavigate();
  const [distance, setDistance] = useState([5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isAISearchActive, setIsAISearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  const tags = [
    'Must Try', 'Hidden Gem', 'Street Food', 'Brunch Fav', 
    'Date Night', 'Comfort Food', 'Healthy', 'Sweet Tooth'
  ];
  
  const times = [
    'Breakfast', 'Lunch', 'Dinner', 'Late Night', 'Any Time'
  ];
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSearch = () => {
    if (isAISearchActive) {
      setIsSearching(true);
      // Simulate AI search processing
      setTimeout(() => {
        setIsSearching(false);
        toast({
          title: "AI Search Results",
          description: `Found matches for "${query}" within ${distance[0]} miles`,
        });
        navigate('/');
      }, 1500);
    } else {
      // Regular search
      handleApplyFilters();
    }
  };

  const handleApplyFilters = () => {
    // In a real app, we would pass these filters to a search results page
    navigate('/');
  };

  const toggleAISearch = () => {
    setIsAISearchActive(!isAISearchActive);
    if (!isAISearchActive) {
      toast({
        title: "AI Search Activated",
        description: "Try searching with natural language like 'spicy food near me'",
      });
    }
  };
  
  return (
    <div>
      <Header 
        title="Search & Filter" 
        showBackButton
      />
      
      <div className="fuzo-page">
        <div className="fuzo-container">
          <div className="mb-4 relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isAISearchActive ? 
                    "Try 'best spicy noodles near me'..." : 
                    "Search cuisines, restaurants, dishes..."}
                  className={`pr-10 ${isAISearchActive ? 'border-fuzo-coral' : ''}`}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <Button 
                variant={isAISearchActive ? "default" : "outline"} 
                size="icon" 
                onClick={toggleAISearch}
                className={isAISearchActive ? "bg-fuzo-coral hover:bg-fuzo-coral/90" : ""}
              >
                <Sparkles size={18} className={isAISearchActive ? "text-white" : "text-gray-500"} />
              </Button>
            </div>
            {isAISearchActive && (
              <p className="text-xs text-fuzo-coral mt-1 flex items-center">
                <Sparkles size={12} className="mr-1" /> 
                AI-powered semantic search enabled
              </p>
            )}
          </div>

          <div className="mb-4 flex justify-end">
            <LanguageSelector />
          </div>
          
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Filter by Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`py-2 px-4 rounded-full transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-fuzo-coral text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Distance</h3>
            <div className="px-2">
              <Slider
                defaultValue={[5]}
                max={20}
                step={1}
                onValueChange={setDistance}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Nearby</span>
                <span>{distance[0]} miles</span>
                <span>Far</span>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Time of Day</h3>
            <div className="grid grid-cols-3 gap-2">
              {times.map(time => (
                <button 
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 text-center rounded-lg transition-all ${
                    selectedTime === time
                      ? 'bg-fuzo-yellow text-fuzo-dark'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          
          <div className="fixed bottom-20 left-0 right-0 p-4 flex gap-3">
            <button 
              onClick={() => {
                setSelectedTags([]);
                setDistance([5]);
                setSelectedTime(null);
                setQuery('');
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 py-3 rounded-full"
            >
              <XIcon size={18} />
              <span>Clear All</span>
            </button>
            <button 
              onClick={handleSearch}
              className={`flex-1 flex items-center justify-center gap-2 fuzo-btn-primary py-3 rounded-full ${isSearching ? 'opacity-80' : ''}`}
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <CheckIcon size={18} />
              )}
              <span>{isSearching ? "Searching..." : "Search"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
