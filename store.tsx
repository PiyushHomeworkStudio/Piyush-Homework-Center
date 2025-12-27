
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, HomeworkRequest, Transaction, ChatMessage, AppState } from './types';

// Supabase Connection Keys
const SUPABASE_URL = 'https://usslhkfcacxjbuiyimhx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc2xoa2ZjYWN4amJ1aXlpbWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODY1MTEsImV4cCI6MjA4MjM2MjUxMX0.MLj_rbSirjryBfZ__8NRKO1AirZWtxoBLB0u_j0AhPw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const OWNER_NUMBER = '9370320527';

export const SEASONS = [
  { id: 'newyear', title: 'Happy New Year Offer', discount: 25, theme: 'newyear' as const },
  { id: 'summer', title: 'Summer Assignment Special', discount: 40, theme: 'summer' as const },
  { id: 'diwali', title: 'Diwali Sale', discount: 50, theme: 'diwali' as const }
];

interface StoreContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  addRequest: (req: HomeworkRequest) => Promise<void>;
  updateRequest: (id: string, updates: Partial<HomeworkRequest>) => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  updateTransaction: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
  addMessage: (msg: ChatMessage) => Promise<void>;
  setActiveSeason: (id: string | null) => Promise<void>;
  trackBannerClick: () => Promise<void>;
  setInvestmentMode: (mode: 'machine' | 'watch' | 'monitor' | 'divide') => Promise<void>;
  setAdminVerificationPin: (pin: string) => Promise<void>;
  setDashboardAccessPin: (pin: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    requests: [],
    transactions: [],
    messages: [],
    adminBalance: 0,
    activeSeasonId: null,
    bannerClicks: 0,
    investmentMode: 'machine',
    adminVerificationPin: '9370',
    dashboardAccessPin: '9370'
  });

  const refreshData = async () => {
    try {
      const [
        { data: profiles, error: pError },
        { data: requests, error: rError },
        { data: txs, error: tError },
        { data: msgs, error: mError },
        { data: config, error: cError }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('homework_requests').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('messages').select('*'),
        supabase.from('app_config').select('*').maybeSingle() // Use maybeSingle to avoid 406 if empty
      ]);

      if (pError) console.error("Profiles Table Error:", pError.message);
      if (rError) console.error("Requests Table Error:", rError.message);
      if (tError) console.error("Transactions Table Error:", tError.message);
      if (mError) console.error("Messages Table Error:", mError.message);
      if (cError) console.error("App Config Error:", cError.message);

      setState(prev => ({
        ...prev,
        users: (profiles || []).map(p => ({
          id: p.id,
          fullName: p.full_name,
          phoneNumber: p.phone_number,
          pin: p.pin,
          isAdmin: p.is_admin
        })),
        requests: (requests || []).map(r => ({
          ...r,
          userId: r.user_id,
          calculationType: r.calculation_type,
          deliveryDays: r.delivery_days,
          specialInstructions: r.special_instructions,
          estimatedAmount: r.estimated_amount,
          originalAmount: r.original_amount,
          paymentStatus: r.payment_status,
          paymentMethod: r.payment_method,
          seasonId: r.season_id,
          createdAt: r.created_at
        })),
        transactions: (txs || []).map(t => ({
          ...t,
          userId: t.user_id,
          homeworkId: t.homework_id,
          createdAt: t.created_at,
          updatedAt: t.updated_at
        })),
        messages: (msgs || []).map(m => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          text: m.text,
          fileData: m.file_data,
          fileName: m.file_name,
          fileType: m.file_type,
          timestamp: m.timestamp
        })),
        // Use defaults if config row is missing
        adminBalance: config?.admin_balance ?? 0,
        activeSeasonId: config?.active_season_id ?? null,
        bannerClicks: config?.banner_clicks ?? 0,
        investmentMode: config?.investment_mode ?? 'machine',
        adminVerificationPin: config?.admin_verification_pin ?? '9370',
        dashboardAccessPin: config?.dashboard_access_pin ?? '9370'
      }));
    } catch (err) {
      console.error('Store Sync Failed:', err);
    }
  };

  useEffect(() => {
    refreshData();
    
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework_requests' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config' }, () => refreshData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setCurrentUser = (user: User | null) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };
  
  const addUser = async (user: User) => {
    const { data, error } = await supabase.from('profiles').insert([{
      full_name: user.fullName,
      phone_number: user.phoneNumber,
      pin: user.pin,
      is_admin: user.phoneNumber === OWNER_NUMBER
    }]).select().single();
    
    if (error) {
      console.error("Add User Error:", error.message);
      alert("Registration failed: " + error.message);
    } else if (data) {
      const dbUser = {
        id: data.id,
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        pin: data.pin,
        isAdmin: data.is_admin
      };
      setCurrentUser(dbUser);
      await refreshData();
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const dbUpdates: any = {};
    if (updates.fullName) dbUpdates.full_name = updates.fullName;
    if (updates.phoneNumber) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.pin) dbUpdates.pin = updates.pin;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', id);
    if (error) console.error("Update User Error:", error.message);
    if (!error) {
      await refreshData();
      if (state.currentUser?.id === id) {
        setCurrentUser({ ...state.currentUser, ...updates } as User);
      }
    }
  };

  const addRequest = async (req: HomeworkRequest) => {
    const { error } = await supabase.from('homework_requests').insert([{
      user_id: req.userId,
      subject: req.subject,
      calculation_type: req.calculationType,
      pages: req.pages,
      lessons: req.lessons,
      grade: req.grade,
      language: req.language,
      handwriting_style: req.handwritingStyle,
      delivery_days: req.deliveryDays,
      special_instructions: req.specialInstructions,
      estimated_amount: req.estimatedAmount,
      original_amount: req.originalAmount,
      status: req.status,
      payment_status: req.paymentStatus,
      payment_method: req.paymentMethod,
      season_id: req.seasonId
    }]);
    if (error) console.error("Add Request Error:", error.message);
    if (!error) await refreshData();
  };

  const updateRequest = async (id: string, updates: Partial<HomeworkRequest>) => {
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;

    const { error } = await supabase.from('homework_requests').update(dbUpdates).eq('id', id);
    if (error) console.error("Update Request Error:", error.message);
    if (!error) await refreshData();
  };

  const addTransaction = async (tx: Transaction) => {
    const { error } = await supabase.from('transactions').insert([{
      user_id: tx.userId,
      homework_id: tx.homeworkId,
      amount: tx.amount,
      transaction_id: tx.transactionId,
      status: tx.status
    }]);
    if (error) console.error("Add Transaction Error:", error.message);
    if (!error) await refreshData();
  };

  const updateTransaction = async (id: string, status: 'Approved' | 'Rejected') => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    let balanceChange = 0;
    if (tx.status === 'Approved' && status === 'Rejected') balanceChange = -tx.amount;
    else if ((tx.status === 'Pending' || tx.status === 'Rejected') && status === 'Approved') balanceChange = tx.amount;

    const { error: tError } = await supabase.from('transactions').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    const { error: rError } = await supabase.from('homework_requests').update({ payment_status: status === 'Approved' ? 'Paid' : 'Unpaid' }).eq('id', tx.homeworkId);
    
    if (balanceChange !== 0) {
      await supabase.from('app_config').update({ admin_balance: state.adminBalance + balanceChange }).eq('id', 1);
    }
    
    if (tError || rError) console.error("Update Transaction Error:", tError?.message || rError?.message);
    await refreshData();
  };

  const addMessage = async (msg: ChatMessage) => {
    const { error } = await supabase.from('messages').insert([{
      sender_id: msg.senderId,
      receiver_id: msg.receiverId,
      text: msg.text,
      file_data: msg.fileData,
      file_name: msg.fileName,
      file_type: msg.fileType
    }]);
    if (error) console.error("Add Message Error:", error.message);
    if (!error) await refreshData();
  };

  const setActiveSeason = async (id: string | null) => {
    await supabase.from('app_config').update({ active_season_id: id }).eq('id', 1);
    await refreshData();
  };

  const trackBannerClick = async () => {
    await supabase.from('app_config').update({ banner_clicks: state.bannerClicks + 1 }).eq('id', 1);
    await refreshData();
  };

  const setInvestmentMode = async (mode: 'machine' | 'watch' | 'monitor' | 'divide') => {
    await supabase.from('app_config').update({ investment_mode: mode }).eq('id', 1);
    await refreshData();
  };

  const setAdminVerificationPin = async (pin: string) => {
    await supabase.from('app_config').update({ admin_verification_pin: pin }).eq('id', 1);
    await refreshData();
  };

  const setDashboardAccessPin = async (pin: string) => {
    await supabase.from('app_config').update({ dashboard_access_pin: pin }).eq('id', 1);
    await refreshData();
  };

  const logout = () => setCurrentUser(null);

  return (
    <StoreContext.Provider value={{ 
      ...state, 
      setCurrentUser, 
      addUser, 
      updateUser,
      addRequest, 
      updateRequest, 
      addTransaction, 
      updateTransaction, 
      addMessage,
      setActiveSeason,
      trackBannerClick,
      setInvestmentMode,
      setAdminVerificationPin,
      setDashboardAccessPin,
      logout,
      refreshData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
