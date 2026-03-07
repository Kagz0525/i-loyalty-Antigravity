import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'vendor' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, role: UserRole) => {
    // Dummy login logic
    const dummyUser: User = {
      id: role === 'vendor' ? 'v1' : 'c1',
      name: role === 'vendor' ? "Joe's Coffee" : 'Alice Smith',
      email,
      role,
      businessName: role === 'vendor' ? "Joe's Coffee" : undefined,
      phone: '081 111 2222',
    };
    setUser(dummyUser);
  };

  const logout = () => setUser(null);

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
