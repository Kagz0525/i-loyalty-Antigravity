import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  businessName: string;
  phone?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  birthday?: string;
}

export interface LoyaltyRecord {
  id: string;
  vendorId: string;
  customerId: string;
  points: number;
  maxPoints: number;
  visits: number;
  rewardCode?: string;
}

export interface PointHistory {
  id: string;
  recordId: string;
  date: string;
  type: 'earned' | 'redeemed';
}

interface DataContextType {
  vendors: Vendor[];
  customers: Customer[];
  loyaltyRecords: LoyaltyRecord[];
  pointHistory: PointHistory[];
  addCustomer: (customer: Customer, vendorId: string, maxPoints: number) => void;
  removeCustomer: (recordId: string) => void;
  addPoint: (recordId: string, date?: string) => void;
  removePoint: (historyId: string, recordId: string) => void;
  redeemReward: (recordId: string) => void;
  resetPoints: (recordId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loyaltyRecords, setLoyaltyRecords] = useState<LoyaltyRecord[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setVendors([]);
      setCustomers([]);
      setLoyaltyRecords([]);
      setPointHistory([]);
    }
  }, [user]);

  const fetchData = async () => {
    // Fetch vendors (profiles with role='vendor')
    const { data: vendorsData } = await supabase.from('profiles').select('*').eq('role', 'vendor');
    if (vendorsData) {
      setVendors(vendorsData.map(v => ({
        id: v.id,
        name: v.name,
        email: v.email,
        businessName: v.business_name,
        phone: v.phone
      })));
    }

    // Fetch customers
    const { data: customersData } = await supabase.from('customers').select('*');
    if (customersData) {
      setCustomers(customersData.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        joinedDate: c.joined_date,
        birthday: c.birthday
      })));
    }

    // Fetch loyalty records
    const { data: recordsData } = await supabase.from('loyalty_records').select('*');
    if (recordsData) {
      setLoyaltyRecords(recordsData.map(r => ({
        id: r.id,
        vendorId: r.vendor_id,
        customerId: r.customer_id,
        points: r.points,
        maxPoints: r.max_points,
        visits: r.visits,
        rewardCode: r.reward_code
      })));
    }

    // Fetch point history
    const { data: historyData } = await supabase.from('point_history').select('*').order('date', { ascending: false });
    if (historyData) {
      setPointHistory(historyData.map(h => ({
        id: h.id,
        recordId: h.record_id,
        date: h.date,
        type: h.type
      })));
    }
  };

  const generateRewardCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const addCustomer = async (customer: Customer, vendorId: string, maxPoints: number) => {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert([{
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        joined_date: customer.joinedDate,
        birthday: customer.birthday,
        created_by: user?.id
      }])
      .select()
      .single();

    if (newCustomer) {
      const mappedCustomer = {
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        joinedDate: newCustomer.joined_date,
        birthday: newCustomer.birthday
      };
      setCustomers((prev) => [...prev, mappedCustomer]);

      const { data: newRecord } = await supabase
        .from('loyalty_records')
        .insert([{
          vendor_id: vendorId,
          customer_id: newCustomer.id,
          points: 0,
          max_points: maxPoints,
          visits: 0
        }])
        .select()
        .single();

      if (newRecord) {
        setLoyaltyRecords((prev) => [
          ...prev,
          {
            id: newRecord.id,
            vendorId: newRecord.vendor_id,
            customerId: newRecord.customer_id,
            points: newRecord.points,
            maxPoints: newRecord.max_points,
            visits: newRecord.visits,
            rewardCode: newRecord.reward_code
          },
        ]);
      }
    }
  };

  const removeCustomer = async (recordId: string) => {
    await supabase.from('loyalty_records').delete().eq('id', recordId);
    setLoyaltyRecords((prev) => prev.filter((r) => r.id !== recordId));
    setPointHistory((prev) => prev.filter((h) => h.recordId !== recordId));
  };

  const addPoint = async (recordId: string, date?: string) => {
    const record = loyaltyRecords.find(r => r.id === recordId);
    if (record && record.points < record.maxPoints) {
      const newPoints = record.points + 1;
      const isRewardReady = newPoints >= record.maxPoints;
      const rewardCode = isRewardReady ? generateRewardCode() : record.rewardCode;
      const newVisits = record.visits + 1;

      await supabase
        .from('loyalty_records')
        .update({ points: newPoints, visits: newVisits, reward_code: rewardCode })
        .eq('id', recordId);

      const historyDate = date || new Date().toISOString();
      const { data: newHistory } = await supabase
        .from('point_history')
        .insert([{ record_id: recordId, date: historyDate, type: 'earned' }])
        .select()
        .single();

      setLoyaltyRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? { ...r, points: newPoints, visits: newVisits, rewardCode }
            : r
        )
      );
      
      if (newHistory) {
        setPointHistory((prev) => [
          {
            id: newHistory.id,
            recordId: newHistory.record_id,
            date: newHistory.date,
            type: newHistory.type as 'earned' | 'redeemed',
          },
          ...prev,
        ]);
      }
    }
  };

  const removePoint = async (historyId: string, recordId: string) => {
    const record = loyaltyRecords.find(r => r.id === recordId);
    if (record && record.points > 0) {
      const newPoints = record.points - 1;
      const isRewardReady = newPoints >= record.maxPoints;
      const rewardCode = isRewardReady ? record.rewardCode : null;

      await supabase.from('point_history').delete().eq('id', historyId);
      await supabase.from('loyalty_records').update({ points: newPoints, reward_code: rewardCode }).eq('id', recordId);

      setPointHistory((prev) => prev.filter((h) => h.id !== historyId));
      setLoyaltyRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? { ...r, points: newPoints, rewardCode: rewardCode || undefined }
            : r
        )
      );
    }
  };

  const redeemReward = async (recordId: string) => {
    const record = loyaltyRecords.find(r => r.id === recordId);
    if (record && record.points >= record.maxPoints) {
      const newVisits = record.visits + 1;

      await supabase.from('loyalty_records').update({ points: 0, visits: newVisits, reward_code: null }).eq('id', recordId);

      const { data: newHistory } = await supabase
        .from('point_history')
        .insert([{ record_id: recordId, date: new Date().toISOString(), type: 'redeemed' }])
        .select()
        .single();

      setLoyaltyRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? { ...r, points: 0, visits: newVisits, rewardCode: undefined }
            : r
        )
      );
      
      if (newHistory) {
        setPointHistory((prev) => [
          {
            id: newHistory.id,
            recordId: newHistory.record_id,
            date: newHistory.date,
            type: newHistory.type as 'earned' | 'redeemed',
          },
          ...prev,
        ]);
      }
    }
  };

  const resetPoints = async (recordId: string) => {
    await supabase.from('loyalty_records').update({ points: 0, reward_code: null }).eq('id', recordId);
    setLoyaltyRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? { ...r, points: 0, rewardCode: undefined }
          : r
      )
    );
  };

  return (
    <DataContext.Provider
      value={{ vendors, customers, loyaltyRecords, pointHistory, addCustomer, removeCustomer, addPoint, removePoint, redeemReward, resetPoints }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
