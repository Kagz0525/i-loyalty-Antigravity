import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Phone, Cake, Check, Calendar, Info } from 'lucide-react';
import { Customer, LoyaltyRecord, useData } from '../context/DataContext';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LoyaltyRecord;
  customer: Customer;
}

export default function CustomerDetailsModal({ isOpen, onClose, record, customer }: CustomerDetailsModalProps) {
  const { pointHistory, loyaltyRecords, addPoint, removePoint, removeCustomer, redeemReward } = useData();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [pointToDelete, setPointToDelete] = useState<string | null>(null);
  const [isRemoveCustomerModalOpen, setIsRemoveCustomerModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  if (!isOpen) return null;

  // Get the latest record from context to ensure immediate UI updates
  const latestRecord = loyaltyRecords.find(r => r.id === record.id) || record;

  // Only show 'earned' history up to the current points to match the progress
  const currentPointsHistory = pointHistory
    .filter((h) => h.recordId === latestRecord.id && h.type === 'earned')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort newest first
    .slice(0, latestRecord.points) // Take only the active points
    .reverse(); // Reverse so earliest is at the top, latest at the bottom

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  const calculateActiveDays = (joinedDate: string) => {
    const start = new Date(joinedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleRemoveCustomer = () => {
    setIsRemoveCustomerModalOpen(true);
  };

  const confirmRemoveCustomer = () => {
    removeCustomer(latestRecord.id);
    setIsRemoveCustomerModalOpen(false);
    onClose();
  };

  const handleAssignPoint = () => {
    addPoint(record.id, new Date(selectedDate).toISOString());
    setIsAssignModalOpen(false);
    setSelectedDate(new Date().toISOString().slice(0, 10)); // Reset to now
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-14 sm:p-6">
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
              className="relative bg-white w-full max-h-full sm:h-auto sm:max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto flex flex-col max-w-lg"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 z-10 bg-gray-100 sm:bg-transparent rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-6 sm:p-8 pb-6 text-center mt-8 sm:mt-0">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Loyalty Breakdown</h2>
                <p className="text-lg text-orange-600 mb-2">{customer.name}</p>
                <p className="text-gray-900 font-medium mb-6">
                  {latestRecord.points} / {latestRecord.maxPoints}
                </p>

                {latestRecord.points >= latestRecord.maxPoints ? (
                  <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="w-full py-3 px-4 bg-red-600 text-white rounded-xl font-medium text-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Reset Points
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl font-medium text-lg hover:bg-orange-700 transition-colors shadow-sm"
                  >
                    Assign Loyalty Points
                  </button>
                )}
              </div>

              <div className="px-6 sm:px-8">
                <hr className="border-gray-300" />
              </div>

              <div className="p-6 sm:p-8 py-6 space-y-1 flex-1 overflow-y-auto min-h-[200px]">
                {currentPointsHistory.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">No points history yet.</p>
                ) : (
                  currentPointsHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                          <span className="text-sm text-gray-900 font-medium">{formatDate(item.date)}</span>
                          <span className="text-sm text-gray-700">Point Received</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setPointToDelete(item.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-lg transition-colors"
                        title="Remove Point"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 sm:px-8">
                <hr className="border-gray-300" />
              </div>

              {latestRecord.rewardCode && (
                <div className="p-6 sm:p-8 py-4 flex items-center justify-center">
                  <div className="bg-green-100 text-green-600 font-bold text-lg px-6 py-2 rounded-lg flex items-center gap-2">
                    Customer Code: {latestRecord.rewardCode}
                    <button 
                      onClick={() => setIsInfoModalOpen(true)}
                      className="text-green-600 hover:text-green-700 transition-colors ml-2"
                      title="What is this?"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-8 py-6 space-y-4">
                <div className="text-sm text-gray-900 font-medium">
                  Joined Date: {customer.joinedDate ? customer.joinedDate.replace(/-/g, '/') : 'N/A'}
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  Visits Since Inception: {latestRecord.visits}
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  Active {customer.joinedDate ? calculateActiveDays(customer.joinedDate) : 0} Day(s)
                </div>
              </div>

              <div className="px-6 sm:px-8">
                <hr className="border-gray-300" />
              </div>

              <div className="p-6 sm:p-8 pt-6 pb-8 space-y-6 sm:rounded-b-2xl">
                <div className="flex items-center text-gray-900">
                  <Phone className="w-6 h-6 mr-4 text-orange-600" />
                  <span className="font-medium text-base">Phone Number: {customer.phone}</span>
                </div>
                
                <div className="flex items-center text-gray-900">
                  <Cake className="w-6 h-6 mr-4 text-orange-600" />
                  <span className="font-medium text-base">
                    Birth Date: {customer.birthday ? customer.birthday.replace(/-/g, '/') : 'Not provided'}
                  </span>
                </div>

                <button
                  onClick={handleRemoveCustomer}
                  className="flex items-center text-gray-900 hover:text-red-600 transition-colors w-full text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-2">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-medium text-base">Remove Customer</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Points Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsAssignModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden"
            >
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Assign Points</h2>
              <p className="text-gray-600 text-center mb-6">1 loyalty point will be added</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Earned Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAssignPoint}
                className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl font-medium text-lg hover:bg-orange-700 transition-colors shadow-sm"
              >
                Add 1 Loyalty Point
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {pointToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setPointToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden text-center"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Point</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to remove this point?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPointToDelete(null)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    removePoint(pointToDelete, latestRecord.id);
                    setPointToDelete(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Points Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsResetModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden text-center"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Points</h2>
              <p className="text-gray-600 mb-6">
                Before resetting these points ensure the customer has redeemed their reward with this confirmation code {latestRecord.rewardCode || '123456'}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    redeemReward(latestRecord.id);
                    setIsResetModalOpen(false);
                  }}
                  className="w-full py-3 px-4 bg-red-600 rounded-xl text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Reset Point Now
                </button>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-full py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remove Customer Confirmation Modal */}
      <AnimatePresence>
        {isRemoveCustomerModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsRemoveCustomerModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden text-center"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">Remove Customer</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to remove this customer from your loyalty program?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRemoveCustomerModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveCustomer}
                  className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Info Modal */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsInfoModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden text-center"
            >
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmation Code</h2>
              <p className="text-gray-600 mb-6">
                A confirmation code {latestRecord.rewardCode} has been sent to your customer's email address. They can present this code to confirm their eligibility for their loyalty reward.
              </p>
              
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="w-full py-2.5 px-4 bg-orange-600 rounded-xl text-sm font-medium text-white hover:bg-orange-700 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
