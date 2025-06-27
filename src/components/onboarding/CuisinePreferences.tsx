
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Check } from 'lucide-react';

const CuisinePreferences = () => {
  const navigate = useNavigate();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [radius, setRadius] = useState([25]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cuisines = [
    'North Indian', 'Thai', 'Japanese', 'Italian', 'Chinese',
    'Korean', 'Mexican', 'Mediterranean', 'Vietnamese', 'Malaysian'
  ];

  const dietOptions = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Late Night'];

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    
    // Update stored profile
    const existingProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const updatedProfile = {
      ...existingProfile,
      cuisinePreferences: selectedCuisines,
      diet: selectedDiet,
      mealTypes: selectedMealTypes,
      radius: radius[0]
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    localStorage.setItem('onboardingComplete', 'true');
    
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-6 py-8">
        <button 
          onClick={() => navigate('/onboarding/register')}
          className="mb-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Preferences</h1>
            <p className="text-gray-600">Help us personalize your experience</p>
          </div>

          <div className="space-y-8">
            {/* Cuisine Types */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Favorite Cuisines</h3>
              <div className="grid grid-cols-2 gap-3">
                {cuisines.map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => toggleSelection(cuisine, selectedCuisines, setSelectedCuisines)}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedCuisines.includes(cuisine)
                        ? 'bg-fuzo-coral text-white border-fuzo-coral'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-fuzo-coral'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Diet Preference</h3>
              <div className="grid grid-cols-2 gap-3">
                {dietOptions.map(diet => (
                  <button
                    key={diet}
                    onClick={() => setSelectedDiet(diet === selectedDiet ? '' : diet)}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedDiet === diet
                        ? 'bg-fuzo-purple text-white border-fuzo-purple'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-fuzo-purple'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Types */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Favorite Meal Times</h3>
              <div className="grid grid-cols-3 gap-3">
                {mealTypes.map(meal => (
                  <button
                    key={meal}
                    onClick={() => toggleSelection(meal, selectedMealTypes, setSelectedMealTypes)}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedMealTypes.includes(meal)
                        ? 'bg-fuzo-yellow text-gray-900 border-fuzo-yellow'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-fuzo-yellow'
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Radius */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Search Radius: {radius[0]} km</h3>
              <Slider
                value={radius}
                onValueChange={setRadius}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-3">
              <button
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  acceptedTerms
                    ? 'bg-fuzo-coral border-fuzo-coral'
                    : 'border-gray-300 hover:border-fuzo-coral'
                }`}
              >
                {acceptedTerms && <Check size={14} className="text-white" />}
              </button>
              <p className="text-sm text-gray-600 leading-relaxed">
                I accept the <span className="text-fuzo-coral">Terms of Service</span> and <span className="text-fuzo-coral">Privacy Policy</span>
              </p>
            </div>
          </div>

          <Button 
            onClick={handleFinish}
            disabled={!acceptedTerms || isLoading}
            className="w-full h-12 bg-fuzo-coral hover:bg-fuzo-coral/90 rounded-xl text-lg font-semibold mt-8"
          >
            {isLoading ? 'Setting up...' : 'Get Started'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CuisinePreferences;
