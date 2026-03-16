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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes – this fires on page load (INITIAL_SESSION)
    // as well as on sign-in / sign-out / token refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const isNewUser = event === 'SIGNED_IN' || event === 'USER_UPDATED';
        await fetchAndSyncProfile(session.user.id, session.user.email || '', isNewUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Fetches the profile from Supabase. If none exists, creates it using:
   *   1. Supabase Auth user_metadata (set during signUp or Google OAuth)
   *   2. localStorage fallback (for Google vendor pre-auth data)
   *
   * If a profile already exists but was just created (isNewUser), we still
   * update it with localStorage data so that DB triggers don't win.
   */
  const fetchAndSyncProfile = async (userId: string, email: string, isNewUser: boolean) => {
    try {
      // Pull pre-auth data from localStorage (set before OAuth redirect)
      const savedRole = localStorage.getItem('signup_role') as UserRole | null;
      const savedName = localStorage.getItem('signup_name') || '';
      const savedBusinessName = localStorage.getItem('signup_businessName') || '';
      const savedMaxPoints = parseInt(localStorage.getItem('signup_maxPoints') || '3', 10);
      const hasLocalStorageData = !!savedRole;

      // Get Supabase Auth metadata (works for both email & Google sign-ups)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const meta = authUser?.user_metadata || {};

      // Resolve values with priority: localStorage > auth metadata > fallbacks
      const resolvedRole: UserRole = savedRole || (meta.role as UserRole) || 'customer';
      const googleName = meta.full_name || meta.name || '';

      // For name: customers use their google name or the name they typed
      // For vendors: use savedBusinessName (they typed it pre-auth)
      let resolvedName = '';
      let resolvedBusinessName: string | null = null;
      let resolvedMaxPoints: number | null = null;

      if (resolvedRole === 'vendor') {
        // Business name comes from localStorage or metadata
        resolvedBusinessName = savedBusinessName || meta.business_name || googleName || email.split('@')[0];
        // Vendor's "name" is their business name
        resolvedName = savedName || resolvedBusinessName;
        resolvedMaxPoints = savedMaxPoints || parseInt(meta.max_points || '3', 10);
      } else {
        // Customer name: metadata from Google, or the name they typed (in metadata.name via signUp)
        resolvedName = savedName || googleName || meta.full_name || email.split('@')[0];
      }

      // Fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      let profileData: any = null;

      if (fetchError && fetchError.code === 'PGRST116') {
        // No profile exists – create one
        const newProfile = {
          id: userId,
          email,
          role: resolvedRole,
          name: resolvedName,
          business_name: resolvedRole === 'vendor' ? resolvedBusinessName : null,
          max_points: resolvedRole === 'vendor' ? resolvedMaxPoints : null,
        };

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .upsert([newProfile])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          profileData = inserted;
        }
      } else if (existingProfile) {
        profileData = existingProfile;

        // If we have fresh signup data in localStorage, always update the profile
        // This handles the case where a DB trigger pre-created the profile
        if (hasLocalStorageData || isNewUser) {
          const updatePayload: any = {
            role: resolvedRole,
          };

          // Only override name/business if we have real data
          if (resolvedName) updatePayload.name = resolvedName;
          if (resolvedRole === 'vendor') {
            if (resolvedBusinessName) updatePayload.business_name = resolvedBusinessName;
            if (resolvedMaxPoints) updatePayload.max_points = resolvedMaxPoints;
          }

          const { data: updated, error: updateError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', userId)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating profile on sign-up sync:', updateError);
          } else if (updated) {
            profileData = updated;
          }
        }
      } else if (fetchError) {
        console.error('Error fetching profile:', fetchError);
      }

      // Clear localStorage after we've used the data
      if (hasLocalStorageData) {
        localStorage.removeItem('signup_role');
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_businessName');
        localStorage.removeItem('signup_maxPoints');
      }

      if (profileData) {
        setUser({
          id: profileData.id,
          name: profileData.name || resolvedName,
          email: profileData.email || email,
          role: profileData.role as UserRole,
          phone: profileData.phone,
          businessName: profileData.business_name || undefined,
          planType: profileData.plan_type,
          maxPoints: profileData.max_points ?? undefined,
        });
      } else {
        // Last resort fallback
        setUser({
          id: userId,
          name: resolvedName,
          email,
          role: resolvedRole,
          businessName: resolvedBusinessName || undefined,
          maxPoints: resolvedMaxPoints || undefined,
        });
      }
    } catch (err) {
      console.error('Error in fetchAndSyncProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  // login() is called after email sign-in. The onAuthStateChange listener
  // will handle the profile fetch automatically, so this is a no-op now.
  const login = (_email: string, _role: UserRole) => {
    // Auth state change listener handles everything
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.phone !== undefined) updates.phone = data.phone;
      if (data.businessName !== undefined) updates.business_name = data.businessName;
      if (data.planType !== undefined) updates.plan_type = data.planType;
      if (data.maxPoints !== undefined) updates.max_points = data.maxPoints;

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
