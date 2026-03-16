import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const { user, updateUser } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Current Plan Type</h2>
            <div className="space-y-4 mb-6">
              <div 
                className={`p-4 border rounded-xl cursor-pointer transition-colors ${user?.planType === 'Starter' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                onClick={() => {
                  updateUser({ planType: 'Starter' });
                  onClose();
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
                  updateUser({ planType: 'Pro' });
                  onClose();
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900">Pro Plan</h3>
                  {user?.planType === 'Pro' && <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Current</span>}
                </div>
                <p className="text-sm text-gray-600">Unlimited customers</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button className="text-black font-medium hover:underline">
                Update Billing Method
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
