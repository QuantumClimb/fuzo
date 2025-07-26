import React from 'react';
import { Home, MapPin, Camera, Search, User, Heart, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  
  const tabs: TabItem[] = [
    { id: 'feed', label: 'Feed', icon: Home, color: 'blue' },
    { id: 'quicksearch', label: 'Search', icon: Search, color: 'red' },
    { id: 'camera', label: 'Camera', icon: Camera, color: 'orange' },
    { id: 'video', label: 'Video', icon: Play, color: 'purple' },
    { id: 'profile', label: 'Profile', icon: User, color: 'gray' },
  ];



  return (
    <div className="hidden lg:flex flex-col w-64 h-screen bg-white/10 backdrop-blur-xl border-r border-white/20 fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/20 bg-gradient-to-r from-iosAccent/10 to-iosAccent/5">
        <div className="flex items-center justify-center">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
            className="h-8 w-24"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 p-4 space-y-2">
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            onClick={() => onTabChange(id)}
            className={`w-full justify-start h-12 px-4 rounded-xl transition-all duration-300 transform ${
              activeTab === id 
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-105' 
                : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-muted hover:to-muted/80 hover:scale-102'
            }`}
          >
            <Icon className="h-5 w-5 mr-3" />
            <span className="font-medium">{label}</span>
          </Button>
        ))}
      </div>


    </div>
  );
};

export default SidebarNavigation; 