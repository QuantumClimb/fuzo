
import React from 'react';
import { Camera, Flame, Heart, Star, Eye } from 'lucide-react';

interface FilterCircleProps {
  name: string;
  color: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
}

const FilterCircle: React.FC<FilterCircleProps> = ({ 
  name, 
  color, 
  icon, 
  isSelected, 
  onSelect 
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'camera':
        return <Camera size={18} className="text-white" />;
      case 'flame':
        return <Flame size={18} className="text-white" />;
      case 'heart':
        return <Heart size={18} className="text-white" />;
      case 'star':
        return <Star size={18} className="text-white" />;
      case 'eye':
        return <Eye size={18} className="text-white" />;
      default:
        return <Camera size={18} className="text-white" />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 min-w-[70px]">
      <button
        onClick={onSelect}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 ring-4 ring-white' : ''}`}
        style={{ backgroundColor: color }}
      >
        {getIcon()}
      </button>
      <span className="text-white text-xs font-medium">{name}</span>
    </div>
  );
};

export default FilterCircle;
