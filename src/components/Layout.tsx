import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Info, User, MessageSquare, Share2, LogOut, QrCode, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData, Customer, LoyaltyRecord } from '../context/DataContext';
import { motion, AnimatePresence } from 'motion/react';
import PlanModal from './PlanModal';
import CustomerQrModal from './CustomerQrModal';
import QrScannerModal from './QrScannerModal';
import ScanResultModal from './ScanResultModal';
import { supabase } from '../supabaseClient';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isCustomerQrModalOpen, setIsCustomerQrModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanResultOpen, setIsScanResultOpen] = useState(false);
  const [scannedCustomer, setScannedCustomer] = useState<Customer | null>(null);
  const [scannedRecord, setScannedRecord] = useState<LoyaltyRecord | null>(null);
  const [scanNotFound, setScanNotFound] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, logout } = useAuth();
  const { customers, loyaltyRecords } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Refs to avoid stale closures in QR scanner callback ─────────────────
  const customersRef = useRef(customers);
  const loyaltyRecordsRef = useRef(loyaltyRecords);
  const userRef = useRef(user);
  useEffect(() => { customersRef.current = customers; }, [customers]);
  useEffect(() => { loyaltyRecordsRef.current = loyaltyRecords; }, [loyaltyRecords]);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) return;
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', user.email.toLowerCase())
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user?.email]);

  const handleShare = async () => {
    setIsSidebarOpen(false);
    const shareData = {
      title: 'i-Loyalty App',
      text: 'Join i-Loyalty to start earning rewards at your favorite local businesses!',
      url: 'https://iloyalty.co.za/'
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Profile', path: '/profile', icon: User },
    ...(user?.role === 'vendor' ? [{ name: 'Stats', path: '/stats', icon: TrendingUp }] : []),
    { name: 'About', path: '/about', icon: Info },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
  ];

  // ── QR Scan Handler ─────────────────────────────────────────────────────
  const handleQrClick = () => {
    if (user?.role === 'customer') {
      setIsCustomerQrModalOpen(true);
    } else if (user?.role === 'vendor') {
      setIsScannerOpen(true);
    }
  };

  // The actual scan handler reads from refs so it always has current data
  const handleScanSuccessImpl = useCallback(async (decodedText: string) => {
    setIsScannerOpen(false);
    setScanNotFound(false);
    setScannedCustomer(null);
    setScannedRecord(null);
    setIsScanResultOpen(true);

    const currentCustomers = customersRef.current;
    const currentRecords = loyaltyRecordsRef.current;
    const currentUser = userRef.current;

    const scannedText = decodedText.trim();
    let customerId = '';
    let customerEmail = '';
    let customerName = '';
    let customerPhone = '';

    // Parse QR code payload
    try {
      const parsed = JSON.parse(scannedText);
      customerId = parsed.id || '';
      customerEmail = parsed.email || '';
      customerName = parsed.name || '';
      customerPhone = parsed.phone || '';
    } catch {
      // Old format: plain UUID string
      customerId = scannedText;
    }

    console.log('[QR Scan]', { customerId, customerEmail, customerName });

    if (!customerId && !customerEmail) {
      alert('Invalid QR code scanned. Raw data: ' + scannedText.substring(0, 100));
      setScanNotFound(true);
      return;
    }

    // Step 1: Check local state by ID first (fastest path)
    let localRecord = currentRecords.find(r => r.customerId === customerId);
    let localCustomer = currentCustomers.find(c => c.id === customerId);

    // Step 1b: If not found by ID, try matching by EMAIL in local state
    if ((!localRecord || !localCustomer) && customerEmail) {
      const emailCustomer = currentCustomers.find(c => c.email.toLowerCase() === customerEmail.toLowerCase());
      if (emailCustomer) {
        localCustomer = emailCustomer;
        localRecord = currentRecords.find(r => r.customerId === emailCustomer.id);
      }
    }

    if (localRecord && localCustomer) {
      setScannedCustomer(localCustomer);
      setScannedRecord(localRecord);
      return;
    }

    // Step 2: DB fallback — find the legacy customer by email
    let foundProfileCustomer: any = null;
    let foundLegacyCustomer: any = null;

    if (customerEmail) {
      const { data: legacyCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customerEmail.toLowerCase().trim())
        .maybeSingle();

      if (legacyCustomer) {
        foundLegacyCustomer = legacyCustomer;
        const { data: legacyRecord } = await supabase
          .from('loyalty_records')
          .select('*')
          .eq('vendor_id', currentUser?.id)
          .eq('customer_id', legacyCustomer.id)
          .maybeSingle();

        if (legacyRecord) {
          setScannedCustomer({
            id: legacyCustomer.id,
            name: legacyCustomer.name,
            email: legacyCustomer.email,
            phone: legacyCustomer.phone || '',
            joinedDate: legacyCustomer.joined_date || new Date().toISOString().split('T')[0],
          });
          setScannedRecord({
            id: legacyRecord.id,
            vendorId: legacyRecord.vendor_id,
            customerId: legacyRecord.customer_id,
            points: legacyRecord.points,
            maxPoints: legacyRecord.max_points,
            visits: legacyRecord.visits,
            rewardCode: legacyRecord.reward_code,
          });
          return;
        }
      }

      // Step 2b: Also check profiles table (customer might have signed up but
      // vendor hasn't enrolled them yet)
      const { data: profileCustomer } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', customerEmail.toLowerCase().trim())
        .maybeSingle();

      if (profileCustomer) {
        foundProfileCustomer = profileCustomer;
        // Check if already enrolled with this vendor via profile ID
        const { data: profileRecord } = await supabase
          .from('loyalty_records')
          .select('*')
          .eq('vendor_id', currentUser?.id)
          .eq('customer_id', profileCustomer.id)
          .maybeSingle();

        if (profileRecord) {
          setScannedCustomer({
            id: profileCustomer.id,
            name: profileCustomer.name,
            email: profileCustomer.email,
            phone: profileCustomer.phone || '',
            joinedDate: profileCustomer.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          });
          setScannedRecord({
            id: profileRecord.id,
            vendorId: profileRecord.vendor_id,
            customerId: profileRecord.customer_id,
            points: profileRecord.points,
            maxPoints: profileRecord.max_points,
            visits: profileRecord.visits,
            rewardCode: profileRecord.reward_code,
          });
          return;
        }
      }
    }

    // Step 3: Not found anywhere — show as new customer from QR data
    // Use DB profile phone/name as priority fallback if they signed up but aren't enrolled
    const finalPhone = foundProfileCustomer?.phone || foundLegacyCustomer?.phone || customerPhone || '';
    const finalName = foundProfileCustomer?.name || foundLegacyCustomer?.name || customerName || customerEmail || 'Customer';

    const qrCustomer: Customer = {
      id: customerId,
      name: finalName,
      email: customerEmail,
      phone: finalPhone,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setScannedCustomer(qrCustomer);
    setScannedRecord(null);
  }, []); // No dependencies needed — reads from refs

  // Stable ref-based wrapper for the QR scanner to always call the latest handler
  const scanCallbackRef = useRef(handleScanSuccessImpl);
  useEffect(() => { scanCallbackRef.current = handleScanSuccessImpl; }, [handleScanSuccessImpl]);
  const handleScanSuccess = useCallback((decodedText: string) => {
    scanCallbackRef.current(decodedText);
  }, []);

  const handleEnrollAndAssign = async (_date: string) => {
    if (!scannedCustomer || !user?.id) {
      alert('Error: No customer data available. Please scan again.');
      return;
    }
    
    setIsScanResultOpen(false);
    
    // Navigate to home with customer details as query params
    // so the Register Customer modal opens pre-populated for vendor review
    const params = new URLSearchParams({
      registerCustomer: 'true',
      name: scannedCustomer.name || '',
      email: scannedCustomer.email || '',
    });
    navigate('/?' + params.toString());
  };

  const handleGoToProfile = () => {
    setIsScanResultOpen(false);
    // Navigate to home with the customer's record ID so VendorDashboard auto-opens their profile
    if (scannedRecord) {
      navigate('/?openCustomer=' + scannedRecord.customerId);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-1">
              {/* Spinning orange circle */}
              <div className="qr-spinner" />
              <button
                onClick={handleQrClick}
                className="relative w-10 h-10 bg-white text-orange-600 rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 animate-qr-pulse"
                title={user?.role === 'customer' ? "Show My QR Code" : "Scan QR Code"}
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
            <h1
              onClick={() => {
                if (location.pathname === '/') {
                  navigate('/profile');
                } else {
                  navigate('/');
                }
              }}
              className="text-sm font-semibold text-orange-600 tracking-tight cursor-pointer hover:text-orange-800 transition-colors"
            >
              Welcome, {user?.role === 'vendor' ? (user?.businessName || user?.name || 'Guest') : (user?.name || 'Guest')}
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
          >
            <span className="sr-only">Open sidebar</span>
            {isSidebarOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 z-30"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl z-40 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {user?.role === 'vendor' ? (user?.businessName || user?.name || 'Guest') : (user?.name || 'Guest')}
                  </h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user?.role === 'vendor' && (
                      <>
                        <span
                          onClick={() => setIsPlanModalOpen(true)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${user?.planType === 'Pro'
                              ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                          {user?.planType || 'Starter'} Plan
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 capitalize">
                          Vendor
                        </span>
                      </>
                    )}
                    {user?.role === 'customer' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 capitalize">
                        Customer
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-1">
                  {navLinks.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive
                            ? 'bg-orange-50 text-orange-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <item.icon
                          className={`mr-4 flex-shrink-0 h-6 w-6 ${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}

                  <button
                    onClick={handleShare}
                    className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Share2 className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                    Share
                  </button>
                </nav>
              </div>

              <div className="p-4 border-t border-gray-100">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsSidebarOpen(false)}
                    className={`w-full group flex items-center px-2 py-2 mb-1 text-base font-medium rounded-md ${location.pathname === '/admin' ? 'bg-indigo-50 text-indigo-600' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <ShieldCheck className={`mr-4 flex-shrink-0 h-6 w-6 ${location.pathname === '/admin' ? 'text-indigo-600' : 'text-indigo-400 group-hover:text-indigo-500'}`} />
                    Admin Section
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-4 flex-shrink-0 h-6 w-6 text-red-500 group-hover:text-red-600" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />

      {user?.id && (
        <CustomerQrModal 
          isOpen={isCustomerQrModalOpen}
          onClose={() => setIsCustomerQrModalOpen(false)}
          userId={user.id}
          userEmail={user.email || ''}
          userName={user.businessName || user.name || 'User'}
          userPhone={user.phone || ''}
        />
      )}

      {/* Vendor QR Scanner */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Scan Result */}
      <ScanResultModal
        isOpen={isScanResultOpen}
        onClose={() => setIsScanResultOpen(false)}
        customer={scannedCustomer}
        record={scannedRecord}
        onGoToProfile={handleGoToProfile}
        onEnrollAndAssign={handleEnrollAndAssign}
        notFound={scanNotFound}
      />
    </div>
  );
}
