
import React from 'react';
import { Camera, MapPin, Home, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from './ui/button';

interface BottomNavigationProps {
  activeTab: 'feed' | 'radar' | 'camera' | 'quicksearch';
  onTabChange: (tab: 'feed' | 'radar' | 'camera' | 'quicksearch') => void;
}

interface TabItem {
  id: 'feed' | 'radar' | 'camera' | 'quicksearch';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'strawberry' | 'grape' | 'lemon' | 'blueberry';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: TabItem[] = [
    { id: 'feed', label: 'Feed', icon: Home, color: 'strawberry' },
    { id: 'radar', label: 'Radar', icon: MapPin, color: 'blueberry' },
    { id: 'camera', label: 'Camera', icon: Camera, color: 'lemon' },
    { id: 'quicksearch', label: 'Quick Search', icon: Search, color: 'grape' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 candy-bottom-nav z-50">
      <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <div key={id} className="flex flex-col items-center">
            <GameButton
              label=""
              icon={<Icon className="h-5 w-5" />}
              color={color}
              onClick={() => onTabChange(id)}
            />
            <span className="text-xs font-medium font-roundo text-white mt-1">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
