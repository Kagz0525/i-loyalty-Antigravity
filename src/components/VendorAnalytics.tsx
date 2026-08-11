import React, { useMemo } from 'react';
import { LoyaltyRecord, PointHistoryItem } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { Users, Gift, Star, TrendingUp } from 'lucide-react';

interface VendorAnalyticsProps {
  records: LoyaltyRecord[];
  pointHistory: PointHistoryItem[];
}

export default function VendorAnalytics({ records, pointHistory }: VendorAnalyticsProps) {
  // 1. Calculate top-level stats
  const totalCustomers = records.length;
  
  const totalPointsGiven = useMemo(() => {
    return pointHistory.filter(h => h.type === 'earned').length;
  }, [pointHistory]);

  const totalRewardsRedeemed = useMemo(() => {
    return pointHistory.filter(h => h.type === 'redeemed').length;
  }, [pointHistory]);

  // 2. Calculate Chart Data (Points Given Over Last 30 Days)
  const last30DaysData = useMemo(() => {
    const data: { date: string, points: number, rewards: number }[] = [];
    const today = new Date();
    
    // Create empty buckets for last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data.push({ date: dateStr, points: 0, rewards: 0 });
    }
    
    // Fill buckets
    pointHistory.forEach(h => {
      const dateStr = h.date.split('T')[0];
      const bucket = data.find(d => d.date === dateStr);
      if (bucket) {
        if (h.type === 'earned') bucket.points++;
        if (h.type === 'redeemed') bucket.rewards++;
      }
    });

    // Format dates for display (e.g. "Aug 15")
    return data.map(d => ({
      ...d,
      displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [pointHistory]);

  return (
    <div className="space-y-6">
      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Points Distributed</p>
            <p className="text-2xl font-bold text-gray-900">{totalPointsGiven}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mr-4">
            <Gift className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rewards Redeemed</p>
            <p className="text-2xl font-bold text-gray-900">{totalRewardsRedeemed}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Points Given (30 Days)</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last30DaysData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="points" name="Points" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Rewards Claimed (30 Days)</h3>
            <Gift className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last30DaysData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="rewards" name="Rewards" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
