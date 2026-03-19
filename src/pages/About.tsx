import { useAuth } from '../context/AuthContext';
import { PlayCircle } from 'lucide-react';

export default function About() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center tracking-tight">About our App</h1>
        
        <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed max-w-2xl mx-auto">
          Introducing our loyalty program app, where vendors reward customers with points for their loyalty. Vendors effortlessly manage customer points, while customers can easily track their point balance, unlocking rewards with every purchase or visit.
        </p>
        
        <div className="flex items-center justify-center space-x-4 mb-10">
          <div className="flex-1 border-t-2 border-dotted border-gray-300"></div>
          <span className="text-gray-400 font-semibold tracking-widest uppercase text-sm">Tutorial Videos</span>
          <div className="flex-1 border-t-2 border-dotted border-gray-300"></div>
        </div>

        <div className="max-w-md mx-auto space-y-3">
          {/* Always Visible: Demo Video */}
          <a
            href="https://www.youtube.com/watch?v=d9_Ril4UNbQ&list=PLZaLEYNnQR2_KUdXsM839BhUK6uhnQr9C"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-200 group cursor-pointer"
          >
            <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">1. Demo Video</span>
            <PlayCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </a>

          {/* Vendors Only: The rest of the tutorials */}
          {user?.role === 'vendor' && (
            <>
              <a
                href="https://www.youtube.com/watch?v=s-6mYeCzUHI&list=PLZaLEYNnQR2_KUdXsM839BhUK6uhnQr9C&index=2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-200 group cursor-pointer"
              >
                <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">2. Sign Up</span>
                <PlayCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </a>

              <a
                href="https://www.youtube.com/watch?v=eH1P74D_hPk&list=PLZaLEYNnQR2_KUdXsM839BhUK6uhnQr9C&index=5"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-200 group cursor-pointer"
              >
                <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">3. Add Customer</span>
                <PlayCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </a>

              <a
                href="https://www.youtube.com/watch?v=koDT7ayNbak&list=PLZaLEYNnQR2_KUdXsM839BhUK6uhnQr9C&index=4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-200 group cursor-pointer"
              >
                <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">4. Assign Points</span>
                <PlayCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </a>

              <a
                href="https://www.youtube.com/watch?v=6vC0cM1o3nk&list=PLZaLEYNnQR2_KUdXsM839BhUK6uhnQr9C&index=3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors border border-transparent hover:border-orange-200 group cursor-pointer"
              >
                <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">5. Terms & Conditions Settings</span>
                <PlayCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
