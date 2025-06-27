
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoSplash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding/loading');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuzo-coral to-fuzo-purple flex items-center justify-center">
      <div className="text-center animate-scale-in">
        <div className="mb-8 animate-pulse-scale">
          <h1 className="text-6xl font-bold text-white font-poppins">FUZO</h1>
          <div className="w-16 h-1 bg-fuzo-yellow mx-auto mt-4 rounded-full"></div>
        </div>
        <p className="text-white/80 text-lg">Discover Amazing Food</p>
      </div>
    </div>
  );
};

export default LogoSplash;
