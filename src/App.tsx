/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import About from './pages/About';
import Chat from './pages/Chat';

// Full-screen loading spinner shown while the auth session is being resolved
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // While the profile is being fetched, show a spinner instead of
  // instantly redirecting to /login (which caused the "need to clear cache" bug)
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route path="about" element={<About />} />
              <Route path="chat" element={<Chat />} />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
