import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle2, Save, Edit2, Camera, X, ArrowLeft, Calendar, Star, CreditCard, Gift, Handshake, Lock, Phone, Zap, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PlanModal from '../components/PlanModal';
import { supabase } from '../supabaseClient';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(user?.profilePic || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'main' | 'step1' | 'step2' | 'step3' | 'step4'>('main');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 Settings
  const [maxPoints, setMaxPoints] = useState(user?.maxPoints || 5);
  const [tempMaxPoints, setTempMaxPoints] = useState(user?.maxPoints || 5);

  // Step 2 Settings
  const [minSpend, setMinSpend] = useState(0);
  const [noMinSpend, setNoMinSpend] = useState(true);
  const [tempMinSpend, setTempMinSpend] = useState(0);
  const [tempNoMinSpend, setTempNoMinSpend] = useState(true);

  // Step 3 Settings
  const [rewardType, setRewardType] = useState<'free' | 'discount'>('free');
  const [tempRewardType, setTempRewardType] = useState<'free' | 'discount'>('free');
  const [rewardItem, setRewardItem] = useState('');
  const [tempRewardItem, setTempRewardItem] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [tempDiscountPercentage, setTempDiscountPercentage] = useState(10);

  // Step 4 Settings
  const [hasExpiration, setHasExpiration] = useState(false);
  const [tempHasExpiration, setTempHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempExpirationDate, setTempExpirationDate] = useState(new Date().toISOString().split('T')[0]);

  // Wizard State
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [isDirectEdit, setIsDirectEdit] = useState(false);

  // Account Settings Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const { logout } = useAuth();

  const isDirty = 
    name !== (user?.name || '') || 
    email !== (user?.email || '') || 
    businessName !== (user?.businessName || '') || 
    profilePic !== (user?.profilePic || null);

  const handleSave = () => {
    updateUser({ name, email, businessName, profilePic: profilePic || undefined });
    setEditingField(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile_pics/${user.id}-${Math.random()}.${fileExt}`;

      // Upload the file to "Send_My_Task_Assets" private bucket
      const { error: uploadError } = await supabase.storage
        .from('Send_My_Task_Assets')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) {
        throw uploadError;
      }

      // Generate a signed URL valid for 10 years because the bucket is private
      const { data: urlData, error: urlError } = await supabase.storage
        .from('Send_My_Task_Assets')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10);

      if (urlError) {
        throw urlError;
      }

      setProfilePic(urlData.signedUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const renderField = (label: string, value: string, fieldName: string, setter: (val: string) => void) => {
    const isEditing = editingField === fieldName;

    return (
      <div className="flex items-center">
        <span className="text-sm font-semibold text-gray-700 mr-2">{label}:</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="px-2 py-1 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm w-40"
              autoFocus
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingField(null);
                if (e.key === 'Escape') {
                  if (fieldName === 'name') setName(user?.name || '');
                  if (fieldName === 'email') setEmail(user?.email || '');
                  if (fieldName === 'businessName') setBusinessName(user?.businessName || '');
                  setEditingField(null);
                }
              }}
            />
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-sm text-gray-900 mr-2">{value}</span>
            <button
              onClick={() => setEditingField(fieldName)}
              className="text-gray-400 hover:text-orange-600 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const tcSummary = `${noMinSpend ? 'Without any minimum spend' : `After spending R${minSpend}`}, your customer will be eligible for a ${rewardType === 'discount' ? `${discountPercentage}% discount on ${rewardItem || 'a service/product'}` : `free ${rewardItem || 'service/product'}`} after reaching their loyalty goal of ${maxPoints} points.${hasExpiration ? ` Rewards expire on ${expirationDate}.` : ''}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-orange-500 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div 
              className="bg-white p-1 rounded-full shadow-lg cursor-pointer relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <UserCircle2 className="w-24 h-24 text-gray-400" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center m-1">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity m-1 ${isUploading ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 capitalize">{user?.role}</p>
            </div>
            {isDirty && (
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-orange-500 rounded-xl text-sm font-medium text-white hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl px-6 py-4 border border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-3">
            {user?.role === 'customer' && renderField('Full Name', name, 'name', setName)}
            {renderField('Email', email, 'email', setEmail)}
            {user?.role === 'vendor' && renderField('Business Name', businessName, 'businessName', setBusinessName)}
          </div>

          <div className="mt-12">
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase tracking-wider">Settings</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="space-y-6">
              {user?.role === 'vendor' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Setup terms & condition</h3>
                    <button
                      onClick={() => {
                        setModalView('main');
                        setIsSetupModalOpen(true);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Start Setup
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <div 
                      className="text-sm text-gray-700 flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors -mx-2"
                      onClick={() => { setTempMaxPoints(maxPoints); setIsDirectEdit(true); setIsWizardMode(false); setModalView('step1'); setIsSetupModalOpen(true); }}
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <Star className="w-4 h-4" />
                      </div>
                      <span><span className="font-medium">Minimum points required to get a reward:</span> {maxPoints}</span>
                    </div>
                    <div 
                      className="text-sm text-gray-700 flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors -mx-2"
                      onClick={() => { setTempMinSpend(minSpend); setTempNoMinSpend(noMinSpend); setIsDirectEdit(true); setIsWizardMode(false); setModalView('step2'); setIsSetupModalOpen(true); }}
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span>
                        {noMinSpend 
                          ? "No minimum spend required" 
                          : `Minimum spend to get a ${rewardType === 'discount' ? `${discountPercentage}% discount` : 'freebie'}: R${minSpend}`
                        }
                      </span>
                    </div>
                    <div 
                      className="text-sm text-gray-700 flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors -mx-2"
                      onClick={() => { setTempHasExpiration(hasExpiration); setTempExpirationDate(expirationDate); setIsDirectEdit(true); setIsWizardMode(false); setModalView('step4'); setIsSetupModalOpen(true); }}
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span><span className="font-medium">Reward expiration date:</span> {hasExpiration ? expirationDate : 'No Date'}</span>
                    </div>
                    <div 
                      className="text-sm text-gray-700 flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors -mx-2"
                      onClick={() => { setTempRewardType(rewardType); setTempRewardItem(rewardItem); setTempDiscountPercentage(discountPercentage); setIsDirectEdit(true); setIsWizardMode(false); setModalView('step3'); setIsSetupModalOpen(true); }}
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <span><span className="font-medium">Redeemable reward:</span> {rewardType === 'discount' ? 'Discount' : 'Freebie'} | {rewardItem || 'Not specified'}</span>
                    </div>
                    <div 
                      className="text-sm text-gray-700 flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors -mx-2 mt-2 border-t border-gray-100 pt-3"
                      onClick={() => { setIsDirectEdit(false); setIsWizardMode(false); setModalView('main'); setIsSetupModalOpen(true); }}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Handshake className="w-4 h-4" />
                      </div>
                      <span className="italic text-gray-600 font-medium">"{tcSummary}"</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                {user?.role === 'vendor' && (
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                )}
                <div className="space-y-2">
                  <div 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Change Password</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>

                  <div 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                    onClick={() => {
                      setPhoneInput(user?.phone || '');
                      setIsPhoneModalOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Cell Phone Number{user?.phone ? `: ${user?.phone}` : ''}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>

                  {user?.role === 'vendor' && (
                    <div 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                      onClick={() => setIsPlanModalOpen(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                          <Zap className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Current Plan Type</span>
                      </div>
                      <span className="text-sm font-semibold text-orange-600 mr-2">{user?.planType || 'Starter'} Plan</span>
                    </div>
                  )}

                  <div 
                    className="flex items-center justify-between p-3 hover:bg-red-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-100 group"
                    onClick={() => {
                      setDeleteEmailInput('');
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-200 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-red-600">Delete Account</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {isSetupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsSetupModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
            >
              <button
                onClick={() => {
                  setIsSetupModalOpen(false);
                  setIsDirectEdit(false);
                  setIsWizardMode(false);
                  setModalView('main');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {modalView === 'main' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Setup Terms & Conditions</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div 
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2"
                      onClick={() => {
                        setTempMaxPoints(maxPoints);
                        setModalView('step1');
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">1</div>
                      <p className="text-gray-700 font-medium">Set maximum loyalty points</p>
                    </div>
                    <div 
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2"
                      onClick={() => {
                        setTempMinSpend(minSpend);
                        setTempNoMinSpend(noMinSpend);
                        setModalView('step2');
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">2</div>
                      <p className="text-gray-700 font-medium">Setup minimum spend amount</p>
                    </div>
                    <div 
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2"
                      onClick={() => {
                        setTempRewardType(rewardType);
                        setTempRewardItem(rewardItem);
                        setTempDiscountPercentage(discountPercentage);
                        setModalView('step3');
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">3</div>
                      <p className="text-gray-700 font-medium">Setup reward category / type</p>
                    </div>
                    <div 
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2"
                      onClick={() => {
                        setTempHasExpiration(hasExpiration);
                        setTempExpirationDate(expirationDate);
                        setModalView('step4');
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">4</div>
                      <p className="text-gray-700 font-medium">Setup reward expiry date</p>
                    </div>
                  </div>

                  <hr className="border-gray-200 mb-6" />

                  <button
                    onClick={() => {
                      setIsWizardMode(true);
                      setTempMaxPoints(maxPoints);
                      setTempMinSpend(minSpend);
                      setTempNoMinSpend(noMinSpend);
                      setTempRewardType(rewardType);
                      setTempRewardItem(rewardItem);
                      setTempDiscountPercentage(discountPercentage);
                      setTempHasExpiration(hasExpiration);
                      setTempExpirationDate(expirationDate);
                      setModalView('step1');
                    }}
                    className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl font-medium text-lg hover:bg-orange-700 transition-colors shadow-sm"
                  >
                    Setup Wizard
                  </button>
                </>
              )}

              {modalView === 'step1' && (
                <>
                  <div className="flex items-center mb-6">
                    {!isDirectEdit && (
                      <button 
                        onClick={() => {
                          setIsWizardMode(false);
                          setModalView('main');
                        }}
                        className="mr-3 text-gray-500 hover:text-gray-900"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">Setup Maximum Points</h2>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    How many points must a customer accumulate to redeem a reward
                  </p>

                  <div className="mb-8 text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-4">
                      {tempMaxPoints}
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={tempMaxPoints}
                      onChange={(e) => setTempMaxPoints(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>3</span>
                      <span>10</span>
                    </div>
                  </div>

                  {!isWizardMode && tempMaxPoints !== maxPoints && (
                    <button
                      onClick={() => {
                        setMaxPoints(tempMaxPoints);
                        updateUser({ maxPoints: tempMaxPoints });
                        if (isDirectEdit) {
                          setIsSetupModalOpen(false);
                          setIsDirectEdit(false);
                          setModalView('main');
                        } else {
                          setModalView('main');
                        }
                      }}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Save
                    </button>
                  )}
                </>
              )}

              {modalView === 'step2' && (
                <>
                  <div className="flex items-center mb-6">
                    {!isDirectEdit && (
                      <button 
                        onClick={() => {
                          setIsWizardMode(false);
                          setModalView('main');
                        }}
                        className="mr-3 text-gray-500 hover:text-gray-900"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">Setup Minimum Spend</h2>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    What is the minimum a customer must spend to earn a point
                  </p>

                  <div className="mb-8 space-y-4">
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">R</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          disabled={tempNoMinSpend}
                          value={tempNoMinSpend ? 0 : tempMinSpend}
                          onChange={(e) => setTempMinSpend(parseFloat(e.target.value) || 0)}
                          className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="no-min-spend"
                        type="checkbox"
                        checked={tempNoMinSpend}
                        onChange={(e) => setTempNoMinSpend(e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="no-min-spend" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                        No minimum amount required
                      </label>
                    </div>
                  </div>

                  {!isWizardMode && (tempMinSpend !== minSpend || tempNoMinSpend !== noMinSpend) && (
                    <button
                      onClick={() => {
                        setMinSpend(tempNoMinSpend ? 0 : tempMinSpend);
                        setNoMinSpend(tempNoMinSpend);
                        if (isDirectEdit) {
                          setIsSetupModalOpen(false);
                          setIsDirectEdit(false);
                          setModalView('main');
                        } else {
                          setModalView('main');
                        }
                      }}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Save
                    </button>
                  )}
                </>
              )}

              {modalView === 'step3' && (
                <>
                  <div className="flex items-center mb-6">
                    {!isDirectEdit && (
                      <button 
                        onClick={() => {
                          setIsWizardMode(false);
                          setModalView('main');
                        }}
                        className="mr-3 text-gray-500 hover:text-gray-900"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">Setup Reward Type</h2>
                  </div>
                  
                  <div className="mb-8 space-y-6">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        What reward will a customer receive
                      </label>
                      <select
                        value={tempRewardType}
                        onChange={(e) => setTempRewardType(e.target.value as 'free' | 'discount')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                      >
                        <option value="free">Give a free service or product</option>
                        <option value="discount">Give a discounted service or product</option>
                      </select>
                    </div>

                    {tempRewardType === 'free' ? (
                      <div>
                        <input
                          type="text"
                          value={tempRewardItem}
                          onChange={(e) => setTempRewardItem(e.target.value)}
                          placeholder="e.g. Haircut"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-600 w-1/2">
                            Specify a discount in percentage
                          </label>
                          <div className="flex items-center gap-3 w-1/2">
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={tempDiscountPercentage}
                              onChange={(e) => setTempDiscountPercentage(parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                            />
                            <span className="font-bold text-orange-600 w-12 text-right">{tempDiscountPercentage}%</span>
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={tempRewardItem}
                            onChange={(e) => setTempRewardItem(e.target.value)}
                            placeholder="e.g. Haircut"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {!isWizardMode && (tempRewardType !== rewardType || tempRewardItem !== rewardItem || (tempRewardType === 'discount' && tempDiscountPercentage !== discountPercentage)) && (
                    <button
                      onClick={() => {
                        setRewardType(tempRewardType);
                        setRewardItem(tempRewardItem);
                        setDiscountPercentage(tempDiscountPercentage);
                        if (isDirectEdit) {
                          setIsSetupModalOpen(false);
                          setIsDirectEdit(false);
                          setModalView('main');
                        } else {
                          setModalView('main');
                        }
                      }}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Save
                    </button>
                  )}
                </>
              )}

              {modalView === 'step4' && (
                <>
                  <div className="flex items-center mb-6">
                    {!isDirectEdit && (
                      <button 
                        onClick={() => {
                          setIsWizardMode(false);
                          setModalView('main');
                        }}
                        className="mr-3 text-gray-500 hover:text-gray-900"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">Setup Expiration Date</h2>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    Does this reward have an expiration date?
                  </p>

                  <div className="mb-8 space-y-6">
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={tempHasExpiration === true}
                          onChange={() => setTempHasExpiration(true)}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={tempHasExpiration === false}
                          onChange={() => setTempHasExpiration(false)}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">No</span>
                      </label>
                    </div>

                    {tempHasExpiration && (
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-600">Select an expiration date</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={tempExpirationDate}
                            onChange={(e) => setTempExpirationDate(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {!isWizardMode && (tempHasExpiration !== hasExpiration || (tempHasExpiration && tempExpirationDate !== expirationDate)) && (
                    <button
                      onClick={() => {
                        setHasExpiration(tempHasExpiration);
                        setExpirationDate(tempExpirationDate);
                        if (isDirectEdit) {
                          setIsSetupModalOpen(false);
                          setIsDirectEdit(false);
                          setModalView('main');
                        } else {
                          setModalView('main');
                        }
                      }}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Save
                    </button>
                  )}
                </>
              )}

              {isWizardMode && modalView !== 'main' && (
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                  {modalView !== 'step1' && (
                    <button
                      onClick={() => {
                        if (modalView === 'step2') { setMinSpend(tempNoMinSpend ? 0 : tempMinSpend); setNoMinSpend(tempNoMinSpend); setModalView('step1'); }
                        if (modalView === 'step3') { setRewardType(tempRewardType); setRewardItem(tempRewardItem); setDiscountPercentage(tempDiscountPercentage); setModalView('step2'); }
                        if (modalView === 'step4') { setHasExpiration(tempHasExpiration); setExpirationDate(tempExpirationDate); setModalView('step3'); }
                      }}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Previous Step
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (modalView === 'step1') { setMaxPoints(tempMaxPoints); setModalView('step2'); }
                      if (modalView === 'step2') { setMinSpend(tempNoMinSpend ? 0 : tempMinSpend); setNoMinSpend(tempNoMinSpend); setModalView('step3'); }
                      if (modalView === 'step3') { setRewardType(tempRewardType); setRewardItem(tempRewardItem); setDiscountPercentage(tempDiscountPercentage); setModalView('step4'); }
                      if (modalView === 'step4') { 
                        setHasExpiration(tempHasExpiration); 
                        setExpirationDate(tempExpirationDate); 
                        setIsWizardMode(false); 
                        setModalView('main'); 
                        updateUser({ maxPoints: tempMaxPoints });
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-sm"
                  >
                    {modalView === 'step4' ? 'Finish & Save Wizard' : 'Next Step'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsPasswordModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
            >
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.updateUser({ password: newPassword });
                  if (error) {
                    alert('Error updating password: ' + error.message);
                  } else {
                    alert('Password updated successfully!');
                    setIsPasswordModalOpen(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }
                }}
                disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                className="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Password
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Phone Modal */}
      <AnimatePresence>
        {isPhoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsPhoneModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
            >
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Update Cell Phone Number</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cell Phone Number</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    let formatted = val;
                    if (val.length > 3 && val.length <= 6) {
                      formatted = `${val.slice(0, 3)} ${val.slice(3)}`;
                    } else if (val.length > 6) {
                      formatted = `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6, 10)}`;
                    }
                    setPhoneInput(formatted);
                  }}
                  maxLength={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button
                onClick={() => {
                  updateUser({ phone: phoneInput });
                  setIsPhoneModalOpen(false);
                }}
                className="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                Save Phone Number
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PlanModal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
      />

      {/* Delete Account Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
            >
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to delete your i-loyalty account? This action cannot be undone. 
                Please enter your email address (<span className="font-semibold">{user?.email}</span>) to confirm.
              </p>
              <div className="mb-6">
                <input
                  type="email"
                  value={deleteEmailInput}
                  onChange={(e) => setDeleteEmailInput(e.target.value)}
                  placeholder={user?.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (deleteEmailInput === user?.email) {
                      const { error } = await supabase.rpc('delete_user');
                      if (error) {
                        alert('Error deleting account: ' + error.message);
                      } else {
                        logout();
                      }
                    }
                  }}
                  disabled={deleteEmailInput !== user?.email}
                  className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
