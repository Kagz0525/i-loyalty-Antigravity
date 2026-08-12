import React, { useMemo, useState } from 'react';
import { LoyaltyRecord, PointHistory } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, Gift, Star, Filter } from 'lucide-react';

interface VendorAnalyticsProps {
  records: LoyaltyRecord[];
  pointHistory: PointHistory[];
}

type TimeFilter = '1D' | '7D' | '1M' | '1Y';

export default function VendorAnalytics({ records, pointHistory }: VendorAnalyticsProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1M');

  // 1. Calculate top-level stats (Inception to date)
  const totalCustomers = records.length;
  
  const totalPointsGiven = useMemo(() => {
    return pointHistory.filter(h => h.type === 'earned').length;
  }, [pointHistory]);

  const totalRewardsRedeemed = useMemo(() => {
    return pointHistory.filter(h => h.type === 'redeemed').length;
  }, [pointHistory]);

  // 2. Calculate Chart Data based on time filter
  const chartData = useMemo(() => {
    const data: { start: number, end: number, displayDate: string, customersJoined: number, rewards: number }[] = [];
    const now = new Date();
    
    if (timeFilter === '1D') {
      // 24 hours
      now.setMinutes(0, 0, 0);
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          start: d.getTime(),
          end: d.getTime() + 60 * 60 * 1000 - 1,
          displayDate: d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          customersJoined: 0,
          rewards: 0
        });
      }
    } else if (timeFilter === '7D' || timeFilter === '1M') {
      const days = timeFilter === '7D' ? 7 : 30;
      now.setHours(0,0,0,0);
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          start: d.getTime(),
          end: d.getTime() + 24 * 60 * 60 * 1000 - 1,
          displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          customersJoined: 0,
          rewards: 0
        });
      }
    } else if (timeFilter === '1Y') {
      // 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        data.push({
          start: d.getTime(),
          end: nextMonth.getTime() - 1,
          displayDate: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          customersJoined: 0,
          rewards: 0
        });
      }
    }
    
    // Fill Rewards
    pointHistory.forEach(h => {
      if (h.type === 'redeemed') {
        const time = new Date(h.date).getTime();
        const bucket = data.find(b => time >= b.start && time <= b.end);
        if (bucket) bucket.rewards++;
      }
    });

    // Fill Customers Joined
    records.forEach(r => {
      // Find earliest point for this record to determine join date
      const points = pointHistory.filter(h => h.recordId === r.id);
      if (points.length > 0) {
        // Sort by date ascending
        points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const joinTime = new Date(points[0].date).getTime();
        const bucket = data.find(b => joinTime >= b.start && joinTime <= b.end);
        if (bucket) bucket.customersJoined++;
      }
    });

    return data;
  }, [pointHistory, records, timeFilter]);

  const filterLabel = {
    '1D': '(24 Hours)',
    '7D': '(7 Days)',
    '1M': '(30 Days)',
    '1Y': '(12 Months)'
  };

  return (
    <div className="space-y-6">
      {/* Top Level Stats (All Time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Customers (All Time)</p>
            <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Points Distributed (All Time)</p>
            <p className="text-2xl font-bold text-gray-900">{totalPointsGiven}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mr-4">
            <Gift className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rewards Redeemed (All Time)</p>
            <p className="text-2xl font-bold text-gray-900">{totalRewardsRedeemed}</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex justify-end items-center">
        <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-sm">
          <Filter className="w-4 h-4 text-gray-400 mx-2" />
          <div className="flex space-x-1">
            {(['1D', '7D', '1M', '1Y'] as TimeFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeFilter === filter 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Customers Joined <span className="text-sm font-normal text-gray-500">{filterLabel[timeFilter]}</span></h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="customersJoined" name="Customers Joined" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Rewards Claimed <span className="text-sm font-normal text-gray-500">{filterLabel[timeFilter]}</span></h3>
            <Gift className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
