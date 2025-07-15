
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import Feed from '@/components/Feed';
import RadarWithGoogleMaps from '@/components/RadarWithGoogleMaps';
import Camera from '@/components/Camera';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      }
      setLoading(false);
    });
  }, [navigate]);
  if (loading) return <div>Loading...</div>;

  const [activeTab, setActiveTab] = useState<'feed' | 'radar' | 'camera'>('feed');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'radar':
        return <RadarWithGoogleMaps />;
      case 'camera':
        return <Camera />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {renderActiveComponent()}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default Index;
