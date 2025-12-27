
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Transaction } from '../types';
import { IndianRupee, CreditCard, Search, Book, Calendar, Hash, Sparkles, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const { requests, currentUser, transactions } = useStore();
  const [activeTab, setActiveTab] = useState<'homework' | 'payments'>('homework');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const userRequests = requests.filter(r => r.userId === currentUser?.id);
  const userTransactions = transactions.filter(t => t.userId === currentUser?.id);

  const handleTabSwitch = (tab: 'homework' | 'payments') => {
    setActiveTab(tab);
  };

  const toggleGroup = (hwId: string) => {
    setExpandedGroups(prev => ({ ...prev, [hwId]: !prev[hwId] }));
  };

  // Logic for grouping and sorting Payment History
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    // 1. Group transactions by homeworkId
    userTransactions.forEach(tx => {
      if (!groups[tx.homeworkId]) groups[tx.homeworkId] = [];
      groups[tx.homeworkId].push(tx);
    });

    // 2. Sort transactions within each group by latest first
    Object.keys(groups).forEach(hwId => {
      groups[hwId].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    // 3. Create sortable objects
    const sortedGroups = Object.keys(groups).map(hwId => {
      const hw = userRequests.find(r => r.id === hwId);
      const txs = groups[hwId];
      return {
        homeworkId: hwId,
        subject: hw?.subject || 'Deleted Subject',
        transactions: txs,
        latestTimestamp: new Date(txs[0].createdAt).getTime()
      };
    });

    // 4. Sort groups by the most recent transaction (latest activity at the top)
    return sortedGroups.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  }, [userTransactions, userRequests]);

  return (
    <div className="min-h-screen pt-44 sm:pt-52 pb-20 px-4 sm:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
        
        {/* Header Section */}
        <header className="scroll-reveal reveal-down flex flex-col items-center text-center space-y-10 sm:space-y-12 transition-all duration-500">
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em]">
              <Sparkles size={12} className="animate-pulse" />
              <span>Personal Analytics Hub</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif gold-text leading-tight tracking-tight">Your Dashboard</h1>
            <p className="text-gray-500 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed font-medium px-4">
              Track progress, manage payments, and view your academic success reports in one centralized professional interface.
            </p>
          </div>
          
          <div className="flex bg-neutral-900 border border-white/10 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-8 divide-x divide-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="px-6 sm:px-12 text-center relative z-10 flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-2 sm:mb-3">Active Tasks</p>
              <p className="text-3xl sm:text-5xl font-black tracking-tighter text-white">
                {userRequests.filter(r => r.status !== 'Completed').length}
              </p>
            </div>
            <div className="px-6 sm:px-12 text-center relative z-10 flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-2 sm:mb-3">Total Done</p>
              <p className="text-3xl sm:text-5xl font-black tracking-tighter text-green-500">
                {userRequests.filter(r => r.status === 'Completed').length}
              </p>
            </div>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center scroll-reveal reveal-up stagger-1 px-2">
          <div className="flex w-full max-w-lg p-2 bg-neutral-900 border border-white/10 rounded-full shadow-2xl overflow-hidden">
            <button 
              onClick={() => handleTabSwitch('homework')} 
              className={`flex-1 py-4 px-4 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center justify-center space-x-3 ${activeTab === 'homework' ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-gray-500 hover:text-white'}`}
            >
              <Book className="w-4 h-4" />
              <span>Homework</span>
            </button>
            <button 
              onClick={() => handleTabSwitch('payments')} 
              className={`flex-1 py-4 px-4 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center justify-center space-x-3 ${activeTab === 'payments' ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-gray-500 hover:text-white'}`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payments</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HOMEWORK CONTENT */}
        {activeTab === 'homework' && (
          <div className="space-y-8 animate-fade-in">
            {userRequests.length === 0 ? (
              <div className="py-24 sm:py-32 text-center bg-neutral-900/40 rounded-[3.5rem] border border-dashed border-white/10 space-y-8 px-6 max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-700">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-xl sm:text-2xl font-bold uppercase tracking-tight">No homework records found</p>
                  <p className="text-gray-600 text-sm">Start your academic journey with us today.</p>
                </div>
                <button onClick={() => navigate('/request-homework')} className="gold-gradient px-12 py-5 rounded-full text-black font-black uppercase text-xs tracking-[0.2em] mx-auto block hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/10">
                  Request First Task
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
                {userRequests.map((req) => {
                  const tx = userTransactions.find(t => t.homeworkId === req.id);
                  const isOnline = req.paymentMethod === 'Online';
                  
                  let paymentStatusLabel = 'PENDING';
                  let paymentStatusColor = 'text-gray-400';
                  
                  let verificationStatusLabel = 'PENDING';
                  let verificationStatusColor = 'text-gray-400';

                  if (isOnline) {
                    if (tx) {
                      if (tx.status === 'Pending' || tx.status === 'Approved') {
                        paymentStatusLabel = 'PAID';
                        paymentStatusColor = 'text-green-500';
                      }
                      if (tx.status === 'Approved') {
                        verificationStatusLabel = 'APPROVED';
                        verificationStatusColor = 'text-green-500';
                      } else if (tx.status === 'Rejected') {
                        verificationStatusLabel = 'REJECTED';
                        verificationStatusColor = 'text-red-500';
                        paymentStatusLabel = 'PENDING';
                        paymentStatusColor = 'text-gray-400';
                      }
                    }
                  }

                  const showPayButton = isOnline && (paymentStatusLabel === 'PENDING');
                  
                  return (
                    <div 
                      key={req.id} 
                      className="scroll-reveal reveal-up bg-neutral-900 border border-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-12 hover:border-[#d4af37]/30 transition-all group relative overflow-hidden shadow-2xl"
                    >
                      <div className="absolute top-0 right-0 w-1/3 h-full gold-gradient opacity-0 group-hover:opacity-5 blur-[100px] transition-opacity duration-700 pointer-events-none"></div>
                      
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-14">
                        <div className="flex items-center space-x-8 sm:space-x-10">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 gold-gradient rounded-[2.2rem] flex items-center justify-center text-black shadow-2xl group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                            <BookIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                          </div>
                          <div>
                            <h3 className="text-2xl sm:text-4xl font-black group-hover:gold-text transition-colors mb-2">{req.subject}</h3>
                            <p className="text-gray-600 font-mono tracking-[0.25em] text-[10px] sm:text-xs uppercase font-black">ID: #{req.id.toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-10 flex-1 w-full pt-8 lg:pt-0 border-t lg:border-t-0 border-white/5">
                          <div className="space-y-1">
                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Pages</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">{req.pages}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Status</p>
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
                                req.status === 'Completed' ? 'bg-green-500' : 
                                req.status === 'Writing' ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}></span>
                              <span className={`text-lg sm:text-xl font-black ${
                                req.status === 'Completed' ? 'text-green-400' : 
                                req.status === 'Writing' ? 'text-blue-400' :
                                'text-yellow-400'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Style</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">{req.handwritingStyle}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Service Fee</p>
                            <p className="text-2xl sm:text-3xl font-black text-[#d4af37] tracking-tighter">₹{req.estimatedAmount}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-end justify-center gap-5 w-full lg:w-auto pt-8 lg:pt-0 border-t lg:border-t-0 border-white/5">
                          {isOnline ? (
                            <div className="w-full flex flex-col items-center lg:items-end space-y-4">
                              <div className="space-y-2 text-center lg:text-right">
                                <div className="flex items-center justify-center lg:justify-end space-x-2">
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment:</span>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${paymentStatusColor}`}>
                                    {paymentStatusLabel}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center lg:justify-end space-x-2">
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Verification:</span>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${verificationStatusColor}`}>
                                    {verificationStatusLabel}
                                  </span>
                                </div>
                              </div>
                              {showPayButton && (
                                <button 
                                  onClick={() => navigate(`/checkout/${req.id}`)}
                                  className="w-full lg:w-auto px-10 py-4 gold-gradient text-black font-black rounded-xl shadow-xl shadow-yellow-500/10 text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all"
                                >
                                  {tx?.status === 'Rejected' ? 'PAY ONLINE AGAIN' : 'Pay Online'}
                                </button>
                              )}
                              {tx?.status === 'Rejected' && (
                                <div className="flex items-start space-x-3 bg-red-500/5 border border-red-500/10 p-4 rounded-2xl max-w-[240px]">
                                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                                    <span className="text-red-500 font-black uppercase block mb-1">Attention</span>
                                    Note: You can chat with PIYUSH TEAM to solve this problem.
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full flex flex-col items-center lg:items-end space-y-3">
                              <div className="flex items-center justify-center lg:justify-end space-x-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment:</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${req.paymentStatus === 'Paid' ? 'text-green-500' : 'text-gray-400'}`}>
                                  {req.paymentStatus === 'Paid' ? 'PAID' : 'PENDING'}
                                </span>
                              </div>
                              <div className="px-5 py-1.5 rounded-full border border-white/5 bg-white/5 text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                 Method: COD
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAYMENTS CONTENT - UPDATED ORDERING & STRUCTURE */}
        {activeTab === 'payments' && (
          <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center text-[#d4af37] shadow-xl border border-[#d4af37]/10">
                <IndianRupee className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Verified Records</h2>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Transaction Ledger</p>
              </div>
            </div>
            
            {groupedTransactions.length === 0 ? (
              <div className="bg-neutral-900/40 border border-white/5 p-20 sm:p-32 rounded-[3.5rem] text-center shadow-xl">
                <p className="text-gray-600 font-bold uppercase tracking-[0.4em] text-xs italic">Financial history is clear</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10">
                {groupedTransactions.map((group) => (
                  <div 
                    key={group.homeworkId} 
                    className="bg-neutral-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl group transition-all"
                  >
                    {/* Header: Subject + HW ID */}
                    <div className="p-8 sm:p-10 border-b border-white/5 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          Subject: <span className="gold-text">{group.subject} Homework</span>
                        </h3>
                        <div className="flex items-center justify-center sm:justify-start space-x-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                          <Hash size={12} className="text-[#d4af37]" />
                          <span>Homework ID: {group.homeworkId.toUpperCase()}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => toggleGroup(group.homeworkId)}
                        className="flex items-center space-x-2 text-[10px] font-black text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-6 py-3 rounded-full uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all"
                      >
                        <span>History ({group.transactions.length})</span>
                        {expandedGroups[group.homeworkId] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Transaction List */}
                    <div className="divide-y divide-white/5">
                      {group.transactions.map((tx, idx) => {
                        const isLatest = idx === 0;
                        const isExpanded = expandedGroups[group.homeworkId] || isLatest;

                        if (!isExpanded) return null;

                        return (
                          <div 
                            key={tx.id} 
                            className={`p-8 sm:p-10 transition-all ${isLatest ? 'bg-[#d4af37]/5 relative' : 'bg-transparent opacity-60'}`}
                          >
                            {isLatest && (
                              <div className="absolute top-0 left-0 w-1 h-full gold-gradient"></div>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                              {/* Date & Time */}
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center space-x-2">
                                  <Calendar size={12} />
                                  <span>Date & Time</span>
                                </p>
                                <div className="text-xs font-bold text-white leading-relaxed">
                                  {new Date(tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                  <span className="block text-[10px] text-gray-500 font-mono">
                                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>

                              {/* Transaction ID */}
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center space-x-2">
                                  <Hash size={12} />
                                  <span>Transaction ID</span>
                                </p>
                                <p className="text-[11px] font-mono text-white bg-black/60 px-4 py-2 rounded-xl border border-white/5 truncate" title={tx.transactionId}>
                                  {tx.transactionId || 'NO REFERENCE'}
                                </p>
                              </div>

                              {/* Amount & Method */}
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center space-x-2">
                                  <IndianRupee size={12} />
                                  <span>Settlement</span>
                                </p>
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl font-black text-white">₹{tx.amount}</span>
                                  <span className="text-[9px] bg-white/5 border border-white/10 px-3 py-1 rounded text-gray-500 font-black uppercase tracking-widest">
                                    Online
                                  </span>
                                </div>
                              </div>

                              {/* Status */}
                              <div className="space-y-2 flex flex-col justify-center items-center sm:items-end">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Verification Status</p>
                                <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-xl ${
                                  tx.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                  tx.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse'
                                }`}>
                                  {tx.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #d4af37;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

const BookIcon = ({className}: {className: string}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

export default AnalyticsPage;
