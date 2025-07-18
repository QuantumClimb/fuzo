import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const handleEnter = () => {
    navigate('/');
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        {/* Logo placeholder */}
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow">
            <span className="text-3xl text-white font-headline">FUZO</span>
          </div>
        </div>
        <h2 className="text-2xl font-headline text-primary mb-4 text-center">Welcome to FUZO</h2>
        <button
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-cta text-lg shadow font-bold mt-2"
          onClick={handleEnter}
        >
          Enter FUZO
        </button>
      </div>
    </div>
  );
};

export default Login; 