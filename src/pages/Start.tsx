import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Start: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-100 relative overflow-hidden">
      {/* Background image placeholder */}
      <div className="absolute inset-0 z-0" style={{ background: 'url(/public/placeholder.svg) center/cover no-repeat', opacity: 0.25 }} />
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
                         className="h-32 w-96"
          />
        </div>
        <h1 className="text-3xl font-headline text-primary mb-4 text-center">Savings, delivered.<br />From the store to your door</h1>
        <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
          <button
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-cta text-lg shadow font-bold"
            onClick={handleEnter}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Enter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Start; 