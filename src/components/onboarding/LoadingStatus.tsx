
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingStatus = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="mb-8">
          <div className="flex space-x-2 justify-center">
            <div className="w-3 h-3 bg-fuzo-coral rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-fuzo-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-fuzo-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Finding good food near you...</h2>
        <p className="text-gray-600">Just a moment while we set things up</p>
        
        <div className="mt-8 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-fuzo-coral to-fuzo-purple h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingStatus;
