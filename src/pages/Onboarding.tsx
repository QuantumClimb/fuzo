
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  
  const steps = [
    {
      title: "Discover Food Around You",
      description: "Find the best dishes and hidden gems in your area, shared by real foodies.",
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500"
    },
    {
      title: "Swipe to Save or Skip",
      description: "Swipe right to save dishes to your plate, or left to skip and see more options.",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500"
    },
    {
      title: "Share Your Food Adventures",
      description: "Capture and share your own food discoveries with the FUZO community.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigate('/');
      localStorage.setItem('onboardingComplete', 'true');
    }
  };
  
  const handleSkip = () => {
    navigate('/');
    localStorage.setItem('onboardingComplete', 'true');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="relative h-2/3">
          <img 
            src={steps[currentStep-1].image}
            alt={steps[currentStep-1].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          
          <div className="absolute top-8 right-4">
            <button 
              onClick={handleSkip}
              className="text-white opacity-80 text-sm font-medium"
            >
              Skip
            </button>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 px-6">
            <h1 className="text-white text-3xl font-bold mb-2">
              {steps[currentStep-1].title}
            </h1>
            <p className="text-white/90">
              {steps[currentStep-1].description}
            </p>
          </div>
        </div>
        
        <div className="flex-1 bg-white p-6 flex flex-col justify-between">
          <div className="flex justify-center mb-8">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`mx-1 rounded-full ${
                  index+1 === currentStep 
                    ? 'w-8 bg-fuzo-coral' 
                    : 'w-2 bg-gray-300'
                } h-2`}
              />
            ))}
          </div>
          
          <button 
            onClick={handleNext}
            className="fuzo-btn fuzo-btn-primary py-4 rounded-full flex items-center justify-center gap-2"
          >
            <span>{currentStep === steps.length ? 'Get Started' : 'Continue'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
