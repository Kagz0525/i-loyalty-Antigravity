import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, UserCircle2, Eye, EyeOff, Info, ChevronDown, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

// ─── localStorage key for saving test emails ───────────────────────────────
const TEST_EMAILS_KEY = 'dev_test_emails';

function getSavedEmails(): string[] {
  try {
    return JSON.parse(localStorage.getItem(TEST_EMAILS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveEmail(email: string) {
  const existing = getSavedEmails();
  if (!existing.includes(email)) {
    localStorage.setItem(TEST_EMAILS_KEY, JSON.stringify([email, ...existing].slice(0, 20)));
  }
}

function removeEmail(email: string) {
  const updated = getSavedEmails().filter(e => e !== email);
  localStorage.setItem(TEST_EMAILS_KEY, JSON.stringify(updated));
}

// ─── Google icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthMode = 'sign-in' | 'sign-up';
type SignUpStep = 'role' | 'details';

// ─── Combo Email Input Component ──────────────────────────────────────────────
interface ComboEmailInputProps {
  value: string;
  onChange: (val: string) => void;
  id: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

function ComboEmailInput({ value, onChange, id, placeholder, required, autoComplete }: ComboEmailInputProps) {
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSavedEmails(getSavedEmails());
  }, []);

  useEffect(() => {
    if (value.trim() === '') {
      setFilteredEmails(savedEmails);
    } else {
      setFilteredEmails(savedEmails.filter(e => e.toLowerCase().includes(value.toLowerCase())));
    }
  }, [value, savedEmails]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    removeEmail(email);
    setSavedEmails(getSavedEmails());
  };

  const hasSuggestions = filteredEmails.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <input
          id={id}
          name="email"
          type="email"
          autoComplete={autoComplete || 'off'}
          required={required}
          value={value}
          onChange={(e) => { onChange(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm pr-9"
          placeholder={placeholder}
        />
        {savedEmails.length > 0 && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowDropdown(prev => !prev)}
            className="absolute right-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {showDropdown && hasSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Test accounts</span>
          </div>
          <ul className="max-h-44 overflow-y-auto">
            {filteredEmails.map((email) => (
              <li key={email} className="flex items-center justify-between px-3 py-2 hover:bg-orange-50 cursor-pointer group">
                <button
                  type="button"
                  className="flex-1 text-left text-sm text-gray-700 group-hover:text-orange-700 truncate"
                  onClick={() => { onChange(email); setShowDropdown(false); }}
                >
                  {email}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, email)}
                  className="ml-2 text-gray-300 hover:text-red-400 focus:outline-none flex-shrink-0"
                  title="Remove from list"
                >
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Login() {
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('role');

  // Form fields
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [maxPoints, setMaxPoints] = useState(3);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setMaxPoints(3);
    setRole('customer');
    setSignUpStep('role');
    setError(null);
    setSuccessMessage(null);
  };

  const switchMode = (mode: AuthMode) => {
    resetForm();
    setAuthMode(mode);
  };

  /** Store pre-auth data so AuthContext can read it after OAuth redirect. */
  const storeSignupData = () => {
    localStorage.setItem('signup_role', role);
    localStorage.setItem('signup_name', fullName);
    if (role === 'vendor') {
      localStorage.setItem('signup_businessName', fullName);
      localStorage.setItem('signup_maxPoints', maxPoints.toString());
    }
  };

  // ─── Email sign-up ──────────────────────────────────────────────────────────

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!fullName.trim()) {
      setError(role === 'vendor' ? 'Please enter your business name.' : 'Please enter your full name.');
      return;
    }

    setLoading(true);
    storeSignupData();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          name: fullName,
          ...(role === 'vendor' && {
            business_name: fullName,
            max_points: maxPoints,
          }),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Email confirmation is OFF — user is logged in immediately.
    // Save email to test accounts list and navigate home.
    if (data.user) {
      saveEmail(email);
      navigate('/');
    } else {
      // Fallback: in rare cases session isn't immediately available
      setSuccessMessage('Account created! You can now sign in.');
      setLoading(false);
    }
  };

  // ─── Email sign-in ──────────────────────────────────────────────────────────

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Save email to test dropdown list on every successful sign-in
    saveEmail(email);
    navigate('/');
  };

  // ─── Google auth ────────────────────────────────────────────────────────────

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);

    if (authMode === 'sign-up') {
      storeSignupData();
    }

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          ...(authMode === 'sign-up' && { prompt: 'select_account' }),
        },
      },
    });

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
  };

  // ─── Render: role selector ──────────────────────────────────────────────────

  const renderRoleSelector = () => (
    <div className="flex flex-col space-y-4">
      <p className="text-center text-sm text-gray-600 font-medium">I am signing up as a…</p>
      <button
        type="button"
        onClick={() => { setRole('customer'); setSignUpStep('details'); setError(null); }}
        className="flex items-start p-4 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
      >
        <UserCircle2 className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400" />
        <div>
          <span className="font-bold block text-gray-900">Customer</span>
          <span className="text-sm mt-1 block">I want to view and track my loyalty points</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => { setRole('vendor'); setSignUpStep('details'); setError(null); }}
        className="flex items-start p-4 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
      >
        <Store className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400" />
        <div>
          <span className="font-bold block text-gray-900">Vendor</span>
          <span className="text-sm mt-1 block">I want to manage customer points (e.g. Hair salon, Car wash)</span>
        </div>
      </button>
    </div>
  );

  // ─── Render: sign-up details ────────────────────────────────────────────────

  const renderSignUpDetails = () => (
    <>
      <button
        type="button"
        onClick={() => { setSignUpStep('role'); setError(null); }}
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="text-center mb-4">
        <p className="text-sm font-medium text-gray-700">
          Signing up as a <span className="text-orange-600 font-bold capitalize">{role}</span>
        </p>
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 mb-4"
      >
        <GoogleIcon />
        {role === 'vendor' ? 'Sign up as Vendor with Google' : 'Sign up as Customer with Google'}
      </button>

      {role === 'vendor' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-xs text-orange-800">
          <strong>Note:</strong> Fill in your Business Name and Max Points below <em>before</em> clicking the Google button — they will be saved to your profile.
        </div>
      )}

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleEmailSignUp}>
        {/* Vendor max points slider */}
        {role === 'vendor' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              How many points must a customer accumulate to redeem a reward?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range" id="maxPoints" min="3" max="10" value={maxPoints}
                onChange={(e) => setMaxPoints(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <span className="font-bold text-orange-600 w-8 text-center text-lg">{maxPoints}</span>
            </div>
          </div>
        )}

        {/* Name field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            {role === 'vendor' ? (
              <>
                Business name
                <div className="relative ml-1 group">
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 pointer-events-none">
                    If your business doesn't have a name, use your full name
                  </div>
                </div>
              </>
            ) : 'Full name'}
          </label>
          <input
            id="fullName" name="fullName" type="text" required value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm"
            placeholder={role === 'vendor' ? "e.g. Joe's Car Wash" : 'John Doe'}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            id="signup-email" name="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              id="signup-password" type={showPassword ? 'text' : 'password'}
              autoComplete="new-password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm pr-10"
              placeholder="••••••••"
            />
            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password" required value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm pr-10"
              placeholder="••••••••"
            />
            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
        {successMessage && <div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-lg border border-green-200">{successMessage}</div>}

        <button
          type="submit" disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </>
  );

  // ─── Render: sign-in ────────────────────────────────────────────────────────

  const renderSignIn = () => (
    <>
      {/* Google sign-in */}
      <button
        type="button" onClick={handleGoogleAuth} disabled={loading}
        className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 mb-4"
      >
        <GoogleIcon />Sign in with Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with email</span></div>
      </div>

      <form className="space-y-5" onSubmit={handleEmailSignIn}>
        {/* Combo email input */}
        <div>
          <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <ComboEmailInput
            id="signin-email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
            autoComplete="off"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              id="signin-password" type={showPassword ? 'text' : 'password'}
              autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm pr-10"
              placeholder="••••••••"
            />
            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input id="remember-me" type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
          </div>
          <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">Forgot your password?</a>
        </div>

        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

        <button
          type="submit" disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </>
  );

  // ─── Main render ─────────────────────────────────────────────────────────────

  const isSignUp = authMode === 'sign-up';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => switchMode(isSignUp ? 'sign-in' : 'sign-up')}
              className="font-medium text-orange-600 hover:text-orange-500 focus:outline-none"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Body */}
        {isSignUp
          ? (signUpStep === 'role' ? renderRoleSelector() : renderSignUpDetails())
          : renderSignIn()}
      </div>
    </div>
  );
}
