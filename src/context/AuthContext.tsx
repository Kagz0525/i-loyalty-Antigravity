import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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

// Track whether a profile fetch is already in progress so we don't double-fetch
let fetchInProgress = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // ─── No session → signed out ─────────────────────────────────────────
      if (!session?.user) {
        currentUserId.current = null;
        fetchInProgress = false;
        setUser(null);
        setLoading(false);
        return;
      }

      // ─── TOKEN_REFRESHED: Supabase silently refreshes tokens regularly.
      //     Skip re-fetching the profile — user data hasn't changed.
      if (event === 'TOKEN_REFRESHED') {
        return;
      }

      // ─── If we already loaded this exact user, skip re-fetching ──────────
      //     This prevents double-fetches when Supabase fires multiple events.
      if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION' && currentUserId.current === session.user.id) {
        return;
      }

      // ─── Guard against concurrent fetches ────────────────────────────────
      if (fetchInProgress) return;
      fetchInProgress = true;
      currentUserId.current = session.user.id;
      setLoading(true);

      const isNewUser = event === 'SIGNED_IN';

      try {
        await withTimeout(
          fetchAndSyncProfile(session.user.id, session.user.email || '', isNewUser, setUser),
          12000, // 12 second hard timeout
          `Profile load timed out for ${session.user.email}`
        );
      } catch (err) {
        console.error('[AuthContext] Profile fetch failed or timed out:', err);
        // Fallback: create a minimal user so the app doesn't hang
        const meta = session.user.user_metadata || {};
        const fallbackName = meta.full_name || meta.name || (session.user.email || '').split('@')[0];
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: fallbackName,
          role: (meta.role as UserRole) || 'customer',
          businessName: meta.business_name || undefined,
          maxPoints: meta.max_points ?? undefined,
        });
      } finally {
        fetchInProgress = false;
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (_email: string, _role: UserRole) => {
    // Handled by onAuthStateChange
  };

  const logout = async () => {
    currentUserId.current = null;
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

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (!error) {
        setUser({ ...user, ...data });
      } else {
        console.error('[AuthContext] Error updating profile:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Races a promise against a timeout. Rejects with message if timeout wins. */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

/**
 * Fetches or creates the user profile in Supabase.
 * Priority for name/role: localStorage (pre-OAuth) → auth metadata → fallback
 */
async function fetchAndSyncProfile(
  userId: string,
  email: string,
  isNewUser: boolean,
  setUser: (u: User) => void
): Promise<void> {
  // 1. Read pre-auth localStorage data (set before Google OAuth redirect)
  const savedRole = localStorage.getItem('signup_role') as UserRole | null;
  const savedName = localStorage.getItem('signup_name') || '';
  const savedBusinessName = localStorage.getItem('signup_businessName') || '';
  const savedMaxPoints = parseInt(localStorage.getItem('signup_maxPoints') || '3', 10);
  const hasLocalData = !!savedRole;

  // 2. Read auth metadata (set during signUp() or from Google)
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const meta = authUser?.user_metadata || {};

  // 3. Resolve final values
  const resolvedRole: UserRole = savedRole || (meta.role as UserRole) || 'customer';
  const googleName = meta.full_name || meta.name || '';

  let resolvedName = '';
  let resolvedBusinessName: string | null = null;
  let resolvedMaxPoints: number | null = null;

  if (resolvedRole === 'vendor') {
    resolvedBusinessName = savedBusinessName || meta.business_name || googleName || email.split('@')[0];
    resolvedName = savedName || resolvedBusinessName;
    resolvedMaxPoints = hasLocalData ? savedMaxPoints : (parseInt(meta.max_points || '3', 10));
  } else {
    resolvedName = savedName || googleName || email.split('@')[0];
  }

  // 4. Fetch existing profile from DB
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  let profileData: any = null;

  if (fetchError?.code === 'PGRST116') {
    // Profile doesn't exist → create it
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert([{
        id: userId, email, role: resolvedRole, name: resolvedName,
        business_name: resolvedRole === 'vendor' ? resolvedBusinessName : null,
        max_points: resolvedRole === 'vendor' ? resolvedMaxPoints : null,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('[AuthContext] Insert error:', insertError);
    } else {
      profileData = inserted;
    }
  } else if (existing) {
    profileData = existing;

    // On new sign-ups, sync localStorage/metadata into the profile
    if (hasLocalData || isNewUser) {
      const patch: any = { role: resolvedRole };
      if (resolvedName) patch.name = resolvedName;
      if (resolvedRole === 'vendor') {
        if (resolvedBusinessName) patch.business_name = resolvedBusinessName;
        if (resolvedMaxPoints) patch.max_points = resolvedMaxPoints;
      }

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('[AuthContext] Update error:', updateError);
      } else if (updated) {
        profileData = updated;
      }
    }
  } else if (fetchError) {
    console.error('[AuthContext] Fetch error:', fetchError);
  }

  // 5. Clear localStorage
  if (hasLocalData) {
    ['signup_role', 'signup_name', 'signup_businessName', 'signup_maxPoints']
      .forEach(k => localStorage.removeItem(k));
  }

  // 6. Set user in state
  const p = profileData;
  if (p) {
    setUser({
      id: p.id,
      name: p.name || resolvedName,
      email: p.email || email,
      role: p.role as UserRole,
      phone: p.phone,
      businessName: p.business_name || undefined,
      planType: p.plan_type,
      maxPoints: p.max_points ?? undefined,
    });
  } else {
    // Fallback if DB completely failed
    setUser({
      id: userId, email, name: resolvedName, role: resolvedRole,
      businessName: resolvedBusinessName || undefined,
      maxPoints: resolvedMaxPoints || undefined,
    });
  }
}
