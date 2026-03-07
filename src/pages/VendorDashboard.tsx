import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Search, Plus, CheckCircle2, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CustomerDetailsModal from '../components/CustomerDetailsModal';

export default function VendorDashboard() {
  const { user } = useAuth();
  const { customers, loyaltyRecords, addCustomer, addPoint, redeemReward } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomerRecord, setSelectedCustomerRecord] = useState<any>(null);

  // Form state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Filter records for this vendor
  const vendorRecords = loyaltyRecords.filter((r) => r.vendorId === user?.id);

  // Join records with customer data
  const customerCards = vendorRecords.map((record) => {
    const customer = customers.find((c) => c.id === record.customerId);
    return { ...record, customer };
  }).filter(card => 
    card.customer && 
    (card.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     card.customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setNewCustomerPhone(formatted);
    
    // Basic validation
    if (formatted.length > 0 && !/^\d{3} \d{3} \d{4}$/.test(formatted)) {
      setPhoneError('Format: 000 000 0000');
    } else {
      setPhoneError('');
    }
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneError) return;

    const newCustomer = {
      id: `c${Date.now()}`,
      name: newCustomerName,
      email: newCustomerEmail,
      phone: newCustomerPhone,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    addCustomer(newCustomer, user!.id, 10); // Default max points 10
    setIsAddModalOpen(false);
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewCustomerPhone('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            placeholder="Search Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {customerCards.map((card) => {
            if (!card.customer) return null;
            const isRewardReady = card.points >= card.maxPoints;

            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedCustomerRecord(card)}
                className={`relative rounded-2xl p-6 shadow-lg transition-all cursor-pointer hover:shadow-xl ${
                  isRewardReady
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                    : 'bg-white border border-gray-100 text-gray-900'
                }`}
              >
                {/* Points Circles */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-wrap gap-2 max-w-[70%]">
                    {Array.from({ length: card.maxPoints }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full ${
                          i < card.points
                            ? isRewardReady
                              ? 'bg-white'
                              : 'bg-indigo-600'
                            : isRewardReady
                            ? 'bg-emerald-400/50'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className={`text-sm font-bold ${isRewardReady ? 'text-emerald-100' : 'text-gray-400'}`}>
                    {card.points}/{card.maxPoints}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold tracking-tight ${isRewardReady ? 'text-white' : 'text-gray-900'}`}>
                    {card.customer.name}
                  </h3>
                  <p className={`text-sm mt-1 ${isRewardReady ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {card.customer.email}
                  </p>
                  <p className={`text-xs mt-1 font-mono ${isRewardReady ? 'text-emerald-200' : 'text-gray-400'}`}>
                    {card.customer.phone}
                  </p>
                </div>

                {/* Actions */}
                {isRewardReady && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        redeemReward(card.id);
                      }}
                      className="flex-1 flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Redeem Reward
                    </button>
                  </div>
                )}

                {isRewardReady && (
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center transform rotate-12">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Reward Ready!
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 right-8 w-[72px] h-[72px] bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-20"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Register Customer</h2>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="000 000 0000"
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      phoneError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                    value={newCustomerPhone}
                    onChange={handlePhoneChange}
                    maxLength={12}
                  />
                  {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
                </div>
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!phoneError}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedCustomerRecord && (
        <CustomerDetailsModal
          isOpen={!!selectedCustomerRecord}
          onClose={() => setSelectedCustomerRecord(null)}
          record={loyaltyRecords.find(r => r.id === selectedCustomerRecord.id) || selectedCustomerRecord}
          customer={selectedCustomerRecord.customer}
        />
      )}
    </div>
  );
}
