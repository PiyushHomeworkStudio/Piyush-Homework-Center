
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, SEASONS } from '../store';
import { User, HomeworkRequest, Transaction, HomeworkStatus } from '../types';
import { 
  Users, Check, X, ShieldAlert, ChevronRight, ArrowLeft, 
  ClipboardList, IndianRupee, BarChart3, PieChart, TrendingUp, 
  BookOpen, Layers, Clock, Star, Zap, Power, LogOut, Gift,
  Smartphone, Calendar, CreditCard, Sparkles
} from 'lucide-react';
import PinInput from '../components/PinInput';

const AdminPanel: React.FC = () => {
  const { users, requests, transactions, updateRequest, updateTransaction, activeSeasonId, setActiveSeason, bannerClicks, adminVerificationPin } = useStore();
  const [adminPin, setAdminPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'students' | 'analytics' | 'season'>('students');
  const navigate = useNavigate();

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === adminVerificationPin) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Admin PIN');
      setAdminPin('');
    }
  };

  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const totalPages = requests.reduce((sum, r) => sum + r.pages, 0);
    const totalRevenue = requests.reduce((sum, r) => sum + r.estimatedAmount, 0);
    const activeUsers = users.filter(u => !u.isAdmin).length;

    const subjects: Record<string, number> = {};
    requests.forEach(r => {
      subjects[r.subject] = (subjects[r.subject] || 0) + 1;
    });
    const sortedSubjects = Object.entries(subjects).sort((a, b) => b[1] - a[1]);
    const mostRequestedSubject = sortedSubjects[0]?.[0] || 'N/A';

    const monthlyData: Record<string, { requests: number; pages: number }> = {};
    requests.forEach(r => {
      const date = new Date(r.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { requests: 0, pages: 0 };
      monthlyData[month].requests += 1;
      monthlyData[month].pages += r.pages;
    });

    const userRequestCounts: Record<string, number> = {};
    requests.forEach(r => {
      userRequestCounts[r.userId] = (userRequestCounts[r.userId] || 0) + 1;
    });
    const topUserId = Object.entries(userRequestCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topUser = users.find(u => u.id === topUserId)?.fullName || 'N/A';

    const seasonRequests = requests.filter(r => !!r.seasonId);
    const totalSeasonDiscount = requests.reduce((sum, r) => sum + (r.originalAmount ? r.originalAmount - r.estimatedAmount : 0), 0);
    const seasonUsers = users.filter(u => requests.some(r => r.userId === u.id && !!r.seasonId));
    const conversionRate = bannerClicks > 0 ? (seasonRequests.length / bannerClicks) * 100 : 0;

    return {
      totalRequests,
      totalPages,
      totalRevenue,
      activeUsers,
      mostRequestedSubject,
      sortedSubjects,
      monthlyData,
      topUser,
      avgPages: totalRequests ? (totalPages / totalRequests).toFixed(1) : 0,
      seasonAnalytics: {
        totalRequests: seasonRequests.length,
        totalDiscount: totalSeasonDiscount,
        totalPages: seasonRequests.reduce((sum, r) => sum + r.pages, 0),
        bannerClicks,
        conversionRate: conversionRate.toFixed(1),
        usersUsingOffers: seasonUsers.map(u => ({
          name: u.fullName,
          phone: u.phoneNumber,
          season: requests.find(r => r.userId === u.id && !!r.seasonId)?.seasonId
        }))
      }
    };
  }, [requests, users, bannerClicks]);

  // Analytics logic for the selected user detail view
  const userStats = useMemo(() => {
    if (!selectedUser) return null;
    const userRequests = requests.filter(r => r.userId === selectedUser.id);
    const pendingHw = userRequests.filter(r => r.status !== 'Completed');
    const completedHw = userRequests.filter(r => r.status === 'Completed');
    
    return {
      all: userRequests,
      pending: pendingHw,
      completed: completedHw,
      totalPendingFees: pendingHw.reduce((acc, r) => acc + r.estimatedAmount, 0),
      remainingFees: userRequests.filter(r => r.paymentStatus === 'Unpaid').reduce((acc, r) => acc + r.estimatedAmount, 0),
      totalPaid: userRequests.filter(r => r.paymentStatus === 'Paid').reduce((acc, r) => acc + r.estimatedAmount, 0),
      expectedEarnings: userRequests.reduce((acc, r) => acc + r.estimatedAmount, 0),
    };
  }, [selectedUser, requests]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-48 sm:pt-56 pb-20 px-6 bg-black relative">
        <div className="w-full max-w-sm mb-10 scroll-reveal reveal-down">
          <button 
            onClick={() => navigate('/owner-dashboard')}
            className="flex items-center space-x-3 bg-white/5 border border-white/10 px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] text-white hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#d4af37]/5 transition-all group shadow-2xl active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            <span>Back to Owner Hub</span>
          </button>
        </div>

        <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl scroll-reveal reveal-zoom relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 gold-gradient opacity-10 blur-[60px] pointer-events-none"></div>
          <div className="text-center space-y-4 relative z-10">
            <div className="w-16 h-16 gold-gradient rounded-full mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] flex-shrink-0">
              <ShieldAlert className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-serif gold-text">Admin Verification</h2>
            <p className="text-gray-500 text-sm font-medium">Verify credentials to continue</p>
          </div>
          <form onSubmit={handleAdminAuth} className="space-y-8 relative z-10">
            <div className="flex justify-center">
              <PinInput length={4} value={adminPin} onChange={setAdminPin} label="Enter Security PIN" showToggle={true} />
            </div>
            <button type="submit" disabled={adminPin.length < 4} className="w-full py-5 gold-gradient text-black font-black text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50">Access Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-44 sm:pt-52 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex p-2 bg-neutral-900 border border-white/10 rounded-[2rem] w-full max-w-lg shadow-2xl">
            <button 
              onClick={() => setActiveAdminTab('students')}
              className={`flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 ${activeAdminTab === 'students' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Students HW</span>
              <span className="sm:hidden">HW</span>
            </button>
            <button 
              onClick={() => setActiveAdminTab('analytics')}
              className={`flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 ${activeAdminTab === 'analytics' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">HW Analytics</span>
              <span className="sm:hidden">Stats</span>
            </button>
            <button 
              onClick={() => setActiveAdminTab('season')}
              className={`flex-1 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 ${activeAdminTab === 'season' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Gift className="w-4 h-4" />
              <span>Season</span>
            </button>
          </div>

          <button 
            onClick={() => navigate('/owner-dashboard')}
            className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all group shadow-2xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Panel</span>
          </button>
        </div>

        {activeAdminTab === 'students' ? (
          <div className="page-enter">
            {!selectedUser ? (
              <div className="space-y-10">
                <header className="scroll-reveal reveal-down flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-[#d4af37]">
                      <Users className="w-6 h-6" />
                      <span className="text-xs font-black uppercase tracking-[0.3em]">Owner Access</span>
                    </div>
                    <h1 className="text-4xl font-serif gold-text leading-tight">Registered Students</h1>
                    <p className="text-gray-500 font-medium">Manage student tasks and verified payments.</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-4 scroll-reveal reveal-up">
                  {users.filter(u => !u.isAdmin).map((user, idx) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="w-full bg-neutral-900 border border-white/5 p-8 rounded-[2rem] flex items-center justify-between hover:border-[#d4af37]/50 hover:bg-white/5 transition-all group shadow-xl"
                      style={{ transitionDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-center space-x-6 text-left">
                        <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-black font-black text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-2xl font-black group-hover:gold-text transition-colors">{user.fullName}</p>
                          <p className="text-sm text-gray-500 font-mono tracking-widest">{user.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex flex-col items-end mr-4">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Requests</span>
                          <span className="text-lg font-bold">{requests.filter(r => r.userId === user.id && r.status !== 'Completed').length}</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-[#d4af37] group-hover:translate-x-2 transition-all duration-300 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col space-y-6">
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors w-fit group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to Students List</span>
                  </button>

                  <div className="bg-neutral-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 gold-gradient opacity-10 blur-[100px] pointer-events-none"></div>
                    <div className="flex items-center space-x-8 text-center md:text-left relative z-10">
                      <div className="w-20 h-20 rounded-[2rem] gold-gradient flex items-center justify-center text-black font-black text-3xl shadow-xl flex-shrink-0">
                        {selectedUser.fullName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h1 className="text-3xl sm:text-4xl font-black gold-text uppercase tracking-tighter">{selectedUser.fullName}</h1>
                        <p className="text-gray-500 font-mono tracking-[0.2em]">{selectedUser.phoneNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex bg-black/40 border border-white/5 rounded-2xl p-6 divide-x divide-white/10 relative z-10">
                      <div className="px-6 text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Fee</p>
                        <p className="text-2xl font-black text-[#d4af37]">₹{userStats?.totalPendingFees}</p>
                      </div>
                      <div className="px-6 text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tasks</p>
                        <p className="text-2xl font-black">{userStats?.all.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* USER ANALYTICS SECTION */}
                <div className="bg-neutral-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-10 scroll-reveal reveal-up">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center space-x-3">
                      <BarChart3 className="w-6 h-6 text-[#d4af37]" />
                      <span>{selectedUser.fullName.split(' ')[0]} Analytics</span>
                    </h2>
                  </div>

                  {/* Status Summaries */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem] text-center space-y-2 group hover:border-[#d4af37]/30 transition-all">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pending Homework</p>
                      <p className="text-4xl sm:text-5xl font-black text-white">{userStats?.pending.length}</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem] text-center space-y-2 group hover:border-[#d4af37]/30 transition-all">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Completed Homework</p>
                      <p className="text-4xl sm:text-5xl font-black text-green-500">{userStats?.completed.length}</p>
                    </div>
                  </div>

                  {/* Pending Homework List */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-2">
                       <Clock size={14} className="text-[#d4af37]" />
                       <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Pending Task Details</h3>
                    </div>
                    {userStats?.pending.length === 0 ? (
                      <div className="p-10 bg-black/20 rounded-[2.5rem] border border-dashed border-white/10 text-center">
                        <p className="text-gray-600 font-bold uppercase tracking-widest text-xs italic">No pending work for {selectedUser.fullName.split(' ')[0]}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {userStats?.pending.map(req => (
                          <div key={req.id} className="bg-black/40 border border-white/5 px-8 py-5 rounded-2xl flex items-center justify-between hover:bg-black/60 transition-all">
                            <div className="flex items-center space-x-6">
                              <span className="text-white font-black text-lg">{req.subject}</span>
                              <div className="flex items-center space-x-2 text-[10px] bg-white/5 text-gray-400 px-3 py-1.5 rounded-full border border-white/10 uppercase font-black tracking-widest">
                                <Layers size={10} />
                                <span>{req.pages} Pages</span>
                              </div>
                            </div>
                            <span className="text-[#d4af37] font-black text-xl">₹{req.estimatedAmount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Financial Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-white/5">
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Remaining Fees</p>
                      <p className="text-3xl font-black text-red-500 tracking-tighter">₹{userStats?.remainingFees}</p>
                      <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">To be collected</p>
                    </div>
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Paid Amount</p>
                      <p className="text-3xl font-black text-green-500 tracking-tighter">₹{userStats?.totalPaid}</p>
                      <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">Verified receipts</p>
                    </div>
                    <div className="bg-black/20 p-6 rounded-3xl border border-[#d4af37]/20 space-y-1">
                      <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">Expected Total Earnings</p>
                      <p className="text-3xl font-black gold-text tracking-tighter">₹{userStats?.expectedEarnings}</p>
                      <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">Lifetime value</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-12">
                  <div className="space-y-8">
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center space-x-3">
                      <ClipboardList className="w-6 h-6 text-[#d4af37]" />
                      <span>Homework Management</span>
                    </h2>
                    
                    {requests.filter(r => r.userId === selectedUser.id).length === 0 ? (
                      <div className="bg-neutral-900/50 border border-dashed border-white/10 rounded-[2.5rem] p-20 text-center">
                        <p className="text-gray-500 font-medium">No homework tasks found for this student.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {requests.filter(r => r.userId === selectedUser.id).map((req) => (
                          <div key={req.id} className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10 space-y-10 hover:border-[#d4af37]/30 transition-all group shadow-xl">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-3xl font-black">{req.subject}</h3>
                                  <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold text-gray-400">{req.pages} Pages</span>
                                </div>
                                <div className="flex flex-wrap gap-4 pt-1">
                                  <span className="bg-black/40 text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/5">Method: {req.paymentMethod}</span>
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${req.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{req.paymentStatus}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 bg-black/30 p-2 rounded-2xl border border-white/5">
                                {(['Pending', 'Writing', 'Delay', 'Completed'] as HomeworkStatus[]).map(status => (
                                  <button 
                                    key={status} 
                                    onClick={() => updateRequest(req.id, { status })} 
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${req.status === status ? 'bg-[#d4af37] text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-white'}`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-white/5 gap-8">
                              <div className="flex space-x-4 w-full sm:w-auto">
                                <button 
                                  onClick={() => updateRequest(req.id, { paymentStatus: 'Paid' })} 
                                  className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all ${req.paymentStatus === 'Paid' ? 'bg-green-500 text-white shadow-lg' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                >
                                  <Check className="w-5 h-5" />
                                  <span>Mark Paid</span>
                                </button>
                                <button 
                                  onClick={() => updateRequest(req.id, { paymentStatus: 'Unpaid' })} 
                                  className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all ${req.paymentStatus === 'Unpaid' ? 'bg-red-500 text-white shadow-lg' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                                >
                                  <X className="w-5 h-5" />
                                  <span>Mark Unpaid</span>
                                </button>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Service Fee</p>
                                <p className="text-4xl font-black gold-text">₹{req.estimatedAmount}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeAdminTab === 'analytics' ? (
          <div className="space-y-12 page-enter">
            <header className="scroll-reveal reveal-down bg-neutral-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 gold-gradient opacity-10 blur-[100px] pointer-events-none"></div>
               <div className="relative z-10 space-y-2">
                 <div className="flex items-center space-x-3 text-[#d4af37]">
                   <TrendingUp className="w-6 h-6" />
                   <span className="text-xs font-black uppercase tracking-[0.3em]">Business Intelligence</span>
                 </div>
                 <h1 className="text-4xl font-serif gold-text">HW Performance Analytics</h1>
                 <p className="text-gray-500 font-medium">Detailed breakdown of requests and growth metrics.</p>
               </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <ClipboardList />, label: "Total Orders", value: stats.totalRequests, sub: "Requests till date" },
                { icon: <Layers />, label: "Total Pages", value: stats.totalPages, sub: "Original content written" },
                { icon: <IndianRupee />, label: "Total Revenue", value: `₹${stats.totalRevenue}`, sub: "Business generated" },
                { icon: <Users />, label: "Active Users", value: stats.activeUsers, sub: "Loyal student base" },
              ].map((card, i) => (
                <div key={i} className="bg-neutral-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-[#d4af37]/40 transition-all shadow-xl space-y-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#d4af37]">
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{card.label}</p>
                    <p className="text-3xl font-black gold-text">{card.value}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-neutral-900/50 border border-white/5 p-10 rounded-[3rem] space-y-8 shadow-2xl">
                <h3 className="text-xl font-bold uppercase tracking-tight flex items-center space-x-3">
                  <BarChart3 className="text-[#d4af37] w-5 h-5" />
                  <span>Monthly Request Trend</span>
                </h3>
                <div className="h-64 flex items-end justify-between px-4 gap-2">
                  {/* FIX: Explicitly cast stats.monthlyData to any to resolve "unknown" type errors when accessing properties */}
                  {Object.entries(stats.monthlyData as any).slice(-6).map(([month, data]: [string, any], i) => {
                    const maxRequests = Math.max(...(Object.values(stats.monthlyData) as any[]).map(d => d.requests), 1);
                    const height = (data.requests / maxRequests) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div 
                          className="w-full max-w-[40px] gold-gradient rounded-t-xl transition-all duration-1000 relative"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {data.requests}
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase mt-4">{month}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-white/5 p-10 rounded-[3rem] space-y-8 shadow-2xl">
                <h3 className="text-xl font-bold uppercase tracking-tight flex items-center space-x-3">
                  <PieChart className="text-[#d4af37] w-5 h-5" />
                  <span>Subject Distribution</span>
                </h3>
                <div className="space-y-6">
                  {stats.sortedSubjects.slice(0, 5).map(([subject, count], i) => {
                    const percentage = stats.totalRequests ? (count / stats.totalRequests) * 100 : 0;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-white">{subject}</span>
                          <span className="text-[#d4af37]">{count} orders</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full gold-gradient transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 page-enter">
            <header className="scroll-reveal reveal-down bg-neutral-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 gold-gradient opacity-10 blur-[100px] pointer-events-none"></div>
              <div className="relative z-10 space-y-2">
                <div className="flex items-center space-x-3 text-[#d4af37]">
                  <Gift className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-[0.3em]">Campaign Management</span>
                </div>
                <h1 className="text-4xl font-serif gold-text">Seasonal Offers Control</h1>
                <p className="text-gray-500 font-medium">Create and manage limited-time discount campaigns.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {SEASONS.map((season) => {
                const isActive = activeSeasonId === season.id;
                let bgClass = "bg-neutral-900";
                if (season.theme === 'newyear') bgClass = "bg-gradient-to-br from-blue-900/40 via-neutral-900 to-black";
                if (season.theme === 'summer') bgClass = "bg-gradient-to-br from-orange-900/40 via-neutral-900 to-black";
                if (season.theme === 'diwali') bgClass = "bg-gradient-to-br from-red-900/40 via-neutral-900 to-black";

                return (
                  <div key={season.id} className={`${bgClass} border ${isActive ? 'border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.2)]' : 'border-white/5'} rounded-[3rem] p-10 flex flex-col justify-between space-y-8 transition-all relative overflow-hidden group`}>
                    {!isActive && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 pointer-events-none"></div>}
                    
                    <div className="space-y-4 relative z-20">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${isActive ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                          {isActive ? 'Active Now' : 'Inactive'}
                        </span>
                        <Gift className={`w-6 h-6 ${isActive ? 'text-[#d4af37]' : 'text-gray-700'}`} />
                      </div>
                      <h3 className="text-2xl font-black group-hover:gold-text transition-all leading-tight">{season.title}</h3>
                      <div className="space-y-1">
                        <p className="text-5xl font-black gold-text">{season.discount}% OFF</p>
                        <p className="text-xs text-gray-500 font-medium">Applied to ALL subjects</p>
                      </div>
                    </div>

                    <div className="space-y-4 relative z-20 pt-4 border-t border-white/10">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500">English Price:</span>
                        <span className="text-white">₹{(2 * (1 - season.discount / 100)).toFixed(2)}/pg</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500">Hindi Price:</span>
                        <span className="text-white">₹{(3 * (1 - season.discount / 100)).toFixed(2)}/pg</span>
                      </div>
                    </div>

                    <div className="flex gap-4 relative z-20 pt-2">
                      <button 
                        onClick={() => setActiveSeason(season.id)}
                        disabled={isActive}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[#d4af37] text-black hover:scale-105 shadow-xl'}`}
                      >
                        {isActive ? 'Activated' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => setActiveSeason(null)}
                        disabled={!isActive}
                        className={`py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${!isActive ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-neutral-900 border border-white/5 rounded-[3rem] shadow-2xl mt-12">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold uppercase tracking-tight">Campaign Participants</h3>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stats.seasonAnalytics.usersUsingOffers.length} Users found</span>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.seasonAnalytics.usersUsingOffers.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-gray-600 font-bold uppercase tracking-widest text-sm italic">No campaign participation yet</div>
                  ) : (
                    stats.seasonAnalytics.usersUsingOffers.map((user, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/10 rounded-[2rem] p-6 space-y-4 hover:border-[#d4af37]/40 transition-all group">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center text-black font-black text-lg flex-shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white truncate text-base">{user.name}</p>
                            <div className="flex items-center space-x-2 text-gray-500 font-mono text-[10px] tracking-widest">
                              <Smartphone size={10} />
                              <span>{user.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Season Used</span>
                            <span className="text-[#d4af37] text-[9px] font-black uppercase tracking-widest bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/20">
                              {SEASONS.find(s => s.id === user.season)?.title || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-12 border-t border-white/5">
              <h2 className="text-3xl font-serif gold-text flex items-center space-x-4">
                <BarChart3 className="text-[#d4af37]" />
                <span>Season Performance Intelligence</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { label: "Seasonal Requests", value: stats.seasonAnalytics.totalRequests, icon: <ClipboardList className="text-blue-400" /> },
                  { label: "Total Discount Given", value: `₹${stats.seasonAnalytics.totalDiscount}`, icon: <Gift className="text-red-400" /> },
                  { label: "Campaign Pages", value: stats.seasonAnalytics.totalPages, icon: <Layers className="text-green-400" /> },
                  { label: "Banner Clicks", value: stats.seasonAnalytics.bannerClicks, icon: <Zap className="text-yellow-400" /> },
                  { label: "Conversion Rate", value: `${stats.seasonAnalytics.conversionRate}%`, icon: <TrendingUp className="text-purple-400" /> },
                  { label: "Trending Subject", value: stats.mostRequestedSubject, icon: <BookOpen className="text-pink-400" /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-neutral-900 border border-white/5 p-8 rounded-[2.5rem] flex items-center space-x-6 hover:border-[#d4af37]/20 transition-all">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
