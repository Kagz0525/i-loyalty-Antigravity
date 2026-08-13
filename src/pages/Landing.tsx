import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#f89c1e] flex flex-col relative overflow-hidden">
      {/* Top half with the lady image */}
      <div 
        className="absolute top-0 left-0 right-0 h-[60dvh] w-full bg-top bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/assets/landing-bg.jpg)',
          backgroundSize: '100% auto', // This ensures the width fits perfectly without cropping
          backgroundColor: '#f69a19' // Fallback orange color
        }}
      />
      
      {/* Bottom half with the white arc and buttons */}
      <div className="absolute bottom-0 left-0 right-0 h-[45dvh] bg-white rounded-t-[3rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center pt-8 px-6 pb-8 z-10">
        
        {/* Logo */}
        <div className="flex-1 flex items-center justify-center w-full max-w-sm mb-2">
          <img src="/assets/logo.png" alt="i-Loyalty Logo" className="h-32 w-auto object-contain" />
        </div>
        
        {/* Buttons */}
        <div className="w-full max-w-sm flex flex-row gap-4 mt-auto mb-2">
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
