import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#f69a19] flex flex-col relative overflow-hidden">
      {/* Top section with the lady image scaling naturally */}
      <div className="w-full flex-shrink-0">
        <img 
          src="/assets/landing-bg.jpg" 
          alt="Landing Background"
          className="w-full h-auto object-cover object-top"
        />
      </div>
      
      {/* Bottom section with the white arc and buttons */}
      <div className="flex-1 bg-white rounded-t-[3rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center pt-2 px-6 pb-20 z-10 -mt-[2vh] relative w-full">
        
        {/* Logo */}
        <div className="w-full max-w-xs mt-12">
          <img src="/assets/logo.png" alt="i-Loyalty Logo" className="w-full h-auto object-contain" />
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
