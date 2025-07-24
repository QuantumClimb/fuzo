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
        {/* Logo */}
        <div className="mb-6">
          <img 
            src="/logo_trans.png" 
            alt="Logo" 
                         className="h-20 w-60"
          />
        </div>
        <h2 className="text-2xl font-headline text-primary mb-4 text-center">Welcome</h2>
        <button
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-cta text-lg shadow font-bold mt-2"
          onClick={handleEnter}
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default Login; 