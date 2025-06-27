
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, MessageCircle, User, Map } from 'lucide-react';

const NavBar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-100 z-50">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`flex flex-col items-center ${path === '/' ? 'text-fuzo-coral' : 'text-gray-500'}`}>
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/feed" className={`flex flex-col items-center ${path === '/feed' ? 'text-fuzo-coral' : 'text-gray-500'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <path d="M9 9h6v6H9z"/>
          </svg>
          <span className="text-xs mt-1">Feed</span>
        </Link>
        
        <Link to="/map" className={`flex flex-col items-center ${path === '/map' ? 'text-fuzo-coral' : 'text-gray-500'}`}>
          <Map size={24} />
          <span className="text-xs mt-1">Map</span>
        </Link>

        <Link to="/post" className="flex flex-col items-center relative -mt-8">
          <div className="bg-fuzo-coral rounded-full p-3 shadow-lg">
            <Camera size={24} className="text-white" />
          </div>
        </Link>

        <Link to="/plate" className={`flex flex-col items-center ${path === '/plate' ? 'text-fuzo-coral' : 'text-gray-500'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 12C7.5 15.18 9.82 17.5 13 17.5C16.18 17.5 18.5 15.18 18.5 12H7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 9.5V12M18.5 9.5V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs mt-1">Plate</span>
        </Link>

        <Link to="/profile" className={`flex flex-col items-center ${path === '/profile' ? 'text-fuzo-coral' : 'text-gray-500'}`}>
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
