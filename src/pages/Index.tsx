import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import FoodFeed from '@/pages/FoodFeed';
import SwipeFeed from '@/pages/SwipeFeed';
import Plate from '@/pages/Plate';
import MapExplorer from '@/pages/MapExplorer';
import MapTest from '@/pages/MapTest';
import ChatList from '@/pages/ChatList';
import ChatConversation from '@/pages/ChatConversation';
import Profile from '@/pages/Profile';
import SearchFilter from '@/pages/SearchFilter';
import AddPost from '@/pages/AddPost';
import Onboarding from '@/pages/Onboarding';
import AIAssistant from '@/pages/AIAssistant';
import NavBar from '@/components/NavBar';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if onboarding is completed
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    const userProfile = localStorage.getItem('userProfile');
    
    if (!onboardingComplete || !userProfile) {
      if (!location.pathname.includes('/onboarding')) {
        navigate('/onboarding/splash');
      }
    }
  }, [navigate, location.pathname]);
  
  // Paths that should not display the navbar
  const noNavbarPaths = ['/onboarding/', '/chat/', '/assistant', '/settings'];
  
  const shouldShowNavbar = () => {
    return !noNavbarPaths.some(path => location.pathname.includes(path));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<FoodFeed />} />
        <Route path="/feed" element={<SwipeFeed />} />
        <Route path="/map" element={<MapExplorer />} />
        <Route path="/map-test" element={<MapTest />} />
        <Route path="/plate" element={<Plate />} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:id" element={<ChatConversation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchFilter />} />
        <Route path="/post" element={<AddPost />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/assistant" element={<AIAssistant />} />
      </Routes>
      
      {shouldShowNavbar() && <NavBar />}
    </div>
  );
};

export default Index;
