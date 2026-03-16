import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Phone, Mail, Check } from 'lucide-react';
import { Vendor, LoyaltyRecord, useData } from '../context/DataContext';

interface VendorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LoyaltyRecord;
  vendor: Vendor;
}

export default function VendorDetailsModal({ isOpen, onClose, record, vendor }: VendorDetailsModalProps) {
  const { pointHistory, loyaltyRecords, removeCustomer } = useData();
  const [isRemoveVendorModalOpen, setIsRemoveVendorModalOpen] = useState(false);

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

  const handleRemoveVendor = () => {
    setIsRemoveVendorModalOpen(true);
  };

  const confirmRemoveVendor = () => {
    removeCustomer(latestRecord.id);
    setIsRemoveVendorModalOpen(false);
    onClose();
  };

  // We need to get the joined date from the customer object, but we only have the vendor and record here.
  // We can get the customer from the context using the record's customerId.
  const { customers } = useData();
  const customer = customers.find(c => c.id === latestRecord.customerId);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center sm:p-6">
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
              className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl overflow-y-auto flex flex-col max-w-lg"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 z-10 bg-gray-100 sm:bg-transparent rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-6 sm:p-8 pb-6 text-center mt-8 sm:mt-0">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Loyalty Breakdown</h2>
                <p className="text-lg text-orange-600 mb-2">{vendor.businessName}</p>
                <p className="text-gray-900 font-medium">
                  {latestRecord.points} / {latestRecord.maxPoints}
                </p>
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
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 sm:px-8">
                <hr className="border-gray-300" />
              </div>

              <div className="p-6 sm:p-8 py-6 space-y-4">
                <div className="text-sm text-gray-900 font-medium">
                  Joined Date: {customer?.joinedDate ? customer.joinedDate.replace(/-/g, '/') : 'N/A'}
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  Visits Since Inception: {latestRecord.visits}
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  Active {customer?.joinedDate ? calculateActiveDays(customer.joinedDate) : 0} Day(s)
                </div>
              </div>

              <div className="px-6 sm:px-8">
                <hr className="border-gray-300" />
              </div>

              <div className="p-6 sm:p-8 pt-6 pb-8 space-y-6 sm:rounded-b-2xl">
                <div className="flex items-center text-gray-900">
                  <Phone className="w-6 h-6 mr-4 text-orange-600" />
                  <span className="font-medium text-base">Phone Number: 081 111 2222</span>
                </div>
                
                <div className="flex items-center text-gray-900">
                  <Mail className="w-6 h-6 mr-4 text-orange-600" />
                  <span className="font-medium text-base">
                    Email: {vendor.email}
                  </span>
                </div>

                <button
                  onClick={handleRemoveVendor}
                  className="flex items-center text-gray-900 hover:text-red-600 transition-colors w-full text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-2">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-medium text-base">Remove Vendor</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remove Vendor Confirmation Modal */}
      <AnimatePresence>
        {isRemoveVendorModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsRemoveVendorModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden text-center"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">Remove Vendor</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to remove this vendor from your loyalty program?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRemoveVendorModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveVendor}
                  className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
