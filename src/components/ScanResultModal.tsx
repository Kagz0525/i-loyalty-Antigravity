import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, User, Calendar, CheckCircle } from 'lucide-react';
import { Customer, LoyaltyRecord, useData } from '../context/DataContext';

interface ScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  record: LoyaltyRecord | null;
  onGoToProfile: () => void;
  onEnrollAndAssign: (date: string) => void;
  notFound: boolean;
}

export default function ScanResultModal({
  isOpen,
  onClose,
  customer,
  record,
  onGoToProfile,
  onEnrollAndAssign,
  notFound,
}: ScanResultModalProps) {
  const { addPoint } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [pointAdded, setPointAdded] = useState(false);

  const handleAssignPoint = () => {
    if (!record) return;
    addPoint(record.id, new Date(selectedDate).toISOString());
    setPointAdded(true);
    setTimeout(() => {
      setPointAdded(false);
      onClose();
    }, 1500);
  };

  const isRewardReady = record ? record.points >= record.maxPoints : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 z-10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Point Added Success State */}
            <AnimatePresence>
              {pointAdded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center rounded-3xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                  >
                    <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900">Point Added!</h3>
                  <p className="text-gray-500 text-sm mt-2">1 loyalty point assigned</p>
                </motion.div>
              )}
            </AnimatePresence>

            {notFound ? (
              /* Customer Not Found */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
                <p className="text-gray-500 text-sm mb-6">
                  This QR code does not match any customer in your loyalty program. Make sure the customer is registered first.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : customer ? (
              /* Customer Found */
              <div className="p-6">
                {/* Customer Info Header */}
                <div className="text-center mb-6 pt-2">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                  
                  {record && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                      <span className="text-2xl font-bold text-orange-600">{record.points}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-2xl font-bold text-gray-300">{record.maxPoints}</span>
                      <span className="text-xs text-gray-400 ml-1">points</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Date picker for both flows */}
                  {(!record || !isRewardReady) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Points Earned Date
                      </label>
                      <div className="relative mb-3">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {!record ? (
                    <>
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-3 text-center">
                        <h3 className="text-orange-800 font-bold mb-1">New Customer!</h3>
                        <p className="text-sm text-orange-600">This customer is not yet in your loyalty program.</p>
                      </div>
                      <button
                        onClick={() => {
                          setPointAdded(true);
                          setTimeout(() => {
                            setPointAdded(false);
                            onEnrollAndAssign(selectedDate);
                          }, 1000);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-orange-600 text-white rounded-xl font-semibold text-base hover:bg-orange-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                        Enroll & Assign 1st Point
                      </button>
                    </>
                  ) : !isRewardReady ? (
                    <button
                      onClick={handleAssignPoint}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-orange-600 text-white rounded-xl font-semibold text-base hover:bg-orange-700 transition-colors shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                      Assign 1 Loyalty Point
                    </button>
                  ) : (
                    <div className="text-center bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-2">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-700">Reward Ready!</p>
                      <p className="text-xs text-emerald-600 mt-1">
                        This customer has reached {record.maxPoints} points. Go to their profile to manage rewards.
                      </p>
                    </div>
                  )}

                  {/* Go to profile button ONLY if record exists */}
                  {record && (
                    <button
                      onClick={onGoToProfile}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Go to Customer's Profile
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Loading state */
              <div className="p-8 text-center">
                <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Looking up customer…</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
