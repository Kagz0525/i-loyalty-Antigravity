import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store, UserCircle2, Eye, EyeOff, Info } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [maxPoints, setMaxPoints] = useState(3);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGoogleVendorFields, setShowGoogleVendorFields] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email && password) {
      if (isSignUp && password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      
      setLoading(true);

      if (isSignUp) {
        if (role === 'vendor') {
          localStorage.setItem('signup_role', 'vendor');
          localStorage.setItem('signup_businessName', fullName);
          localStorage.setItem('signup_maxPoints', maxPoints.toString());
        } else {
          localStorage.setItem('signup_role', 'customer');
          localStorage.setItem('signup_businessName', fullName); // For customer, fullName is used as name
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        login(email, role);
        navigate('/');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        let finalRole = role;
        // Mock backend role resolution based on email for dummy accounts
        if (email.toLowerCase().includes('vendor')) {
          finalRole = 'vendor';
        } else {
          finalRole = 'customer';
        }
        
        login(email, finalRole);
        navigate('/');
      }
      
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    let finalRole = role;
    
    if (!isSignUp) {
      finalRole = 'customer'; // Mock default for Google sign in
    } else if (role === 'vendor') {
      if (!showGoogleVendorFields) {
        setShowGoogleVendorFields(true);
        return;
      }
      if (!fullName.trim()) {
        setError("Please enter your Business name before continuing.");
        return;
      }
      localStorage.setItem('signup_role', 'vendor');
      localStorage.setItem('signup_businessName', fullName);
      localStorage.setItem('signup_maxPoints', maxPoints.toString());
    } else if (role === 'customer') {
      localStorage.setItem('signup_role', 'customer');
    }

    setLoading(true);
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
  };

  const showForm = !isSignUp || hasSelectedRole;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setHasSelectedRole(false);
                setError(null);
              }}
              className="font-medium text-orange-600 hover:text-orange-500 focus:outline-none"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {isSignUp && !showGoogleVendorFields && (
          <div className="flex flex-col space-y-4 mb-6">
            {hasSelectedRole && (
              <div className="text-center mb-2">
                <p className="text-lg font-medium text-gray-900">
                  You are signing up as a <span className="text-orange-600 capitalize">{role}</span>
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setRole('customer');
                setHasSelectedRole(true);
                setError(null);
              }}
              className={`flex items-start p-4 rounded-xl border-2 transition-all text-left ${
                hasSelectedRole && role === 'customer'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-500 hover:border-orange-200'
              }`}
            >
              <UserCircle2 className={`w-6 h-6 mr-3 flex-shrink-0 ${hasSelectedRole && role === 'customer' ? 'text-orange-600' : 'text-gray-400'}`} />
              <div>
                <span className="font-bold block text-gray-900">Customer</span>
                <span className="text-sm mt-1 block">I want to view my loyalty points</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('vendor');
                setHasSelectedRole(true);
                setError(null);
              }}
              className={`flex items-start p-4 rounded-xl border-2 transition-all text-left ${
                hasSelectedRole && role === 'vendor'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-500 hover:border-orange-200'
              }`}
            >
              <Store className={`w-6 h-6 mr-3 flex-shrink-0 ${hasSelectedRole && role === 'vendor' ? 'text-orange-600' : 'text-gray-400'}`} />
              <div>
                <span className="font-bold block text-gray-900">Vendor</span>
                <span className="text-sm mt-1 block">I want to manage my customers points (e.g. Hair salon or Car wash)</span>
              </div>
            </button>
          </div>
        )}

        {showForm && !showGoogleVendorFields && (
          <>
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
              >
                <GoogleIcon />
                Sign {isSignUp ? 'up' : 'in'} with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {isSignUp && (
                <>
                  {role === 'vendor' && (
                    <div className="space-y-2">
                      <label htmlFor="maxPoints" className="block text-sm font-medium text-gray-700">
                        How many points must a customer accumulate to redeem a reward?
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          id="maxPoints"
                          min="3"
                          max="10"
                          value={maxPoints}
                          onChange={(e) => setMaxPoints(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                        <span className="font-bold text-orange-600 w-8 text-center text-lg">{maxPoints}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      {role === 'vendor' ? (
                        <>
                          Business name
                          <div className="relative ml-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                const tooltip = e.currentTarget.nextElementSibling;
                                if (tooltip) {
                                  tooltip.classList.toggle('hidden');
                                }
                              }}
                              onBlur={(e) => {
                                const tooltip = e.currentTarget.nextElementSibling;
                                if (tooltip) {
                                  tooltip.classList.add('hidden');
                                }
                              }}
                              className="focus:outline-none"
                            >
                              <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </button>
                            <div className="hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                              If your business doesn't have a name use your full name
                            </div>
                          </div>
                        </>
                      ) : 'Full name'}
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder={role === 'vendor' ? "e.g. Joe's Car Wash" : "John Doe"}
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Create account' : 'Sign in')}
                </button>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm text-center mt-2">
                  {error}
                </div>
              )}
              
              <div className="text-center text-xs text-gray-500 mt-4">
                <p>Try these dummy accounts:</p>
                <p>Vendor: vendor@test.com / any password</p>
                <p>Customer: alice@test.com / any password</p>
              </div>
            </form>
          </>
        )}

        {showGoogleVendorFields && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="googleMaxPoints" className="block text-sm font-medium text-gray-700">
                How many points must a customer accumulate to redeem a reward?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="googleMaxPoints"
                  min="3"
                  max="10"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <span className="font-bold text-orange-600 w-8 text-center text-lg">{maxPoints}</span>
              </div>
            </div>
            <div>
              <label htmlFor="googleFullName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Business name
                <div className="relative ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const tooltip = e.currentTarget.nextElementSibling;
                      if (tooltip) {
                        tooltip.classList.toggle('hidden');
                      }
                    }}
                    onBlur={(e) => {
                      const tooltip = e.currentTarget.nextElementSibling;
                      if (tooltip) {
                        tooltip.classList.add('hidden');
                      }
                    }}
                    className="focus:outline-none"
                  >
                    <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </button>
                  <div className="hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    If your business doesn't have a name use your full name
                  </div>
                </div>
              </label>
              <input
                id="googleFullName"
                name="googleFullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="e.g. Joe's Car Wash"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading || !fullName.trim()}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button
              onClick={() => {
                setShowGoogleVendorFields(false);
                setError(null);
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 text-center mt-4"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
