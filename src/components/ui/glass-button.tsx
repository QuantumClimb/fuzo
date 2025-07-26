import React from 'react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
}

const GlassButton: React.FC<GlassButtonProps> = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-white/10 backdrop-blur-md border border-white/20 text-white
        shadow-[0_4px_30px_rgba(0,0,0,0.2)] rounded-xl
        px-6 py-3 font-semibold tracking-wide
        cursor-pointer transition-all duration-300 ease-in-out
        hover:bg-white/20 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]
        hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:transform-none ${className}
      `}
    >
      {children}
    </button>
  );
};

export default GlassButton; 