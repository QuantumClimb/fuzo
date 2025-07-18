import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Star } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

const GUEST_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face';
const GUEST_NAME = 'GUEST';
const GUEST_AGE = 33;
const GUEST_LOCATION = 'Toronto';
const GUEST_CUISINES = ['Steakhouse', 'Thai', 'Japanese', 'Canadian', 'Fine Dining'];

// Synthetic/mock images for demo (replace with real Supabase Storage fetch later)
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1526178613658-3f1622045557?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
];

const Profile = () => {
  // In a real app, fetch from Supabase Storage:
  // const [images, setImages] = useState<string[]>([]);
  // useEffect(() => { ... fetch from supabase.storage.from('guestimages').list('guest/') ... }, []);
  // For now, use mock images:
  const [images] = useState<string[]>(MOCK_IMAGES);
  const navigate = useNavigate();
  // There is no 'profile' tab in BottomNavigation, so highlight none or default to 'feed'.
  const [activeTab, setActiveTab] = useState<'feed' | 'radar' | 'camera' | 'quicksearch'>('feed');

  const handleTabChange = (tab: 'feed' | 'radar' | 'camera' | 'quicksearch') => {
    setActiveTab(tab);
    switch (tab) {
      case 'feed':
        navigate('/');
        break;
      case 'radar':
        navigate('/'); // Index page, will switch to radar tab
        break;
      case 'camera':
        navigate('/'); // Index page, will switch to camera tab
        break;
      case 'quicksearch':
        navigate('/'); // Index page, will switch to quicksearch tab
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 font-body pb-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={GUEST_AVATAR}
            alt="Guest Avatar"
            className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
          />
          {/* Gold Star Badge */}
          <span className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg flex items-center justify-center">
            <Star className="h-5 w-5 text-white drop-shadow" fill="#FFD700" />
          </span>
        </div>
        <h2 className="text-2xl font-bold font-headline mt-3">{GUEST_NAME}</h2>
        <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
          <span>Age {GUEST_AGE}</span>
          <span className="mx-1">•</span>
          <span>Lives in {GUEST_LOCATION}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {GUEST_CUISINES.map((cuisine) => (
            <span key={cuisine} className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-xs border border-primary/20">
              {cuisine}
            </span>
          ))}
        </div>
        {/* Banner */}
        <div className="w-full bg-primary text-primary-foreground text-center py-2 px-4 font-body text-base my-4 rounded-lg shadow">
          This is your profile. View your uploaded photos and account info here.
        </div>
      </div>
      {/* Photo Grid */}
      <h3 className="text-lg font-semibold mb-3 font-headline">Photos</h3>
      {images.length === 0 ? (
        <div className="text-gray-500 text-center">No photos uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Guest photo ${idx + 1}`}
              className="w-full aspect-square object-cover rounded-lg shadow-sm hover:scale-105 transition-transform"
              loading="lazy"
            />
          ))}
        </div>
      )}
      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Profile; 