import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserPlus, Crown, Search, Trash2, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

interface ProTester {
  id: string;
  email: string;
  created_at: string;
}

interface AuditEntry {
  id: string;
  event_type: string;
  actor_email: string;
  target_email: string | null;
  vendor_email: string | null;
  customer_email: string | null;
  details: string | null;
  created_at: string;
}

export default function AdminSection() {
  const { user } = useAuth();

  // Admin Users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Pro Testers
  const [proTesters, setProTesters] = useState<ProTester[]>([]);
  const [newTesterEmail, setNewTesterEmail] = useState('');
  const [testerLoading, setTesterLoading] = useState(false);

  // Search local state
  const [showAdminSearch, setShowAdminSearch] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [showTesterSearch, setShowTesterSearch] = useState(false);
  const [testerSearchTerm, setTesterSearchTerm] = useState('');

  // Audit Trail
  const [auditResults, setAuditResults] = useState<AuditEntry[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditLimit, setAuditLimit] = useState(10);

  // Section collapse state
  const [adminOpen, setAdminOpen] = useState(true);
  const [testerOpen, setTesterOpen] = useState(true);
  const [auditOpen, setAuditOpen] = useState(true);

  useEffect(() => {
    fetchAdminUsers();
    fetchProTesters();
  }, []);

  // --- Admin Users ---
  const fetchAdminUsers = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setAdminUsers(data);
  };

  const addAdminUser = async () => {
    if (!newAdminEmail.trim()) return;
    setAdminLoading(true);
    const { error } = await supabase
      .from('admin_users')
      .insert({ email: newAdminEmail.trim().toLowerCase() });
    if (error) {
      alert('Error adding admin: ' + error.message);
    } else {
      setNewAdminEmail('');
      fetchAdminUsers();
    }
    setAdminLoading(false);
  };

  const removeAdminUser = async (id: string, email: string) => {
    if (email === 'admin@iloyalty.co.za') {
      alert('Cannot remove the default admin.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${email} from Admin Users?`)) return;
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (!error) fetchAdminUsers();
  };

  // --- Pro Testers ---
  const fetchProTesters = async () => {
    const { data, error } = await supabase
      .from('pro_testers')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProTesters(data);
  };

  const addProTester = async () => {
    if (!newTesterEmail.trim()) return;
    setTesterLoading(true);
    const email = newTesterEmail.trim().toLowerCase();

    // 1. Add to pro_testers table
    const { error: insertError } = await supabase
      .from('pro_testers')
      .insert({ email });

    if (insertError) {
      alert('Error adding tester: ' + insertError.message);
      setTesterLoading(false);
      return;
    }

    // 2. Upgrade their profile to Pro plan
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ plan_type: 'Pro' })
      .eq('email', email);

    if (updateError) {
      console.warn('Could not auto-upgrade plan (user may not exist yet):', updateError.message);
    }

    setNewTesterEmail('');
    fetchProTesters();
    setTesterLoading(false);
  };

  const removeProTester = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from Pro Testers?`)) return;

    // Downgrade back to Starter
    await supabase
      .from('profiles')
      .update({ plan_type: 'Starter' })
      .eq('email', email);

    const { error } = await supabase.from('pro_testers').delete().eq('id', id);
    if (!error) fetchProTesters();
  };

  // --- Audit Trail ---
  const searchAudit = async (loadMore = false) => {
    setAuditLoading(true);
    const newLimit = loadMore ? auditLimit + 10 : 10;
    if (!loadMore) setAuditLimit(10);
    else setAuditLimit(newLimit);

    let query = supabase
      .from('audit_trail')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(newLimit);

    if (auditSearch.trim()) {
      const term = auditSearch.trim().toLowerCase();
      query = query.or(
        `actor_email.ilike.%${term}%,target_email.ilike.%${term}%,vendor_email.ilike.%${term}%,customer_email.ilike.%${term}%`
      );
    }

    const { data, error } = await query;
    if (!error && data) {
      setAuditResults(data);
    } else {
      console.error("Audit trail search error:", error);
      setAuditResults(loadMore ? auditResults : []);
    }
    setAuditLoading(false);
  };

  const filteredAdmins = adminUsers.filter(a => a.email.includes(adminSearchTerm.toLowerCase()));
  const filteredTesters = proTesters.filter(t => t.email.includes(testerSearchTerm.toLowerCase()));

  const eventTypeColors: Record<string, string> = {
    account_created: 'bg-green-100 text-green-700',
    point_allocated: 'bg-blue-100 text-blue-700',
    points_reset: 'bg-amber-100 text-amber-700',
    reward_points_adjustment: 'bg-purple-100 text-purple-700',
    relationship_removed: 'bg-red-100 text-red-700',
  };

  const eventTypeLabels: Record<string, string> = {
    account_created: 'Account Created',
    point_allocated: 'Point Allocated',
    points_reset: 'Points Reset',
    reward_points_adjustment: 'Reward Points Adjustment',
    relationship_removed: 'Removed Vendor / Customer',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Section</h1>
          <p className="text-sm text-gray-500">Manage admins, testers, and view audit trails</p>
        </div>
      </div>

      {/* ─── Section 1: Admin Users ─── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setAdminOpen(!adminOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Admin Users</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{adminUsers.length}</span>
          </div>
          {adminOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        <AnimatePresence>
          {adminOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">
                    Users added here will see the "Admin Section" button in their sidebar.
                  </p>
                  <button onClick={() => setShowAdminSearch(!showAdminSearch)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {showAdminSearch && (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={adminSearchTerm}
                      onChange={(e) => setAdminSearchTerm(e.target.value)}
                      placeholder="Search admins..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
                <div className="flex gap-2 mb-4">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAdminUser()}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  <button
                    onClick={addAdminUser}
                    disabled={adminLoading || !newAdminEmail.trim()}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {adminLoading ? 'Adding...' : 'Add'}
                  </button>
                </div>

                {filteredAdmins.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No admin users found.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {filteredAdmins.map((a) => (
                      <div key={a.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{a.email}</p>
                          <p className="text-xs text-gray-400">
                            Added {new Date(a.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        {a.email !== 'admin@iloyalty.co.za' && (
                          <button
                            onClick={() => removeAdminUser(a.id, a.email)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                            title="Remove admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Section 2: Pro Plan Testers ─── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setTesterOpen(!testerOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Pro Plan Testers</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{proTesters.length}</span>
          </div>
          {testerOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        <AnimatePresence>
          {testerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">
                    Users added here will be upgraded to the Pro plan at no cost for testing purposes.
                  </p>
                  <button onClick={() => setShowTesterSearch(!showTesterSearch)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {showTesterSearch && (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={testerSearchTerm}
                      onChange={(e) => setTesterSearchTerm(e.target.value)}
                      placeholder="Search testers..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
                <div className="flex gap-2 mb-4">
                  <input
                    type="email"
                    value={newTesterEmail}
                    onChange={(e) => setNewTesterEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addProTester()}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                  <button
                    onClick={addProTester}
                    disabled={testerLoading || !newTesterEmail.trim()}
                    className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {testerLoading ? 'Adding...' : 'Add'}
                  </button>
                </div>

                {filteredTesters.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No testers found.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {filteredTesters.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{t.email}</p>
                            <p className="text-xs text-gray-400">
                              Added {new Date(t.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pro</span>
                        </div>
                        <button
                          onClick={() => removeProTester(t.id, t.email)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          title="Remove tester"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Section 3: Audit Trail ─── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setAuditOpen(!auditOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
          </div>
          {auditOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        <AnimatePresence>
          {auditOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Search by email to view account activity, point adjustments, and reward redemptions.
                </p>
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchAudit()}
                      placeholder="Search by email address..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={searchAudit}
                    disabled={auditLoading}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {auditLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {auditResults.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    {auditSearch ? 'No results found for that email.' : 'Enter an email and click Search to view the audit trail.'}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {auditResults.map((entry) => (
                      <div key={entry.id} className="border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${eventTypeColors[entry.event_type] || 'bg-gray-100 text-gray-600'}`}>
                                {eventTypeLabels[entry.event_type] || entry.event_type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 space-y-0.5">
                              {entry.vendor_email && (
                                <p><span className="text-gray-400 text-xs text-uppercase">Vendor:</span> <span className="font-medium">{entry.vendor_email}</span></p>
                              )}
                              {entry.customer_email && (
                                <p><span className="text-gray-400 text-xs">Customer:</span> <span className="font-medium">{entry.customer_email}</span></p>
                              )}
                              {entry.details && (
                                <p className="text-xs text-gray-800 mt-2 font-medium">{entry.details}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                            {new Date(entry.created_at).toLocaleString('en-ZA', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {auditResults.length >= auditLimit && (
                      <div className="text-center pt-2 pb-4">
                        <button
                          onClick={() => searchAudit(true)}
                          disabled={auditLoading}
                          className="px-4 py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                        >
                          {auditLoading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
