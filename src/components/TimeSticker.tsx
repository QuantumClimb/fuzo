
import { useState, useEffect } from 'react';

const TimeSticker = () => {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      setTime(`${displayHours}:${displayMinutes} ${period}`);
    };
    
    // Update immediately and then every minute
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-20 left-4 z-20">
      <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-lg">
        {time}
      </div>
    </div>
  );
};

export default TimeSticker;
