
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import SidebarNavigation from '@/components/SidebarNavigation';
import Feed from '@/components/Feed';
import RadarWithGoogleMaps from '@/components/RadarWithGoogleMaps';
import Camera from '@/components/Camera';
import QuickSearch from '@/components/QuickSearch';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'radar' | 'camera' | 'quicksearch'>('feed');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation state from profile page
  useEffect(() => {
    if (location.state?.activeTab) {
      const tab = location.state.activeTab as 'feed' | 'radar' | 'camera' | 'quicksearch';
      setActiveTab(tab);
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'radar':
        return <RadarWithGoogleMaps />;
      case 'camera':
        return <Camera />;
      case 'quicksearch':
        return <QuickSearch />;
      default:
        return <Feed />;
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'feed' | 'radar' | 'camera' | 'quicksearch');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <SEO 
        title="Discover Amazing Food"
        description="Explore the best restaurants, discover hidden gems, and share your culinary adventures with FUZO. Find local favorites, capture food photos, and connect with food lovers worldwide."
        keywords="food discovery, restaurant finder, local restaurants, food photos, dining experiences, culinary adventures"
        tags={['food', 'restaurants', 'dining', 'discovery']}
      />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center ios-header">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div>
          <span className="text-foreground text-2xl">Loading...</span>
        </div>
      )}
      
      {/* Sidebar Navigation - Desktop */}
      <SidebarNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto min-h-screen relative">
          {/* Profile Button - Fixed at top right (Mobile) */}
          <div className="fixed top-4 right-4 z-40">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
              className="glass-effect hover:shadow-glow shadow-lg rounded-full w-10 h-10 p-0 transition-all duration-300 transform hover:scale-110"
            >
              <User className="h-5 w-5 text-foreground" />
            </Button>
          </div>
          
          {renderActiveComponent()}
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:block min-h-screen">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
