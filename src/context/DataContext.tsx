import { createContext, useContext, useState, ReactNode } from 'react';

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

const initialVendors: Vendor[] = [
  { id: 'v1', name: 'Joe', email: 'joe@coffee.com', businessName: "Joe's Coffee", phone: '081 111 2222' },
  { id: 'v2', name: 'Sarah', email: 'sarah@bakery.com', businessName: "Sarah's Bakery", phone: '081 222 3333' },
  { id: 'v3', name: 'Mike', email: 'mike@burger.com', businessName: "Mike's Burgers", phone: '081 333 4444' },
];

const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Alice Smith', email: 'alice@test.com', phone: '081 111 2222', joinedDate: '2023-05-03', birthday: '1990-05-08' },
  { id: 'c2', name: 'Bob Jones', email: 'bob@test.com', phone: '081 222 3333', joinedDate: '2023-06-15' },
  { id: 'c3', name: 'Charlie Brown', email: 'charlie@test.com', phone: '081 333 4444', joinedDate: '2023-08-20' },
  { id: 'c4', name: 'Diana Prince', email: 'diana@test.com', phone: '081 444 5555', joinedDate: '2024-01-10' },
  { id: 'c5', name: 'Evan Wright', email: 'evan@test.com', phone: '081 555 6666', joinedDate: '2024-02-14' },
];

const initialRecords: LoyaltyRecord[] = [
  { id: 'r1', vendorId: 'v1', customerId: 'c1', points: 3, maxPoints: 10, visits: 5 },
  { id: 'r2', vendorId: 'v1', customerId: 'c2', points: 10, maxPoints: 10, visits: 12 },
  { id: 'r3', vendorId: 'v1', customerId: 'c3', points: 7, maxPoints: 10, visits: 8 },
  { id: 'r4', vendorId: 'v2', customerId: 'c1', points: 5, maxPoints: 8, visits: 6 },
  { id: 'r5', vendorId: 'v3', customerId: 'c1', points: 1, maxPoints: 5, visits: 1 },
];

const initialHistory: PointHistory[] = [
  { id: 'h1', recordId: 'r1', date: '2025-08-30T04:43:00Z', type: 'earned' },
  { id: 'h2', recordId: 'r1', date: '2025-09-07T09:33:00Z', type: 'earned' },
  { id: 'h3', recordId: 'r1', date: '2025-10-18T14:09:00Z', type: 'earned' },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [vendors] = useState<Vendor[]>(initialVendors);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loyaltyRecords, setLoyaltyRecords] = useState<LoyaltyRecord[]>(initialRecords);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>(initialHistory);

  const addCustomer = (customer: Customer, vendorId: string, maxPoints: number) => {
    setCustomers((prev) => [...prev, customer]);
    setLoyaltyRecords((prev) => [
      ...prev,
      {
        id: `r${Date.now()}`,
        vendorId,
        customerId: customer.id,
        points: 0,
        maxPoints,
        visits: 0,
      },
    ]);
  };

  const removeCustomer = (recordId: string) => {
    setLoyaltyRecords((prev) => prev.filter((r) => r.id !== recordId));
    setPointHistory((prev) => prev.filter((h) => h.recordId !== recordId));
  };

  const addPoint = (recordId: string, date?: string) => {
    setLoyaltyRecords((prev) =>
      prev.map((record) =>
        record.id === recordId && record.points < record.maxPoints
          ? { ...record, points: record.points + 1, visits: record.visits + 1 }
          : record
      )
    );
    setPointHistory((prev) => [
      {
        id: `h${Date.now()}`,
        recordId,
        date: date || new Date().toISOString(),
        type: 'earned',
      },
      ...prev,
    ]);
  };

  const removePoint = (historyId: string, recordId: string) => {
    setPointHistory((prev) => prev.filter((h) => h.id !== historyId));
    setLoyaltyRecords((prev) =>
      prev.map((record) =>
        record.id === recordId && record.points > 0
          ? { ...record, points: record.points - 1 }
          : record
      )
    );
  };

  const redeemReward = (recordId: string) => {
    setLoyaltyRecords((prev) =>
      prev.map((record) =>
        record.id === recordId && record.points >= record.maxPoints
          ? { ...record, points: 0, visits: record.visits + 1 }
          : record
      )
    );
    setPointHistory((prev) => [
      {
        id: `h${Date.now()}`,
        recordId,
        date: new Date().toISOString(),
        type: 'redeemed',
      },
      ...prev,
    ]);
  };

  const resetPoints = (recordId: string) => {
    setLoyaltyRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? { ...record, points: 0 }
          : record
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
