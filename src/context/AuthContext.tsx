import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

export type UserRole = 'vendor' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
  profilePic?: string;
  planType?: 'Starter' | 'Pro';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name || '',
          email: data.email || email,
          role: data.role,
          phone: data.phone,
          businessName: data.business_name,
          planType: data.plan_type,
        });
      } else {
        // Fallback if profile doesn't exist yet
        setUser({
          id: userId,
          name: '',
          email: email,
          role: 'customer', // Default fallback
        });
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, role: UserRole) => {
    // The actual login is handled in Login.tsx via Supabase Auth.
    // This is just to update the local state immediately or handle profile creation if needed.
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      // Try to create profile if it doesn't exist
      const { error } = await supabase.from('profiles').insert([
        { id: authUser.id, email, role, name: email.split('@')[0] }
      ]).select().single();
      
      if (!error) {
        fetchProfile(authUser.id, email);
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const updates = {
        name: data.name,
        phone: data.phone,
        business_name: data.businessName,
        plan_type: data.planType,
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (!error) {
        setUser({ ...user, ...data });
      } else {
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
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
