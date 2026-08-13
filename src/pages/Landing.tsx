import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col relative overflow-hidden">
      {/* Top half with the lady image */}
      <div 
        className="absolute top-0 left-0 right-0 h-[65vh] bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/landing-bg.jpg)' }}
      />
      
      {/* Bottom half with the white arc and buttons */}
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] bg-white rounded-t-[3rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center pt-10 px-8 pb-10 z-10">
        
        {/* Logo */}
        <div className="flex-1 flex items-center justify-center w-full max-w-sm mb-4">
          <img src="/assets/logo.png" alt="i-Loyalty Logo" className="h-24 w-auto object-contain" />
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
