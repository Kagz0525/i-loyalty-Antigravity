import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store, UserCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email, role);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </a>
          </p>
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              role === 'customer'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                : 'border-gray-200 text-gray-500 hover:border-indigo-200'
            }`}
          >
            <UserCircle2 className="w-8 h-8 mb-2" />
            <span className="font-medium">Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              role === 'vendor'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                : 'border-gray-200 text-gray-500 hover:border-indigo-200'
            }`}
          >
            <Store className="w-8 h-8 mb-2" />
            <span className="font-medium">Vendor</span>
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Try these dummy accounts:</p>
            <p>Vendor: vendor@test.com / any password</p>
            <p>Customer: alice@test.com / any password</p>
          </div>
        </form>
      </div>
    </div>
  );
}
