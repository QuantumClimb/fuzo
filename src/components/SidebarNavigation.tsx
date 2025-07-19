import React from 'react';
import { Home, MapPin, Camera, Search, User } from 'lucide-react';
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
    { id: 'radar', label: 'Radar', icon: MapPin, color: 'green' },
    { id: 'camera', label: 'Camera', icon: Camera, color: 'orange' },
    { id: 'quicksearch', label: 'Quick Search', icon: Search, color: 'purple' },
  ];

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="hidden lg:flex flex-col w-64 h-screen bg-background border-r border-border fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <img 
            src="/Fuzocube.png" 
            alt="FUZO Logo" 
            className="h-8 w-8"
          />
          <h1 className="text-xl font-bold text-foreground">FUZO</h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 p-4 space-y-2">
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            onClick={() => onTabChange(id)}
            className={`w-full justify-start h-12 px-4 ${
              activeTab === id 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon className="h-5 w-5 mr-3" />
            <span className="font-medium">{label}</span>
          </Button>
        ))}
      </div>

      {/* Profile Section */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleProfileClick}
          className="w-full justify-start h-12 px-4 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <User className="h-5 w-5 mr-3" />
          <span className="font-medium">Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation; 