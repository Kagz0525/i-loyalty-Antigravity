import { MessageSquare } from 'lucide-react';

export default function Chat() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6">
          <MessageSquare className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          We're working hard to bring you a seamless messaging experience. Soon you'll be able to communicate directly with vendors and customers.
        </p>
      </div>
    </div>
  );
}
