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
  maxPoints?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let fetchProfilePromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        executeFetchProfile(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        executeFetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const executeFetchProfile = async (userId: string, email: string) => {
    if (fetchProfilePromise) {
      await fetchProfilePromise;
      return;
    }
    
    fetchProfilePromise = fetchProfile(userId, email);
    try {
      await fetchProfilePromise;
    } finally {
      fetchProfilePromise = null;
    }
  };

  const fetchProfile = async (userId: string, email: string) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const savedRole = localStorage.getItem('signup_role') as UserRole | null;
      const savedBusinessName = localStorage.getItem('signup_businessName') || '';
      const savedMaxPoints = parseInt(localStorage.getItem('signup_maxPoints') || '3', 10);

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, let's create it
        const roleToUse = savedRole || 'customer';
        
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const metadataName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || '';

        const newProfile = {
          id: userId,
          email,
          role: roleToUse,
          name: metadataName || savedBusinessName || email.split('@')[0],
          business_name: roleToUse === 'vendor' ? savedBusinessName : null,
          max_points: roleToUse === 'vendor' ? savedMaxPoints : null,
        };

        const { data: insertedData, error: insertError } = await supabase
          .from('profiles')
          .upsert([newProfile])
          .select()
          .single();

        if (!insertError && insertedData) {
          data = insertedData;
        } else if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      } else if (data && savedRole) {
        // Profile exists (likely created by a DB trigger), but we have signup data in localStorage
        // We need to update the profile with the correct role and business name
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const metadataName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || '';
        
        const updateData = {
          role: savedRole,
          name: metadataName || savedBusinessName || email.split('@')[0],
          business_name: savedRole === 'vendor' ? savedBusinessName : null,
          max_points: savedRole === 'vendor' ? savedMaxPoints : null,
        };

        const { data: updatedData, error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (!updateError && updatedData) {
          data = updatedData;
        } else if (updateError) {
          console.error('Error updating profile from trigger:', updateError);
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
      }

      // Clear local storage after profile is fetched or created
      localStorage.removeItem('signup_role');
      localStorage.removeItem('signup_businessName');
      localStorage.removeItem('signup_maxPoints');

      if (data) {
        setUser({
          id: data.id,
          name: data.name || '',
          email: data.email || email,
          role: data.role,
          phone: data.phone,
          businessName: data.business_name,
          planType: data.plan_type,
          maxPoints: data.max_points,
        });
      } else {
        // Fallback if profile creation failed
        setUser({
          id: userId,
          name: '',
          email: email,
          role: 'customer',
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
    // This is just to trigger a profile fetch manually if needed.
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      executeFetchProfile(authUser.id, email);
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
        max_points: data.maxPoints,
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
