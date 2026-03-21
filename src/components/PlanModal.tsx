import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const { user, updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateBilling = async () => {
    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated - Please log in again.');
      }

      // We explicitly make a fetch call (not supabase.functions.invoke due to potential CORS routing hurdles)
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ amount: 99.00, currency: 'ZAR' }) // Set logic properly later based on plan selected
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      // Redirect standard to sandbox URL for testing as instructed (adjust for prod later)
      window.location.href = `https://sandbox.peachpayments.com/checkout?id=${data.checkoutId}`;
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'An unexpected payment error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={!isProcessing ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
          >
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Current Plan Type</h2>
            <div className="space-y-4 mb-6">
              <div 
                className={`p-4 border rounded-xl cursor-pointer transition-colors ${user?.planType === 'Starter' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                onClick={() => {
                  if (!isProcessing) {
                    updateUser({ planType: 'Starter' });
                    onClose();
                  }
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900">Starter Plan</h3>
                  {user?.planType === 'Starter' && <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Current</span>}
                </div>
                <p className="text-sm text-gray-600">Limit to 10 customers</p>
              </div>
              <div 
                className={`p-4 border rounded-xl cursor-pointer transition-colors ${user?.planType === 'Pro' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                onClick={() => {
                  if (!isProcessing) {
                    updateUser({ planType: 'Pro' });
                    onClose();
                  }
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900">Pro Plan</h3>
                  {user?.planType === 'Pro' && <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Current</span>}
                </div>
                <p className="text-sm text-gray-600">Unlimited customers</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={handleUpdateBilling}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 text-black font-medium hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing ? 'Processing...' : 'Update Billing Method'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
