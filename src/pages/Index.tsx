
import React, { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import Feed from '@/components/Feed';
import RadarWithGoogleMaps from '@/components/RadarWithGoogleMaps';
import Camera from '@/components/Camera';
import QuickSearch from '@/components/QuickSearch';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'radar' | 'camera' | 'quicksearch'>('feed');
  const [loading, setLoading] = useState(false); // Add loading state

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

  return (
    <div className="min-h-screen">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center candy-header" style={{ fontFamily: 'var(--font-headline)' }}>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-6"></div>
          <span className="text-white text-2xl font-headline">Loading...</span>
        </div>
      )}
      <div className="max-w-md mx-auto min-h-screen relative">
        {renderActiveComponent()}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default Index;
