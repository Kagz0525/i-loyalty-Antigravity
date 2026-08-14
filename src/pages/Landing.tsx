import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, BadgeCheck, QrCode, TrendingUp } from 'lucide-react';

const benefits = [
  { icon: Gift, text: "Reward your loyal customers", id: 'reward' },
  { icon: null, text: "Assign loyalty Points", id: 'points' },
  { icon: QrCode, text: "Seamless scanning & redeeming", id: 'scan' },
  { icon: TrendingUp, text: "Track your business growth", id: 'track' }
];

export default function Landing() {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState('/assets/landing-bg.jpg');
  const [showLogo, setShowLogo] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Pick random background
  useEffect(() => {
    const num = Math.floor(Math.random() * 5) + 1; // Try landing-1 to landing-5
    setBgImage(`/assets/landing-${num}.jpg`);
  }, []);

  // Animation timelines
  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showLogo) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % benefits.length);
      }, 3000); // 3 seconds per slide for better readability
      return () => clearInterval(interval);
    }
  }, [showLogo]);

  return (
    <div className="min-h-[100dvh] bg-[#f69a19] flex flex-col relative overflow-hidden">
      {/* Top section with the lady image scaling naturally */}
      <div className="w-full flex-shrink-0">
        <img 
          src={bgImage} 
          onError={(e) => {
            // Fallback to default if random number doesn't exist
            if (e.currentTarget.src !== window.location.origin + '/assets/landing-bg.jpg') {
              e.currentTarget.src = '/assets/landing-bg.jpg';
            }
          }}
          alt="Landing Background"
          className="w-full h-auto object-cover object-top"
        />
      </div>
      
      {/* Bottom section with the white arc and buttons */}
      <div className="flex-1 bg-white rounded-t-[3rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center pt-2 px-6 pb-10 z-10 -mt-[2vh] relative w-full">
        
        {/* Dynamic Content Area */}
        <div className="relative w-full max-w-sm mt-12 flex-1 flex flex-col items-center min-h-[220px]">
          
          {/* Logo (Outro Animation) */}
          <div className={`absolute top-0 w-full max-w-xs transition-all duration-1000 ease-in-out ${
            showLogo ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-90 pointer-events-none'
          }`}>
            <img src="/assets/logo.png" alt="i-Loyalty Logo" className="w-full h-auto object-contain" />
          </div>

          {/* Carousel (Intro Animation) */}
          <div className={`absolute top-4 w-full transition-all duration-1000 delay-500 ease-in-out ${
            !showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
          }`}>
            {benefits.map((b, idx) => (
              <div 
                key={b.id} 
                className={`absolute top-0 left-0 w-full flex flex-col items-center text-center transition-all duration-700 ease-in-out ${
                  currentSlide === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
                }`}
              >
                {/* Icon Circle */}
                <div className="h-24 w-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-6 text-orange-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                  {b.id === 'points' ? (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <BadgeCheck 
                          key={i} 
                          className={`w-7 h-7 text-orange-500 transition-all duration-500 ease-out ${
                            currentSlide === idx ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'
                          }`}
                          style={{ transitionDelay: `${showLogo ? 0 : i * 250}ms` }}
                        />
                      ))}
                    </div>
                  ) : (
                    b.icon && <b.icon className="w-12 h-12" strokeWidth={1.5} />
                  )}
                </div>
                
                {/* Headline Text */}
                <h3 className="text-2xl font-bold text-gray-800 px-4 leading-tight tracking-tight">
                  {b.id === 'points' ? (
                    <>Assign loyalty <span className="text-orange-500">Points</span></>
                  ) : (
                    b.text
                  )}
                </h3>
              </div>
            ))}
          </div>
        </div>
        
        {/* Buttons */}
        <div className="w-full max-w-sm flex flex-row gap-4 mt-auto">
          <button
            onClick={() => navigate('/login?mode=sign-up')}
            className="flex-1 py-3.5 px-2 bg-white border-2 border-orange-500 text-orange-600 rounded-[2rem] font-medium text-lg hover:bg-orange-50 transition-colors shadow-sm text-center tracking-wide"
          >
            Registration
          </button>
          
          <button
            onClick={() => navigate('/login?mode=sign-in')}
            className="flex-1 py-3.5 px-2 bg-white border-2 border-orange-500 text-orange-600 rounded-[2rem] font-medium text-lg hover:bg-orange-50 transition-colors shadow-sm text-center tracking-wide"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
