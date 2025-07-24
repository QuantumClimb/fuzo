import React, { useState } from 'react';
import './Onboarding.css';

const slides = [
  {
    image: '/share-image.png',
    title: 'Discover Hidden Food Spots',
    text: 'Follow Tako as he scouts the best local eats, one snap at a time.'
  },
  {
    image: '/radar_image.png',
    title: 'Use Radar Mode',
    text: 'Tako shows you the best-rated food around you. It updates live.'
  },
  {
    image: '/camera_image.png',
    title: 'Snap and Share Instantly',
    text: 'Your food shots power the community. Just point, shoot, and rank.'
  },
  {
    image: '/feed_image.png',
    title: 'Curated Feed',
    text: 'Your feed is tailored by Tako using geolocation and reviews.'
  },
  {
    image: '/scout_image.png',
    title: 'Join Tako\'s Scout Network',
    text: 'Become a verified food explorer and earn badges as you go!'
  }
];

interface OnboardingProps {
  onFinish: () => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      onFinish();
    }
  };

  const skip = () => {
    onFinish();
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <img 
          className="onboarding-image" 
          src={slides[index].image} 
          alt="Onboarding step" 
        />
        <h2 className="onboarding-title">{slides[index].title}</h2>
        <p className="onboarding-text">{slides[index].text}</p>
        
        <div className="onboarding-dots">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`onboarding-dot ${i === index ? 'active' : ''}`}
            />
          ))}
        </div>
        
        <div className="onboarding-buttons">
          <button onClick={skip} className="onboarding-skip">
            Skip
          </button>
          <button onClick={next} className="onboarding-next">
            {index < slides.length - 1 ? 'Next' : 'Start Exploring'}
          </button>
        </div>
      </div>
    </div>
  );
} 