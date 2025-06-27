
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, User, MapPin, Camera, Bell, Moon, LogOut, Save } from 'lucide-react';
import { UserProfile } from '@/types/onboarding';

const SettingsPanel = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    location: '',
    profilePic: '/placeholder.svg',
    cuisinePreferences: [],
    diet: '',
    radius: 25,
    mealTypes: [],
    notifications: true,
    darkMode: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const cuisines = [
    'North Indian', 'Thai', 'Japanese', 'Italian', 'Chinese',
    'Korean', 'Mexican', 'Mediterranean', 'Vietnamese', 'Malaysian'
  ];

  const locations = [
    'Kuala Lumpur',
    'Singapore',
    'Bangkok',
    'Jakarta',
    'Manila',
    'Ho Chi Minh City'
  ];

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleCuisine = (cuisine: string) => {
    const current = profile.cuisinePreferences;
    if (current.includes(cuisine)) {
      updateProfile('cuisinePreferences', current.filter(c => c !== cuisine));
    } else {
      updateProfile('cuisinePreferences', [...current, cuisine]);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    setTimeout(() => {
      setIsLoading(false);
      navigate('/profile');
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('onboardingComplete');
    navigate('/onboarding/splash');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4 flex items-center">
          <button 
            onClick={() => navigate('/profile')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User size={20} className="mr-2 text-fuzo-coral" />
            Profile Information
          </h2>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <Camera size={24} className="text-gray-400" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-fuzo-coral rounded-full flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Full name"
              value={profile.name}
              onChange={(e) => updateProfile('name', e.target.value)}
              className="h-12 rounded-xl"
            />
            
            <Input
              placeholder="Email"
              value={profile.email}
              onChange={(e) => updateProfile('email', e.target.value)}
              className="h-12 rounded-xl"
            />

            <select
              value={profile.location}
              onChange={(e) => updateProfile('location', e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-fuzo-purple" />
            Food Preferences
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Favorite Cuisines</label>
              <div className="grid grid-cols-2 gap-2">
                {cuisines.slice(0, 6).map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => toggleCuisine(cuisine)}
                    className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                      profile.cuisinePreferences.includes(cuisine)
                        ? 'bg-fuzo-coral text-white border-fuzo-coral'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-fuzo-coral'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search Radius: {profile.radius} km
              </label>
              <Slider
                value={[profile.radius]}
                onValueChange={(value) => updateProfile('radius', value[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">App Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell size={20} className="mr-3 text-fuzo-yellow" />
                <span className="font-medium">Notifications</span>
              </div>
              <button
                onClick={() => updateProfile('notifications', !profile.notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  profile.notifications ? 'bg-fuzo-coral' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  profile.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Moon size={20} className="mr-3 text-fuzo-dark" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <button
                onClick={() => updateProfile('darkMode', !profile.darkMode)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  profile.darkMode ? 'bg-fuzo-dark' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  profile.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="w-full h-12 bg-fuzo-coral hover:bg-fuzo-coral/90 rounded-xl text-lg font-semibold flex items-center justify-center"
          >
            <Save size={20} className="mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 rounded-xl text-lg font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
          >
            <LogOut size={20} className="mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
