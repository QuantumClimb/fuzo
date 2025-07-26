import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Star, MessageCircle, Heart, Settings, LogOut, MapPin, Calendar, User, ArrowLeft } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import SidebarNavigation from '@/components/SidebarNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RadarWithGoogleMaps from '@/components/RadarWithGoogleMaps';
import SEO from '@/components/SEO';

const GUEST_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face';
const GUEST_NAME = 'GUEST';
const GUEST_AGE = 33;
const GUEST_LOCATION = 'Toronto';
const GUEST_CUISINES = ['Steakhouse', 'Thai', 'Japanese', 'Canadian', 'Fine Dining'];

// Synthetic/mock images for demo (replace with real Supabase Storage fetch later)
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
];

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigateToChat = () => {
    navigate('/chat');
  };

  const handleNavigateToPlate = () => {
    navigate('/plate');
  };

  const handleNavigateToSettings = () => {
    // Navigate to settings page (to be implemented)
    console.log('Navigate to settings');
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleTabChange = (tab: string) => {
    // Navigate back to main app with the selected tab
    navigate('/', { state: { activeTab: tab } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <SEO 
        title="My Profile"
        description="Manage your FUZO profile, view your food posts, and connect with other food lovers. Share your culinary adventures and discover new dining experiences."
        keywords="user profile, food posts, culinary adventures, food sharing, user settings"
        type="profile"
        tags={['profile', 'user', 'food posts', 'settings']}
      />
      
      {/* Sidebar Navigation - Desktop */}
      <SidebarNavigation activeTab="profile" onTabChange={handleTabChange} />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto min-h-screen relative">
          {/* iOS Header */}
          <div className="ios-header sticky top-0 z-10 p-4 lg:max-w-4xl lg:mx-auto lg:w-full">
            <div className="flex items-center justify-start mb-4 lg:hidden">
              <img 
                src="/logo_trans.png" 
                alt="Logo" 
                className="h-6 w-18"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                            <Button variant="ghost" size="sm" onClick={handleBackToMain} className="text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-foreground">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="px-4 space-y-6 lg:max-w-4xl lg:mx-auto lg:w-full">
        {/* Profile Header */}
        <GlassCard className="ios-card">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="avatar-ios h-20 w-20">
                <AvatarImage src={GUEST_AVATAR} alt={GUEST_NAME} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {GUEST_NAME[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{GUEST_NAME}</h2>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{GUEST_AGE} years old</span>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{GUEST_LOCATION}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {GUEST_CUISINES.map((cuisine) => (
                    <Badge key={cuisine} variant="secondary" className="text-xs">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleNavigateToChat}
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center space-y-1 ios-card"
          >
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-foreground">Chat</span>
          </Button>
          
          <Button 
            onClick={handleNavigateToPlate}
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center space-y-1 ios-card"
          >
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-foreground">My Plate</span>
          </Button>
        </div>

        {/* Stats */}
        <GlassCard className="ios-card">
          <div className="pb-3">
            <h3 className="text-lg font-semibold text-foreground">Activity</h3>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">24</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">156</div>
                <div className="text-sm text-muted-foreground">Likes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-sm text-muted-foreground">Saved</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Content Tabs */}
        <div className="space-y-4">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'posts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('posts')}
              className="flex-1"
            >
              Posts
            </Button>
            <Button
              variant={activeTab === 'liked' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('liked')}
              className="flex-1"
            >
              Liked
            </Button>
            <Button
              variant={activeTab === 'saved' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('saved')}
              className="flex-1"
            >
              Saved
            </Button>
            <Button
              variant={activeTab === 'radar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('radar')}
              className="flex-1"
            >
              Radar
            </Button>
          </div>

          {/* Content Grid */}
          {activeTab === 'radar' ? (
            <div className="h-96">
              <RadarWithGoogleMaps />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {MOCK_IMAGES.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={`Post ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Section */}
        <GlassCard className="ios-card">
          <div className="pb-3">
            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
          </div>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground"
              onClick={handleNavigateToSettings}
            >
              <Settings className="h-4 w-4 mr-3" />
              Account Settings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground"
            >
              <Calendar className="h-4 w-4 mr-3" />
              Privacy Policy
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground"
            >
              <Star className="h-4 w-4 mr-3" />
              Terms of Service
            </Button>
          </div>
        </GlassCard>
          </div>
          
          <BottomNavigation activeTab="profile" onTabChange={handleTabChange} />
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:block min-h-screen">
          {/* iOS Header */}
          <div className="ios-header sticky top-0 z-10 p-4 lg:max-w-4xl lg:mx-auto lg:w-full">
            <div className="flex items-center justify-start mb-4 lg:hidden">
              <img 
                src="/logo_trans.png" 
                alt="Logo" 
                className="h-6 w-18"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                                          <Button variant="ghost" size="sm" onClick={handleBackToMain} className="text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex-1" />
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-foreground">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="px-4 space-y-6 lg:max-w-4xl lg:mx-auto lg:w-full">
            {/* Profile Header */}
            <GlassCard className="ios-card">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="avatar-ios h-20 w-20">
                    <AvatarImage src={GUEST_AVATAR} alt={GUEST_NAME} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {GUEST_NAME[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{GUEST_NAME}</h2>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{GUEST_AGE} years old</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{GUEST_LOCATION}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {GUEST_CUISINES.map((cuisine) => (
                        <Badge key={cuisine} variant="secondary" className="text-xs">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleNavigateToChat}
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center space-y-1 ios-card"
              >
                <MessageCircle className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-foreground">Chat</span>
              </Button>
              
              <Button 
                onClick={handleNavigateToPlate}
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center space-y-1 ios-card"
              >
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-foreground">My Plate</span>
              </Button>
            </div>

            {/* Stats */}
            <GlassCard className="ios-card">
              <div className="pb-3">
                <h3 className="text-lg font-semibold text-foreground">Activity</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">24</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">156</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">12</div>
                  <div className="text-sm text-muted-foreground">Saved</div>
                </div>
              </div>
            </GlassCard>

            {/* Content Tabs */}
            <div className="space-y-4">
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={activeTab === 'posts' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('posts')}
                  className="flex-1"
                >
                  Posts
                </Button>
                <Button
                  variant={activeTab === 'liked' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('liked')}
                  className="flex-1"
                >
                  Liked
                </Button>
                <Button
                  variant={activeTab === 'saved' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('saved')}
                  className="flex-1"
                >
                  Saved
                </Button>
                <Button
                  variant={activeTab === 'radar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('radar')}
                  className="flex-1"
                >
                  Radar
                </Button>
              </div>

              {/* Content Grid */}
              {activeTab === 'radar' ? (
                <div className="h-96">
                  <RadarWithGoogleMaps />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {MOCK_IMAGES.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`Post ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Section */}
            <GlassCard className="ios-card">
              <div className="pb-3">
                <h3 className="text-lg font-semibold text-foreground">Settings</h3>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-foreground"
                  onClick={handleNavigateToSettings}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Account Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-foreground"
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  Privacy Policy
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-foreground"
                >
                  <Star className="h-4 w-4 mr-3" />
                  Terms of Service
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 