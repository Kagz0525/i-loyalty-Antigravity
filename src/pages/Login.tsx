import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, UserCircle2, Eye, EyeOff, Info, ChevronDown, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// ─── Test email persistence (survives navigation, cleared only by "Clear site data") ───
const TEST_EMAILS_KEY = 'iloyalty_test_emails';

function getSavedEmails(): string[] {
  try { return JSON.parse(localStorage.getItem(TEST_EMAILS_KEY) || '[]'); }
  catch { return []; }
}
function saveEmail(email: string) {
  const list = getSavedEmails();
  if (!list.includes(email)) {
    localStorage.setItem(TEST_EMAILS_KEY, JSON.stringify([email, ...list].slice(0, 20)));
  }
}
function removeEmail(email: string) {
  localStorage.setItem(TEST_EMAILS_KEY, JSON.stringify(getSavedEmails().filter(e => e !== email)));
}

// ─── Google icon ──────────────────────────────────────────────────────────────
const GoogleIcon = ({ greyed = false }: { greyed?: boolean }) => (
  <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24">
    <path fill={greyed ? '#9CA3AF' : '#4285F4'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill={greyed ? '#9CA3AF' : '#34A853'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill={greyed ? '#9CA3AF' : '#FBBC05'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill={greyed ? '#9CA3AF' : '#EA4335'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─── Combo email input ────────────────────────────────────────────────────────
function ComboEmailInput({ value, onChange, id, placeholder }: {
  value: string; onChange: (v: string) => void; id: string; placeholder?: string;
}) {
  const [saved, setSaved] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setSaved(getSavedEmails()); }, []);

  const filtered = value.trim()
    ? saved.filter(e => e.toLowerCase().includes(value.toLowerCase()))
    : saved;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    removeEmail(email);
    setSaved(getSavedEmails());
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center">
        <input
          id={id} type="email" autoComplete="off" required
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm pr-9"
        />
        {saved.length > 0 && (
          <button type="button" tabIndex={-1} onClick={() => setOpen(p => !p)}
            className="absolute right-2.5 text-gray-400 hover:text-gray-600 focus:outline-none">
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Test accounts</span>
          </div>
          <ul className="max-h-44 overflow-y-auto">
            {filtered.map(email => (
              <li key={email} className="flex items-center justify-between px-3 py-2 hover:bg-orange-50 group cursor-pointer">
                <button type="button"
                  className="flex-1 text-left text-sm text-gray-700 group-hover:text-orange-700 truncate"
                  onClick={() => { onChange(email); setOpen(false); }}>
                  {email}
                </button>
                <button type="button" onClick={e => handleDelete(e, email)}
                  className="ml-2 text-gray-300 hover:text-red-400 flex-shrink-0" title="Remove">
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
      <div className="relative flex justify-center text-xs">
        <span className="px-3 bg-white text-gray-400 font-medium uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthMode = 'sign-in' | 'sign-up';
type SignUpStep = 'role' | 'details';

// ─── Main component ───────────────────────────────────────────────────────────
export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect as soon as profile is loaded — avoids the need to call navigate()
  // inside async handlers (which caused the "hanging sign-in" bug)
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('role');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');   // name or business name
  const [maxPoints, setMaxPoints] = useState(3);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setFullName(''); setMaxPoints(3); setRole('customer');
    setSignUpStep('role'); setError(null); setSubmitting(false);
  };

  const switchMode = (mode: AuthMode) => { resetForm(); setAuthMode(mode); };

  const storeSignupData = () => {
    localStorage.setItem('signup_role', role);
    localStorage.setItem('signup_name', fullName);
    if (role === 'vendor') {
      localStorage.setItem('signup_businessName', fullName);
      localStorage.setItem('signup_maxPoints', maxPoints.toString());
    }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (!fullName.trim()) { setError(role === 'vendor' ? 'Please enter your business name.' : 'Please enter your full name.'); return; }

    setSubmitting(true);
    storeSignupData();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          role, full_name: fullName, name: fullName,
          ...(role === 'vendor' && { business_name: fullName, max_points: maxPoints }),
        },
      },
    });

    if (signUpError) { setError(signUpError.message); setSubmitting(false); return; }
    if (data.user) saveEmail(email);
    // useEffect above will navigate once AuthContext sets the user
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) { setError(signInError.message); setSubmitting(false); return; }
    saveEmail(email);
    // useEffect above will navigate once AuthContext sets the user
    // Don't call navigate() here — let AuthContext finish loading first
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSubmitting(true);
    if (authMode === 'sign-up') storeSignupData();

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { ...(authMode === 'sign-up' && { prompt: 'select_account' }) },
      },
    });

    if (googleError) { setError(googleError.message); setSubmitting(false); }
  };

  // ─── Password field ───────────────────────────────────────────────────────
  const PasswordField = ({ id, label, value, onChange, show, onToggleShow, autocomplete }: {
    id: string; label: string; value: string; onChange: (v: string) => void;
    show: boolean; onToggleShow: () => void; autocomplete: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} autoComplete={autocomplete} required
          value={value} onChange={e => onChange(e.target.value)}
          className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm pr-10"
          placeholder="••••••••" />
        <button type="button" onClick={onToggleShow}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );

  // ─── Sign-in form ─────────────────────────────────────────────────────────
  const renderSignIn = () => (
    <form className="space-y-5" onSubmit={handleEmailSignIn}>
      <div>
        <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <ComboEmailInput id="signin-email" value={email} onChange={setEmail} placeholder="you@example.com" />
      </div>

      <PasswordField id="signin-password" label="Password" value={password}
        onChange={setPassword} show={showPassword} onToggleShow={() => setShowPassword(p => !p)}
        autocomplete="current-password" />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded" />
          Remember me
        </label>
        <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">Forgot your password?</a>
      </div>

      {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-60">
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>

      <Divider label="or" />

      <button type="button" onClick={handleGoogleAuth} disabled={submitting}
        className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-colors disabled:opacity-60">
        <GoogleIcon />Sign in with Google
      </button>
    </form>
  );

  // ─── Sign-up: role selector ───────────────────────────────────────────────
  const renderRoleSelector = () => (
    <div className="flex flex-col space-y-4">
      <p className="text-center text-sm text-gray-500 font-medium">I am signing up as a…</p>
      {([
        { r: 'customer' as const, icon: <UserCircle2 className="w-6 h-6" />, title: 'Customer', desc: 'I want to view and track my loyalty points' },
        { r: 'vendor' as const, icon: <Store className="w-6 h-6" />, title: 'Vendor', desc: 'I want to manage customer points (e.g. Hair salon, Car wash)' },
      ]).map(({ r, icon, title, desc }) => (
        <button key={r} type="button"
          onClick={() => { setRole(r); setSignUpStep('details'); setError(null); }}
          className="flex items-start p-4 rounded-xl border-2 border-gray-200 text-left hover:border-orange-300 hover:bg-orange-50 transition-all group">
          <span className="mr-3 mt-0.5 text-gray-400 group-hover:text-orange-500 flex-shrink-0">{icon}</span>
          <div>
            <span className="font-bold block text-gray-900">{title}</span>
            <span className="text-sm mt-0.5 block text-gray-500">{desc}</span>
          </div>
        </button>
      ))}
    </div>
  );

  // ─── Sign-up: customer details ────────────────────────────────────────────
  const renderCustomerDetails = () => (
    <form className="space-y-5" onSubmit={handleEmailSignUp}>
      <div>
        <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
        <input id="customer-name" type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
          className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
          placeholder="John Doe" />
      </div>
      <div>
        <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <input id="customer-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
          className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
          placeholder="you@example.com" />
      </div>
      <PasswordField id="customer-pass" label="Password" value={password}
        onChange={setPassword} show={showPassword} onToggleShow={() => setShowPassword(p => !p)} autocomplete="new-password" />
      <PasswordField id="customer-confirm" label="Confirm Password" value={confirmPassword}
        onChange={setConfirmPassword} show={showConfirm} onToggleShow={() => setShowConfirm(p => !p)} autocomplete="new-password" />

      {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-60">
        {submitting ? 'Creating account…' : 'Create account'}
      </button>

      <Divider label="or" />

      <button type="button" onClick={handleGoogleAuth} disabled={submitting}
        className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-colors disabled:opacity-60">
        <GoogleIcon />Sign up with Google
      </button>
    </form>
  );

  // ─── Sign-up: vendor details ──────────────────────────────────────────────
  const renderVendorDetails = () => {
    const googleEnabled = fullName.trim().length > 0;

    return (
      <div className="space-y-5">
        {/* Max points slider */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            How many points must a customer accumulate to redeem a reward?
          </label>
          <div className="flex items-center gap-4">
            <input type="range" min="3" max="10" value={maxPoints}
              onChange={e => setMaxPoints(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
            <span className="font-bold text-orange-600 w-8 text-center text-xl">{maxPoints}</span>
          </div>
        </div>

        {/* Business name */}
        <div>
          <label htmlFor="biz-name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            Business name
            <div className="relative ml-1 group">
              <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 pointer-events-none whitespace-normal">
                If your business doesn't have a name, use your full name
              </div>
            </div>
          </label>
          <input id="biz-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
            placeholder="e.g. Joe's Car Wash" />
        </div>

        {/* Continue with Google */}
        <button type="button" onClick={handleGoogleAuth}
          disabled={submitting || !googleEnabled}
          className={`w-full flex items-center justify-center py-2.5 px-4 border rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400
            ${googleEnabled
              ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'}`}>
          <GoogleIcon greyed={!googleEnabled} />
          Continue with Google
        </button>

        <Divider label="or sign up with email" />

        {/* Email sign-up form for vendor */}
        <form className="space-y-4" onSubmit={e => {
          // fullName is already set from business name field above
          handleEmailSignUp(e);
        }}>
          <div>
            <label htmlFor="vendor-email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input id="vendor-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
              placeholder="you@example.com" />
          </div>
          <PasswordField id="vendor-pass" label="Password" value={password}
            onChange={setPassword} show={showPassword} onToggleShow={() => setShowPassword(p => !p)} autocomplete="new-password" />
          <PasswordField id="vendor-confirm" label="Confirm Password" value={confirmPassword}
            onChange={setConfirmPassword} show={showConfirm} onToggleShow={() => setShowConfirm(p => !p)} autocomplete="new-password" />

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <button type="submit" disabled={submitting || !fullName.trim()}
            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-60">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  const isSignUp = authMode === 'sign-up';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => switchMode(isSignUp ? 'sign-in' : 'sign-up')}
              className="font-semibold text-orange-600 hover:text-orange-500 focus:outline-none">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Back button + role chip when in sign-up details */}
        {isSignUp && signUpStep === 'details' && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => { setSignUpStep('role'); setError(null); }}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              ← Back
            </button>
            <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${role === 'vendor' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
              {role === 'vendor' ? '🏪 Vendor' : '👤 Customer'}
            </span>
          </div>
        )}

        {/* Body */}
        {!isSignUp && renderSignIn()}
        {isSignUp && signUpStep === 'role' && renderRoleSelector()}
        {isSignUp && signUpStep === 'details' && role === 'customer' && renderCustomerDetails()}
        {isSignUp && signUpStep === 'details' && role === 'vendor' && renderVendorDetails()}
      </div>
    </div>
  );
}
