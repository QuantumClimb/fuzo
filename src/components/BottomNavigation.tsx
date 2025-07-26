
import React from 'react';
import { Home, MapPin, Camera, Search, Heart, Play, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: TabItem[] = [
    { id: 'feed', label: 'Feed', icon: Home, color: 'blue' },
    { id: 'quicksearch', label: 'Search', icon: Search, color: 'red' },
    { id: 'camera', label: 'Camera', icon: Camera, color: 'orange' },
    { id: 'video', label: 'Video', icon: Play, color: 'purple' },
    { id: 'profile', label: 'Profile', icon: User, color: 'gray' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 ios-bottom-nav z-50 bg-white/10 backdrop-blur-md border-t border-white/10">
      <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <div key={id} className="flex flex-col items-center">
            <Button
              variant={activeTab === id ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(id)}
              className={`h-10 w-10 rounded-full ${
                activeTab === id 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
            </Button>
            <span className={`text-xs font-medium mt-1 ${
              activeTab === id ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
