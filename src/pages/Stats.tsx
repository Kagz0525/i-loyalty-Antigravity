import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import VendorAnalytics from '../components/VendorAnalytics';

export default function Stats() {
  const { user } = useAuth();
  const { loyaltyRecords, pointHistory } = useData();

  if (user?.role !== 'vendor') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500 text-center mt-12">Stats are only available for vendors.</p>
      </div>
    );
  }

  const vendorRecords = React.useMemo(
    () => loyaltyRecords.filter((r) => r.vendorId === user?.id),
    [loyaltyRecords, user?.id]
  );
  const vendorPointHistory = React.useMemo(
    () => pointHistory.filter((h) => vendorRecords.some((r) => r.id === h.recordId)),
    [pointHistory, vendorRecords]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Program Analytics</h1>
        <p className="text-sm text-gray-500">Track your loyalty program performance.</p>
      </div>
      <VendorAnalytics records={vendorRecords} pointHistory={vendorPointHistory} />
    </div>
  );
}
