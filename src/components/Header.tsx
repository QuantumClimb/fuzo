
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '@/components/NotificationCenter';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showSearchButton?: boolean;
  onSearchClick?: () => void;
}

const Header = ({ title, showBackButton = false, showSearchButton = false, onSearchClick }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="fuzo-container">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <h1 className="text-xl font-bold text-fuzo-dark">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationCenter />
            {showSearchButton && onSearchClick && (
              <button 
                onClick={onSearchClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search size={20} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
