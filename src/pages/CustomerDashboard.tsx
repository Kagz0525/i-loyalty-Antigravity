import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Search, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VendorDetailsModal from '../components/VendorDetailsModal';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { vendors, loyaltyRecords } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorRecord, setSelectedVendorRecord] = useState<{ record: any; vendor: any } | null>(null);

  // Filter records for this customer
  const customerRecords = loyaltyRecords.filter((r) => r.customerId === user?.id);

  // Join records with vendor data
  const vendorCards = customerRecords.map((record) => {
    const vendor = vendors.find((v) => v.id === record.vendorId);
    return { ...record, vendor };
  }).filter(card => 
    card.vendor && 
    (card.vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     card.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            placeholder="Search Vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {vendorCards.map((card) => {
            if (!card.vendor) return null;
            const isRewardReady = card.points >= card.maxPoints;

            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedVendorRecord({ record: card, vendor: card.vendor })}
                className={`relative rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl cursor-pointer ${
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

                {/* Vendor Info */}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold tracking-tight ${isRewardReady ? 'text-white' : 'text-gray-900'}`}>
                    {card.vendor.businessName}
                  </h3>
                  <p className={`text-sm mt-1 ${isRewardReady ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {card.vendor.email}
                  </p>
                  <p className={`text-xs mt-1 font-mono ${isRewardReady ? 'text-emerald-200' : 'text-gray-400'}`}>
                    {card.vendor.phone || '081 111 2222'}
                  </p>
                </div>

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

      {/* Vendor Details Modal */}
      {selectedVendorRecord && (
        <VendorDetailsModal
          isOpen={!!selectedVendorRecord}
          onClose={() => setSelectedVendorRecord(null)}
          record={selectedVendorRecord.record}
          vendor={selectedVendorRecord.vendor}
        />
      )}
    </div>
  );
}
