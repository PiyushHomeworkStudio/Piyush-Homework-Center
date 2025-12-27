
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Transaction, User } from '../types';
import { ShieldAlert, IndianRupee, Users, CheckCircle, Key, CreditCard, UserCheck, AlertTriangle, Cpu, TrendingUp, Info, Clock, Watch, Layers, Check, X, ClipboardList, Smartphone, Hash, Calendar, Trash2, Monitor, Eye, EyeOff, Lock, RefreshCcw, Shield } from 'lucide-react';
import PinInput from '../components/PinInput';

// --- SUB-COMPONENTS MOVED OUTSIDE TO PREVENT RE-RENDERING FOCUS ISSUES ---

const PinDigitBoxes = ({ value, length, isVisible }: { value: string, length: number, isVisible: boolean }) => {
  const chars = value.padEnd(length, ' ').split('');
  return (
    <div className="flex justify-center gap-2 sm:gap-3 w-full">
      {chars.map((char, i) => (
        <div key={i} className="flex-1 aspect-square max-w-[48px] bg-black border border-white/10 rounded-xl flex items-center justify-center text-lg sm:text-xl font-black text-[#d4af37]">
          {isVisible ? (char === ' ' ? '' : char) : (char === ' ' ? '' : '●')}
        </div>
      ))}
    </div>
  );
};

interface PinManagementCardProps {
  title: string;
  pin: string;
  type: 'login' | 'admin' | 'dashboard';
  length: number;
  showPin: boolean;
  onToggleVisibility: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  formData: any;
  setFormData: (data: any) => void;
  handleUpdatePin: (type: 'login' | 'admin' | 'dashboard') => void;
}

const PinManagementCard: React.FC<PinManagementCardProps> = ({ 
  title, pin, type, length, showPin, onToggleVisibility, 
  isEditing, onToggleEdit, formData, setFormData, handleUpdatePin 
}) => {
  return (
    <div className="space-y-6">
      <div className={`bg-neutral-900 border ${isEditing ? 'border-[#d4af37]/50' : 'border-white/10'} p-8 rounded-[2.5rem] shadow-xl space-y-6 hover:border-[#d4af37]/30 transition-all group relative overflow-hidden`}>
        <div className="flex justify-between items-center relative z-10">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{title}</p>
          <button onClick={onToggleVisibility} className="text-gray-500 hover:text-[#d4af37] transition-colors p-2">
            {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <div className="py-2 relative z-10">
          <PinDigitBoxes value={pin} length={length} isVisible={showPin} />
        </div>

        <button 
          onClick={onToggleEdit}
          className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${isEditing ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-[#d4af37] hover:text-white'}`}
        >
          {isEditing ? 'Cancel Change' : 'Change PIN'}
        </button>
      </div>

      {isEditing && (
        <div className="bg-neutral-900 border border-[#d4af37]/40 p-8 sm:p-10 rounded-[3rem] shadow-2xl space-y-10 animate-page-enter mx-1 sm:mx-2">
          <div className="text-center space-y-2">
            <h4 className="text-xl font-black gold-text uppercase">Modify {title}</h4>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Enter secure numeric credentials</p>
          </div>

          <div className="space-y-8">
            <PinInput 
              length={length}
              value={formData.newPin}
              onChange={(val) => setFormData({ ...formData, newPin: val, error: '' })}
              label={`New ${length}-Digit PIN`}
              showToggle={true}
            />

            <PinInput 
              length={length}
              value={formData.confirmPin}
              onChange={(val) => setFormData({ ...formData, confirmPin: val, error: '' })}
              label="Confirm New PIN"
              showToggle={true}
            />

            {formData.error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center space-x-3 text-red-500">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">{formData.error}</span>
              </div>
            )}

            {formData.success && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center justify-center space-x-3 text-green-500">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">PIN Updated Successfully</span>
              </div>
            )}

            <button 
              onClick={() => handleUpdatePin(type)}
              disabled={formData.newPin.length !== length || formData.confirmPin.length !== length || formData.success}
              className="w-full gold-gradient py-6 rounded-2xl text-black font-black uppercase tracking-[0.2em] text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              Update Credentials
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- USER CARD COMPONENT FOR OVERVIEW ---

const UserDataCard: React.FC<{ user: User }> = ({ user }) => {
  const [showPin, setShowPin] = useState(false);

  return (
    <div className="bg-neutral-900 border border-white/5 p-6 rounded-[2.5rem] shadow-xl space-y-6 hover:border-[#d4af37]/30 transition-all group">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${user.isAdmin ? 'gold-gradient text-black' : 'bg-white/5 text-gray-400'}`}>
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-gray-500 uppercase tracking-widest mb-1">Registered Name</p>
          <p className="font-bold text-white truncate">{user.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Phone Number</p>
          <div className="flex items-center space-x-2 text-gray-300 font-mono">
            <Smartphone size={12} className="text-[#d4af37]" />
            <span>{user.phoneNumber}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">System Identity</p>
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.isAdmin ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
            {user.isAdmin ? 'MASTER OWNER' : 'STUDENT USER'}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Login PIN</p>
        <div className="flex items-center justify-between bg-black/40 border border-white/5 px-5 py-3 rounded-2xl group-hover:border-[#d4af37]/30 transition-colors">
          <span className="font-black text-[#d4af37] tracking-[0.4em] text-lg">
            {showPin ? user.pin : '●●●●●●'}
          </span>
          <button onClick={() => setShowPin(!showPin)} className="text-gray-500 hover:text-[#d4af37] transition-colors p-1">
            {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const OwnerDashboard: React.FC = () => {
  const { users, transactions, adminBalance, investmentMode, setInvestmentMode, updateTransaction, requests, updateUser, dashboardAccessPin, adminVerificationPin, setDashboardAccessPin, setAdminVerificationPin } = useStore();
  const [adminPin, setAdminPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'balance' | 'users' | 'investment'>('balance');
  const [paymentSubTab, setPaymentSubTab] = useState<'requests' | 'history'>('requests');
  const [accountsSubTab, setAccountsSubTab] = useState<'overview' | 'security'>('overview');
  const [pinError, setPinError] = useState(false);

  // Per-PIN card state logic
  const [showPins, setShowPins] = useState<{ [key: string]: boolean }>({
    login: false,
    admin: false,
    dashboard: false
  });

  const [activeChangeForm, setActiveChangeForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    newPin: '',
    confirmPin: '',
    error: '',
    success: false
  });

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === dashboardAccessPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setAdminPin('');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const togglePinVisibility = (key: string) => {
    setShowPins(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ownerUser = users.find(u => u.isAdmin);

  const resetForm = () => {
    setFormData({ newPin: '', confirmPin: '', error: '', success: false });
    setActiveChangeForm(null);
  };

  const handleUpdatePin = (type: 'login' | 'admin' | 'dashboard') => {
    const requiredLength = type === 'login' ? 6 : 4;
    const currentPin = type === 'login' ? ownerUser?.pin : (type === 'admin' ? adminVerificationPin : dashboardAccessPin);
    
    if (formData.newPin.length !== requiredLength) {
      setFormData(prev => ({ ...prev, error: `PIN must be exactly ${requiredLength} digits` }));
      return;
    }
    if (formData.newPin !== formData.confirmPin) {
      setFormData(prev => ({ ...prev, error: 'PINs do not match' }));
      return;
    }
    if (formData.newPin === currentPin) {
      setFormData(prev => ({ ...prev, error: 'New PIN must be different from current' }));
      return;
    }
    if (!/^\d+$/.test(formData.newPin)) {
      setFormData(prev => ({ ...prev, error: 'Numeric characters only' }));
      return;
    }

    // Apply update based on type
    if (type === 'login' && ownerUser) {
      updateUser(ownerUser.id, { pin: formData.newPin });
    } else if (type === 'admin') {
      setAdminVerificationPin(formData.newPin);
    } else if (type === 'dashboard') {
      setDashboardAccessPin(formData.newPin);
    }

    setFormData(prev => ({ ...prev, success: true, error: '' }));
    setTimeout(() => {
      resetForm();
    }, 2000);
  };

  const pendingRequests = transactions.filter(t => t.status === 'Pending').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Sorting rule: Sabse nayi activity (update/create) TOP par aaye
  const historyList = useMemo(() => {
    return transactions
      .filter(t => t.status !== 'Pending')
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
  }, [transactions]);

  // Investment logic
  const MONITOR_TARGET = 15000;
  const WATCH_TARGET = 43000;
  const MACHINE_TARGET = 40000;

  let monitorFund = 0, watchFund = 0, machineFund = 0;
  if (investmentMode === 'monitor') monitorFund = adminBalance;
  else if (investmentMode === 'watch') watchFund = adminBalance;
  else if (investmentMode === 'machine') machineFund = adminBalance;
  else if (investmentMode === 'divide') {
    const split = adminBalance / 3;
    monitorFund = split; watchFund = split; machineFund = split;
  }

  const monitorProgress = Math.min((monitorFund / MONITOR_TARGET) * 100, 100);
  const watchProgress = Math.min((watchFund / WATCH_TARGET) * 100, 100);
  const machineProgress = Math.min((machineFund / MACHINE_TARGET) * 100, 100);

  const isMonitorGoalReached = monitorFund >= MONITOR_TARGET;
  const isWatchGoalReached = watchFund >= WATCH_TARGET;
  const isMachineGoalReached = machineFund >= MACHINE_TARGET;

  // Sorting users to show Master Owner first
  const sortedUsers = [...users].sort((a, b) => {
    if (a.isAdmin) return -1;
    if (b.isAdmin) return 1;
    return 0;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-black">
        <div className={`w-full max-w-sm bg-neutral-900 border ${pinError ? 'border-red-500/50' : 'border-white/10'} rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden transition-all duration-300 mt-20`}>
          <div className="absolute top-0 right-0 w-32 h-32 gold-gradient opacity-10 blur-[60px] pointer-events-none"></div>
          <div className="text-center space-y-4 relative z-10">
            <div className={`w-16 h-16 ${pinError ? 'bg-red-500' : 'gold-gradient'} rounded-full mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]`}>
              {pinError ? <AlertTriangle className="w-8 h-8 text-white" /> : <ShieldAlert className="w-8 h-8 text-black" />}
            </div>
            <h2 className="text-2xl font-serif gold-text tracking-tight font-black">Owner Verification</h2>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Master Key Required</p>
          </div>
          <form onSubmit={handleAdminAuth} className="space-y-10 relative z-10">
            <div className="flex justify-center">
              <PinInput length={4} value={adminPin} onChange={setAdminPin} label="Enter Dashboard Key" showToggle={true} />
            </div>
            {pinError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">Access Denied: Invalid PIN</p>}
            <button type="submit" disabled={adminPin.length < 4} className="w-full py-5 gold-gradient text-black font-black text-lg rounded-2xl shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50">Verify & Enter</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-44 sm:pt-52 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <header className="space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
             <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Key className="w-8 h-8 gold-text" />
             </div>
             <div>
                <h1 className="text-3xl sm:text-5xl font-serif gold-text font-black tracking-tight">Owner Dashboard</h1>
                <p className="text-gray-500 font-medium text-sm sm:text-base">Secure Master Control Center</p>
             </div>
          </div>
        </header>

        {/* Top Level Tabs */}
        <div className="flex p-1.5 bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl mx-auto sm:mx-0 shadow-xl overflow-hidden">
          <button 
            onClick={() => setActiveTab('balance')} 
            className={`flex-1 py-3.5 sm:py-4 px-1 sm:px-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-widest transition-all duration-300 flex items-center justify-center space-x-1.5 sm:space-x-2 ${activeTab === 'balance' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <CreditCard className="w-3.5 h-3.5 sm:w-4 h-4" />
            <span>Balance</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`flex-1 py-3.5 sm:py-4 px-1 sm:px-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-widest transition-all duration-300 flex items-center justify-center space-x-1.5 sm:space-x-2 ${activeTab === 'users' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 h-4" />
            <span>Accounts</span>
          </button>
          <button 
            onClick={() => setActiveTab('investment')} 
            className={`flex-1 py-3.5 sm:py-4 px-1 sm:px-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-widest transition-all duration-300 flex items-center justify-center space-x-1.5 sm:space-x-2 ${activeTab === 'investment' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 h-4" />
            <span className="hidden sm:inline">Investment</span>
            <span className="sm:hidden">Invest</span>
          </button>
        </div>

        {activeTab === 'balance' ? (
          <div className="space-y-12 page-enter">
            <div className="bg-neutral-900 border border-green-500/30 p-10 sm:p-14 rounded-[3.5rem] relative overflow-hidden group shadow-[0_0_80px_rgba(34,197,94,0.08)]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-green-500 opacity-5 blur-[120px]"></div>
              <div className="relative z-10 flex flex-col items-center justify-center space-y-6 h-full min-h-[160px]">
                <div className="flex items-center space-x-3"><div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div><p className="text-xs font-black text-green-500 uppercase tracking-[0.4em]">Total Approved Balance</p></div>
                <div className="flex items-baseline space-x-3"><span className="text-6xl sm:text-8xl font-black text-green-400 tracking-tighter">₹{adminBalance}</span><IndianRupee className="w-10 h-10 sm:w-16 sm:h-16 text-green-500 opacity-30" /></div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-neutral-900/50 border border-white/10 p-1.5 rounded-full flex items-center shadow-2xl">
                <button onClick={() => setPaymentSubTab('requests')} className={`px-6 sm:px-10 py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${paymentSubTab === 'requests' ? 'bg-[#d4af37] text-black' : 'text-gray-500 hover:text-white'}`}>Requests</button>
                <button onClick={() => setPaymentSubTab('history')} className={`px-6 sm:px-10 py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${paymentSubTab === 'history' ? 'bg-[#d4af37] text-black' : 'text-gray-500 hover:text-white'}`}>History</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {(paymentSubTab === 'requests' ? pendingRequests : historyList).map(tx => <PaymentCard key={tx.id} tx={tx} isPending={paymentSubTab === 'requests'} />)}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-12 page-enter">
            {/* Internal Sub-Tabs for Accounts */}
            <div className="flex justify-center px-2">
              <div className="flex w-full max-w-lg p-1 bg-neutral-900 border border-white/10 rounded-full shadow-2xl overflow-hidden">
                <button 
                  onClick={() => setAccountsSubTab('overview')} 
                  className={`flex-1 px-4 sm:px-8 py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${accountsSubTab === 'overview' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="hidden sm:inline">Accounts Overview</span>
                  <span className="sm:hidden">Overview</span>
                </button>
                <button 
                  onClick={() => setAccountsSubTab('security')} 
                  className={`flex-1 px-4 sm:px-8 py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${accountsSubTab === 'security' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="hidden sm:inline">Security PINs</span>
                  <span className="sm:hidden">PINs</span>
                </button>
              </div>
            </div>

            {accountsSubTab === 'overview' ? (
              <div className="space-y-10 animate-fade-in px-2 sm:px-0">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center space-x-4"><UserCheck className="w-7 h-7 gold-text" /><span>User Data Master Log</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedUsers.map(user => (
                    <UserDataCard key={user.id} user={user} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12 animate-fade-in px-2 sm:px-0">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center space-x-4"><Lock className="w-7 h-7 gold-text" /><span>Security Credentials Master</span></h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                  <PinManagementCard 
                    title="Login PIN" 
                    pin={ownerUser?.pin || ''} 
                    type="login" 
                    length={6} 
                    showPin={showPins.login}
                    onToggleVisibility={() => togglePinVisibility('login')}
                    isEditing={activeChangeForm === 'login'}
                    onToggleEdit={() => activeChangeForm === 'login' ? resetForm() : setActiveChangeForm('login')}
                    formData={formData}
                    setFormData={setFormData}
                    handleUpdatePin={handleUpdatePin}
                  />
                  <PinManagementCard 
                    title="Admin Verification PIN" 
                    pin={adminVerificationPin} 
                    type="admin" 
                    length={4} 
                    showPin={showPins.admin}
                    onToggleVisibility={() => togglePinVisibility('admin')}
                    isEditing={activeChangeForm === 'admin'}
                    onToggleEdit={() => activeChangeForm === 'admin' ? resetForm() : setActiveChangeForm('admin')}
                    formData={formData}
                    setFormData={setFormData}
                    handleUpdatePin={handleUpdatePin}
                  />
                  <PinManagementCard 
                    title="Dashboard Access PIN" 
                    pin={dashboardAccessPin} 
                    type="dashboard" 
                    length={4} 
                    showPin={showPins.dashboard}
                    onToggleVisibility={() => togglePinVisibility('dashboard')}
                    isEditing={activeChangeForm === 'dashboard'}
                    onToggleEdit={() => activeChangeForm === 'dashboard' ? resetForm() : setActiveChangeForm('dashboard')}
                    formData={formData}
                    setFormData={setFormData}
                    handleUpdatePin={handleUpdatePin}
                  />
                </div>
                <div className="p-10 bg-neutral-900/50 rounded-[3rem] border border-white/5 text-center"><p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.6em] animate-pulse">Critical Security Area • Authorization Required</p></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 page-enter">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex justify-center">
                <button onClick={() => setInvestmentMode('divide')} className={`group relative flex items-center space-x-4 px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl ${investmentMode === 'divide' ? 'bg-white text-black' : 'bg-neutral-900 text-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37]'}`}><Layers size={18} /><span>Divide Fund Equally</span>{investmentMode === 'divide' && <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white border-4 border-black"><Check size={12} strokeWidth={4} /></div>}</button>
              </div>
              <div className="flex flex-col space-y-10">
                <div className={`bg-neutral-900 border ${investmentMode === 'monitor' ? 'border-[#d4af37]' : 'border-white/10'} rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group transition-all duration-500`}>
                  <button onClick={() => setInvestmentMode('monitor')} className={`absolute top-8 right-8 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all z-20 ${investmentMode === 'monitor' ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg' : 'bg-black/40 border-white/20 text-gray-500 hover:border-[#d4af37]'}`}><Check size={24} strokeWidth={investmentMode === 'monitor' ? 4 : 2} /></button>
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="w-full md:w-5/12 aspect-square bg-black/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex items-center justify-center relative"><img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop" alt="Monitor" className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-[3s]" /><div className="absolute inset-0 flex items-center justify-center"><div className="p-6 bg-black/60 backdrop-blur-md rounded-full border border-white/10"><Monitor className="w-12 h-12 text-[#d4af37]" /></div></div></div>
                    <div className="w-full md:w-7/12 space-y-6 text-center md:text-left"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37]">Upcoming Asset #1</span><h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">24" Ultra HD Monitor</h2><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Refresh Rate: 100 Hz</p><p className="text-4xl font-black gold-text">₹{MONITOR_TARGET.toLocaleString()}</p></div>
                  </div>
                  <div className="mt-12 space-y-6"><div className="flex items-end justify-between px-2"><div><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Funded</p><p className="text-2xl font-black text-white">₹{monitorFund.toLocaleString()} <span className="text-gray-600 font-medium">/ ₹{MONITOR_TARGET.toLocaleString()}</span></p></div><div className="text-right"><p className={`text-3xl font-black ${isMonitorGoalReached ? 'text-green-500' : 'gold-text'}`}>{Math.floor(monitorProgress)}%</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Reached</p></div></div><div className="h-6 w-full bg-black rounded-full overflow-hidden border border-white/5 p-1"><div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isMonitorGoalReached ? 'bg-green-500 shadow-lg' : 'gold-gradient'}`} style={{ width: `${monitorProgress}%` }}><div className="absolute inset-0 bg-white/20 animate-pulse"></div></div></div></div>
                </div>
                <div className={`bg-neutral-900 border ${investmentMode === 'watch' ? 'border-[#d4af37]' : 'border-white/10'} rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group transition-all duration-500`}>
                  <button onClick={() => setInvestmentMode('watch')} className={`absolute top-8 right-8 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all z-20 ${investmentMode === 'watch' ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg' : 'bg-black/40 border-white/20 text-gray-500 hover:border-[#d4af37]'}`}><Check size={24} strokeWidth={investmentMode === 'watch' ? 4 : 2} /></button>
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="w-full md:w-5/12 aspect-square bg-black/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex items-center justify-center relative"><img src="https://images.unsplash.com/photo-1617625818242-8191a7837452?q=80&w=1000&auto=format&fit=crop" alt="Watch" className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-[3s]" /><div className="absolute inset-0 flex items-center justify-center"><div className="p-6 bg-black/60 backdrop-blur-md rounded-full border border-white/10"><Watch className="w-12 h-12 text-[#d4af37]" /></div></div></div>
                    <div className="w-full md:w-7/12 space-y-6 text-center md:text-left"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37]">Upcoming Asset #2</span><h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">Galaxy Watch 8 Series</h2><p className="text-4xl font-black gold-text">₹{WATCH_TARGET.toLocaleString()}</p></div>
                  </div>
                  <div className="mt-12 space-y-6"><div className="flex items-end justify-between px-2"><div><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Funded</p><p className="text-2xl font-black text-white">₹{watchFund.toLocaleString()} <span className="text-gray-600 font-medium">/ ₹{WATCH_TARGET.toLocaleString()}</span></p></div><div className="text-right"><p className={`text-3xl font-black ${isWatchGoalReached ? 'text-green-500' : 'gold-text'}`}>{Math.floor(watchProgress)}%</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Reached</p></div></div><div className="h-6 w-full bg-black rounded-full overflow-hidden border border-white/5 p-1"><div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isWatchGoalReached ? 'bg-green-500 shadow-lg' : 'gold-gradient'}`} style={{ width: `${watchProgress}%` }}><div className="absolute inset-0 bg-white/20 animate-pulse"></div></div></div></div>
                </div>
                <div className={`bg-neutral-900 border ${investmentMode === 'machine' ? 'border-[#d4af37]' : 'border-white/10'} rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group transition-all duration-500`}>
                  <button onClick={() => setInvestmentMode('machine')} className={`absolute top-8 right-8 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all z-20 ${investmentMode === 'machine' ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg' : 'bg-black/40 border-white/20 text-gray-500 hover:border-[#d4af37]'}`}><Check size={24} strokeWidth={investmentMode === 'machine' ? 4 : 2} /></button>
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="w-full md:w-5/12 aspect-square bg-black/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex items-center justify-center relative"><img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop" alt="Machine" className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-[3s]" /><div className="absolute inset-0 flex items-center justify-center"><div className="p-6 bg-black/60 backdrop-blur-md rounded-full border border-white/10"><Cpu className="w-12 h-12 text-[#d4af37]" /></div></div></div>
                    <div className="w-full md:w-7/12 space-y-6 text-center md:text-left"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37]">Upcoming Asset #3</span><h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">Homework Automation Machine</h2><p className="text-4xl font-black gold-text">₹{MACHINE_TARGET.toLocaleString()}</p></div>
                  </div>
                  <div className="mt-12 space-y-6"><div className="flex items-end justify-between px-2"><div><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Funded</p><p className="text-2xl font-black text-white">₹{machineFund.toLocaleString()} <span className="text-gray-600 font-medium">/ ₹{MACHINE_TARGET.toLocaleString()}</span></p></div><div className="text-right"><p className={`text-3xl font-black ${isMachineGoalReached ? 'text-green-500' : 'gold-text'}`}>{Math.floor(machineProgress)}%</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Reached</p></div></div><div className="h-6 w-full bg-black rounded-full overflow-hidden border border-white/5 p-1"><div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isMachineGoalReached ? 'bg-green-500 shadow-lg' : 'gold-gradient'}`} style={{ width: `${machineProgress}%` }}><div className="absolute inset-0 bg-white/20 animate-pulse"></div></div></div></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Fixed PaymentCard component with Emergency functionality
const PaymentCard: React.FC<{ tx: Transaction; isPending: boolean }> = ({ tx, isPending }) => {
  const { users, requests, updateTransaction } = useStore();
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState<'Approved' | 'Rejected'>(tx.status as any);

  const student = users.find(u => u.id === tx.userId);
  const homework = requests.find(r => r.id === tx.homeworkId);

  const handleEmergencyUpdate = () => {
    updateTransaction(tx.id, emergencyStatus);
    setIsEmergencyMode(false);
  };

  return (
    <div className="bg-neutral-900 border border-white/5 p-8 rounded-[2.5rem] space-y-6 hover:border-[#d4af37]/30 transition-all shadow-xl group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 gold-gradient opacity-0 group-hover:opacity-5 blur-[40px] transition-opacity duration-700 pointer-events-none"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Student</p>
          <p className="text-lg font-black text-white truncate max-w-[150px]">{student?.fullName || 'Unknown Student'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</p>
          <p className="text-2xl font-black text-[#d4af37]">₹{tx.amount}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Subject</p>
          <p className="text-sm font-bold text-gray-300">{homework?.subject || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ref ID</p>
          <p className="text-sm font-mono text-gray-400 truncate" title={tx.transactionId}>{tx.transactionId || '—'}</p>
        </div>
      </div>

      <div className="pt-4 relative z-10">
        {isPending ? (
          <div className="flex gap-3">
            <button 
              onClick={() => updateTransaction(tx.id, 'Approved')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/10 active:scale-95"
            >
              Approve
            </button>
            <button 
              onClick={() => updateTransaction(tx.id, 'Rejected')}
              className="flex-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <span className={`inline-flex items-center px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                tx.status === 'Approved' 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {tx.status}
              </span>
            </div>

            {/* EMERGENCY BUTTON */}
            <button 
              onClick={() => setIsEmergencyMode(!isEmergencyMode)}
              className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${isEmergencyMode ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}
            >
              EMERGENCY
            </button>

            {/* Inline Emergency controls */}
            {isEmergencyMode && (
              <div className="bg-black/40 border border-red-500/20 p-5 rounded-2xl space-y-5 animate-page-enter">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Correct Status Entry</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEmergencyStatus('Approved')}
                    className={`flex-1 py-3 rounded-lg text-[9px] font-black transition-all ${emergencyStatus === 'Approved' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-600'}`}
                  >
                    APPROVE
                  </button>
                  <button 
                    onClick={() => setEmergencyStatus('Rejected')}
                    className={`flex-1 py-3 rounded-lg text-[9px] font-black transition-all ${emergencyStatus === 'Rejected' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-600'}`}
                  >
                    REJECT
                  </button>
                </div>
                <button 
                  onClick={handleEmergencyUpdate}
                  className="w-full bg-white text-black py-3 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#d4af37] transition-all"
                >
                  UPDATE
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
           <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Activity</p>
           <p className="text-[9px] font-bold text-gray-500">
              {new Date(tx.updatedAt || tx.createdAt).toLocaleString()}
           </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
