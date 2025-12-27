
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, HomeworkRequest, Transaction, ChatMessage, AppState } from './types';

// Supabase Connection Keys
const SUPABASE_URL = 'https://usslhkfcacxjbuiyimhx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc2xoa2ZjYWN4amJ1aXlpbWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODY1MTEsImV4cCI6MjA4MjM2MjUxMX0.MLj_rbSirjryBfZ__8NRKO1AirZWtxoBLB0u_j0AhPw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const OWNER_NUMBER = '9370320527';
const CONFIG_ID = '1';

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
  setInvestmentMode: (mode: string) => Promise<void>;
  setAdminVerificationPin: (pin: string) => Promise<void>;
  setDashboardAccessPin: (pin: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const savedUser = localStorage.getItem('piyush_hw_user');
    return {
      currentUser: savedUser ? JSON.parse(savedUser) : null,
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
    };
  });

  const refreshData = useCallback(async () => {
    try {
      const [
        { data: profiles },
        { data: requests },
        { data: txs },
        { data: msgs },
        { data: config }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('homework_requests').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('messages').select('*').order('timestamp', { ascending: true }),
        supabase.from('app_config').select('*').eq('id', CONFIG_ID).maybeSingle()
      ]);

      setState(prev => ({
        ...prev,
        users: (profiles || []).map(p => ({
          id: String(p.id),
          fullName: p.full_name,
          phoneNumber: p.phone_number,
          pin: p.pin,
          isAdmin: p.is_admin || p.phone_number === OWNER_NUMBER
        })),
        requests: (requests || []).map(r => ({
          ...r,
          id: String(r.id),
          userId: String(r.user_id),
          calculationType: r.calculation_type,
          deliveryDays: r.delivery_days,
          specialInstructions: r.special_instructions,
          estimatedAmount: r.estimated_amount,
          originalAmount: r.original_amount,
          discountAmount: r.discount_amount,
          paymentStatus: r.payment_status,
          paymentMethod: r.payment_method,
          seasonId: r.season_id,
          createdAt: r.created_at
        })),
        transactions: (txs || []).map(t => ({
          ...t,
          id: String(t.id),
          userId: String(t.user_id),
          homeworkId: String(t.homework_id),
          createdAt: t.created_at,
          updatedAt: t.updated_at
        })),
        messages: (msgs || []).map(m => ({
          id: String(m.id),
          senderId: String(m.sender_id),
          receiverId: String(m.receiver_id),
          text: m.text,
          fileData: m.file_data,
          fileName: m.file_name,
          fileType: m.file_type,
          timestamp: m.timestamp
        })),
        adminBalance: config?.admin_balance ?? 0,
        activeSeasonId: config?.active_season_id ?? null,
        bannerClicks: config?.banner_clicks ?? 0,
        investmentMode: config?.investment_mode ?? 'machine',
        adminVerificationPin: config?.admin_verification_pin ?? '9370',
        dashboardAccessPin: config?.dashboard_access_pin ?? '9370'
      }));
    } catch (err: any) {
      console.error('Refresh Failed:', err.message || 'Unknown Error');
    }
  }, []);

  useEffect(() => {
    refreshData();
    
    // Optimized Realtime Subscription
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework_requests' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config' }, () => refreshData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage: ChatMessage = {
          id: String(payload.new.id),
          senderId: String(payload.new.sender_id),
          receiverId: String(payload.new.receiver_id),
          text: payload.new.text,
          fileData: payload.new.file_data,
          fileName: payload.new.file_name,
          fileType: payload.new.file_type,
          timestamp: payload.new.timestamp
        };
        
        setState(prev => {
          // Avoid duplicate messages if already added optimistically
          if (prev.messages.some(m => m.id === newMessage.id)) return prev;
          return { ...prev, messages: [...prev.messages, newMessage] };
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refreshData]);

  const setCurrentUser = (user: User | null) => {
    setState(prev => ({ ...prev, currentUser: user }));
    if (user) localStorage.setItem('piyush_hw_user', JSON.stringify(user));
    else localStorage.removeItem('piyush_hw_user');
  };
  
  const addUser = async (user: User) => {
    const { error } = await supabase.from('profiles').insert([{
      id: String(user.id),
      full_name: user.fullName,
      phone_number: user.phoneNumber,
      pin: user.pin,
      is_admin: user.phoneNumber === OWNER_NUMBER
    }]);
    if (error) throw new Error(error.message);
    await refreshData();
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.pin !== undefined) dbUpdates.pin = updates.pin;
    if (updates.isAdmin !== undefined) dbUpdates.is_admin = updates.isAdmin;
    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', String(id));
    if (error) throw new Error(error.message);
    await refreshData();
  };

  const addRequest = async (req: HomeworkRequest) => {
    const { error } = await supabase.from('homework_requests').insert([{
      id: String(req.id),
      user_id: String(req.userId),
      subject: req.subject,
      pages: req.pages,
      lessons: req.lessons,
      calculation_type: req.calculationType,
      grade: req.grade,
      language: req.language,
      handwriting_style: req.handwritingStyle,
      delivery_days: req.deliveryDays,
      special_instructions: req.specialInstructions,
      estimated_amount: req.estimatedAmount,
      original_amount: req.originalAmount,
      discount_amount: req.discountAmount,
      status: req.status,
      payment_status: req.paymentStatus,
      payment_method: req.paymentMethod,
      season_id: req.seasonId
    }]);
    if (error) throw new Error(error.message);
    await refreshData();
  };

  const updateRequest = async (id: string, updates: Partial<HomeworkRequest>) => {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
    const { error } = await supabase.from('homework_requests').update(dbUpdates).eq('id', String(id));
    if (error) throw new Error(error.message);
    await refreshData();
  };

  const addTransaction = async (tx: Transaction) => {
    const { error } = await supabase.from('transactions').insert([{
      id: String(tx.id),
      user_id: String(tx.userId),
      homework_id: String(tx.homeworkId),
      amount: tx.amount,
      transaction_id: tx.transactionId,
      status: tx.status
    }]);
    if (error) throw new Error(error.message);
    await refreshData();
  };

  const updateTransaction = async (id: string, status: 'Approved' | 'Rejected') => {
    const { data: tx, error: fetchError } = await supabase.from('transactions').select('*').eq('id', String(id)).single();
    if (fetchError) throw new Error(fetchError.message);
    const { error: updateError } = await supabase.from('transactions').update({ status, updated_at: new Date().toISOString() }).eq('id', String(id));
    if (updateError) throw new Error(updateError.message);
    let newBalance = state.adminBalance;
    if (status === 'Approved' && tx.status !== 'Approved') newBalance += tx.amount;
    else if (status === 'Rejected' && tx.status === 'Approved') newBalance -= tx.amount;
    if (newBalance !== state.adminBalance) {
      await updateConfig({ admin_balance: newBalance });
    }
    await refreshData();
  };

  const addMessage = async (msg: ChatMessage) => {
    // Optimistic UI Update: Add to state immediately
    setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));

    const { error } = await supabase.from('messages').insert([{
      id: String(msg.id),
      sender_id: String(msg.senderId),
      receiver_id: String(msg.receiverId),
      text: msg.text,
      file_data: msg.fileData,
      file_name: msg.fileName,
      file_type: msg.fileType,
      timestamp: msg.timestamp
    }]);
    
    if (error) {
      // Revert optimistic update on error
      setState(prev => ({ ...prev, messages: prev.messages.filter(m => m.id !== msg.id) }));
      console.error("Message Send Error:", error);
      throw new Error(error.message);
    }
  };

  const updateConfig = async (updates: any) => {
    const { error } = await supabase.from('app_config').upsert({ id: String(CONFIG_ID), ...updates });
    if (error) console.error("Supabase Config Update Error:", error);
    else await refreshData();
  };

  const setActiveSeason = (id: string | null) => updateConfig({ active_season_id: id });
  const trackBannerClick = () => updateConfig({ banner_clicks: state.bannerClicks + 1 });
  const setInvestmentMode = (mode: string) => updateConfig({ investment_mode: mode });
  const setAdminVerificationPin = (pin: string) => updateConfig({ admin_verification_pin: pin });
  const setDashboardAccessPin = (pin: string) => updateConfig({ dashboard_access_pin: pin });

  const logout = () => setCurrentUser(null);

  const value: StoreContextType = {
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
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
