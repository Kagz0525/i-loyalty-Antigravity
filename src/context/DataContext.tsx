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
    if (!user) return;

    // ── Vendors (profiles with role='vendor') ────────────────────────────────
    const { data: vendorsData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'vendor');

    if (vendorsData) {
      setVendors(vendorsData.map(v => ({
        id: v.id,
        name: v.name,
        email: v.email,
        businessName: v.business_name || v.name,
        phone: v.phone,
      })));
    }

    // ── Loyalty records scoped to this user ──────────────────────────────────
    // For vendors  → records where vendor_id = user.id
    // For customers → records where customer_id = user.id
    //                 OR customer_id is a legacy 'customers' table row whose email = user.email
    let recordsQuery = supabase.from('loyalty_records').select('*');

    if (user.role === 'vendor') {
      recordsQuery = recordsQuery.eq('vendor_id', user.id);
    } else {
      // Customer: fetch records both by their auth UUID and by any legacy customers row
      // that was created with their email before they signed up.
      
      // First, get any legacy IDs from the customers table that match their email
      const { data: legacyIds } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email);

      const allCustomerIds = [user.id];
      if (legacyIds) {
        legacyIds.forEach(row => allCustomerIds.push(row.id));
      }

      recordsQuery = recordsQuery.in('customer_id', allCustomerIds);
    }

    const { data: recordsData } = await recordsQuery;
    const mappedRecords: LoyaltyRecord[] = recordsData
      ? recordsData.map(r => ({
          id: r.id,
          vendorId: r.vendor_id,
          customerId: r.customer_id,
          points: r.points,
          maxPoints: r.max_points,
          visits: r.visits,
          rewardCode: r.reward_code,
        }))
      : [];

    setLoyaltyRecords(mappedRecords);

    // ── Customers (for vendor view: load profiles linked to their records) ───
    if (user.role === 'vendor' && mappedRecords.length > 0) {
      const customerIds = [...new Set(mappedRecords.map(r => r.customerId))];

      // First try profiles table (customers who signed up)
      const { data: profileCustomers } = await supabase
        .from('profiles')
        .select('*')
        .in('id', customerIds);

      // Also try legacy customers table (customers added manually before sign-up)
      const { data: legacyCustomers } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds);

      const combined: Customer[] = [];

      (profileCustomers || []).forEach(p => {
        combined.push({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone || '',
          joinedDate: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        });
      });

      (legacyCustomers || []).forEach(c => {
        // Don't double-add if already in profiles
        if (!combined.find(x => x.id === c.id)) {
          combined.push({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            joinedDate: c.joined_date,
            birthday: c.birthday,
          });
        }
      });

      setCustomers(combined);
    } else {
      setCustomers([]);
    }

    // ── Point history for the relevant records ───────────────────────────────
    if (mappedRecords.length > 0) {
      const recordIds = mappedRecords.map(r => r.id);
      const { data: historyData } = await supabase
        .from('point_history')
        .select('*')
        .in('record_id', recordIds)
        .order('date', { ascending: false });

      if (historyData) {
        setPointHistory(historyData.map(h => ({
          id: h.id,
          recordId: h.record_id,
          date: h.date,
          type: h.type,
        })));
      }
    } else {
      setPointHistory([]);
    }
  };

  const generateRewardCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  /**
   * Add a customer to a vendor's loyalty program.
   *
   * Strategy:
   * 1. Check if the customer's email matches a registered profile (they have an account).
   *    If yes → use their profile UUID as customer_id in loyalty_records.
   *    This makes the record visible from the customer's side immediately.
   * 2. If no registered profile found → insert into the legacy 'customers' table as before.
   *    When that customer eventually signs up, they'll see the record because we also
   *    check email matching on sign-up (handled in addCustomer's upsert logic).
   */
  const addCustomer = async (customer: Customer, vendorId: string, maxPoints: number) => {
    // Step 1: Look up whether this email already has a profile (registered user)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, name, email, phone')
      .eq('email', customer.email.toLowerCase().trim())
      .single();

    let customerId: string;
    let resolvedCustomer: Customer;

    if (existingProfile) {
      // ── Registered customer: use their real auth UUID ─────────────────────
      customerId = existingProfile.id;
      resolvedCustomer = {
        id: existingProfile.id,
        name: existingProfile.name || customer.name,
        email: existingProfile.email,
        phone: existingProfile.phone || customer.phone,
        joinedDate: new Date().toISOString().split('T')[0],
      };
    } else {
      // ── Unregistered customer: insert into legacy customers table ─────────
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([{
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          joined_date: customer.joinedDate,
          birthday: customer.birthday,
          created_by: vendorId,
        }])
        .select()
        .single();

      if (error || !newCustomer) {
        console.error('[DataContext] Failed to insert customer:', error);
        return;
      }

      customerId = newCustomer.id;
      resolvedCustomer = {
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        joinedDate: newCustomer.joined_date,
        birthday: newCustomer.birthday,
      };
    }

    // Step 2: Check if a loyalty record already exists for this vendor+customer pair
    const { data: existingRecord } = await supabase
      .from('loyalty_records')
      .select('id')
      .eq('vendor_id', vendorId)
      .eq('customer_id', customerId)
      .single();

    if (existingRecord) {
      // Already enrolled — don't create a duplicate
      console.warn('[DataContext] Customer already enrolled with this vendor.');
      return;
    }

    // Step 3: Create the loyalty record
    const { data: newRecord, error: recordError } = await supabase
      .from('loyalty_records')
      .insert([{
        vendor_id: vendorId,
        customer_id: customerId,
        points: 0,
        max_points: maxPoints,
        visits: 0,
      }])
      .select()
      .single();

    if (recordError || !newRecord) {
      console.error('[DataContext] Failed to insert loyalty record:', recordError);
      return;
    }

    // Step 4: Update local state
    setCustomers(prev => {
      if (prev.find(c => c.id === resolvedCustomer.id)) return prev;
      return [...prev, resolvedCustomer];
    });

    setLoyaltyRecords(prev => [
      ...prev,
      {
        id: newRecord.id,
        vendorId: newRecord.vendor_id,
        customerId: newRecord.customer_id,
        points: newRecord.points,
        maxPoints: newRecord.max_points,
        visits: newRecord.visits,
        rewardCode: newRecord.reward_code,
      },
    ]);
  };

  const removeCustomer = async (recordId: string) => {
    await supabase.from('loyalty_records').delete().eq('id', recordId);
    setLoyaltyRecords(prev => prev.filter(r => r.id !== recordId));
    setPointHistory(prev => prev.filter(h => h.recordId !== recordId));
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

      setLoyaltyRecords(prev =>
        prev.map(r =>
          r.id === recordId ? { ...r, points: newPoints, visits: newVisits, rewardCode } : r
        )
      );

      if (newHistory) {
        setPointHistory(prev => [
          { id: newHistory.id, recordId: newHistory.record_id, date: newHistory.date, type: newHistory.type },
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

      setPointHistory(prev => prev.filter(h => h.id !== historyId));
      setLoyaltyRecords(prev =>
        prev.map(r =>
          r.id === recordId ? { ...r, points: newPoints, rewardCode: rewardCode || undefined } : r
        )
      );
    }
  };

  const redeemReward = async (recordId: string) => {
    const record = loyaltyRecords.find(r => r.id === recordId);
    if (record && record.points >= record.maxPoints) {
      const newVisits = record.visits + 1;

      await supabase
        .from('loyalty_records')
        .update({ points: 0, visits: newVisits, reward_code: null })
        .eq('id', recordId);

      const { data: newHistory } = await supabase
        .from('point_history')
        .insert([{ record_id: recordId, date: new Date().toISOString(), type: 'redeemed' }])
        .select()
        .single();

      setLoyaltyRecords(prev =>
        prev.map(r =>
          r.id === recordId ? { ...r, points: 0, visits: newVisits, rewardCode: undefined } : r
        )
      );

      if (newHistory) {
        setPointHistory(prev => [
          { id: newHistory.id, recordId: newHistory.record_id, date: newHistory.date, type: newHistory.type },
          ...prev,
        ]);
      }
    }
  };

  const resetPoints = async (recordId: string) => {
    await supabase.from('loyalty_records').update({ points: 0, reward_code: null }).eq('id', recordId);
    setLoyaltyRecords(prev =>
      prev.map(r => r.id === recordId ? { ...r, points: 0, rewardCode: undefined } : r)
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
