
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Pen, Shield, LayoutDashboard, Gift, Sparkles } from 'lucide-react';
import { useStore, SEASONS } from '../store';

const UserHome: React.FC = () => {
  const { currentUser, activeSeasonId, trackBannerClick } = useStore();
  const isAdmin = currentUser?.isAdmin;
  const navigate = useNavigate();

  const activeSeason = SEASONS.find(s => s.id === activeSeasonId);

  const handleBannerAction = () => {
    trackBannerClick();
    navigate('/request-homework');
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        
        {/* SEASONAL PROMOTIONAL BANNER - COMPACT VERSION */}
        {activeSeason && (
          <div className="scroll-reveal reveal-down">
            <div className={`relative overflow-hidden rounded-[2rem] border border-[#d4af37]/30 p-5 sm:p-8 shadow-2xl group transition-all duration-700 ${
              activeSeason.theme === 'newyear' ? 'bg-gradient-to-r from-blue-900/60 via-neutral-900 to-black' :
              activeSeason.theme === 'summer' ? 'bg-gradient-to-r from-yellow-900/60 via-neutral-900 to-black' :
              'bg-gradient-to-r from-red-900/60 via-neutral-900 to-black'
            }`}>
              {/* Animated background glows */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37] opacity-10 blur-[80px] animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 blur-[60px]"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                <div className="space-y-2 sm:space-y-3 text-center md:text-left flex-1">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[8px] sm:text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">
                    <Sparkles size={10} className="animate-pulse" />
                    <span>Special Seasonal Offer</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-serif text-white leading-tight">
                    {activeSeason.title}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start space-x-3">
                    <span className="text-4xl sm:text-6xl font-black gold-text leading-none">{activeSeason.discount}%</span>
                    <div className="flex flex-col">
                      <span className="text-lg sm:text-xl font-black text-white leading-none tracking-tighter uppercase italic">OFF</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">ON ALL SUBJECTS</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-center gap-3">
                  <button 
                    onClick={handleBannerAction}
                    className="w-full md:w-auto group relative inline-flex items-center justify-center space-x-3 bg-white text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/20"
                  >
                    <span>Request Homework</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Limited Time Only</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main CTA */}
        <section className="scroll-reveal reveal-up bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full gold-gradient opacity-10 blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-2xl relative z-10 space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-5xl font-serif leading-tight scroll-reveal reveal-left stagger-1">
              Welcome, <span className="gold-text">{currentUser?.fullName.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg scroll-reveal reveal-left stagger-2">
              {isAdmin 
                ? "Manage your homework business, track payments, and control delivery status from your dedicated administrative center."
                : "Your personal academic hub. Request new handwritten tasks or track your ongoing assignments with ease."
              }
            </p>
            
            <div className="scroll-reveal reveal-left stagger-3 flex flex-wrap gap-4">
              {isAdmin ? (
                <Link 
                  to="/admin" 
                  className="inline-flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-[#d4af37] group shadow-xl shadow-yellow-500/10"
                >
                  <span>Manage Students</span>
                  <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                </Link>
              ) : (
                <Link 
                  to="/request-homework" 
                  className="inline-flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-[#d4af37] group shadow-xl shadow-yellow-500/10"
                >
                  <span>Request for Homework</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {[
            { icon: <BookOpen />, title: "How It Works", content: (
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span><span>Fill the homework request form.</span></li>
                <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span><span>Select subject and page count.</span></li>
                <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span><span>Choose delivery timeline.</span></li>
                <li className="flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span><span>Track progress in real-time.</span></li>
              </ul>
            )},
            { icon: <Pen />, title: "Pricing Rules", content: (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[#d4af37] font-bold text-base">₹2 / page</p>
                    <p className="text-[10px] text-gray-500">English Homework</p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[#d4af37] font-bold text-base">₹2 / page</p>
                    <p className="text-[10px] text-gray-500">Hindi / Marathi</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">* Other subjects start from ₹2 per page based on complexity.</p>
              </div>
            )},
            { icon: <Clock />, title: "Delivery Timeline", content: (
              <p className="text-gray-400 text-sm">Choose between 1-day express delivery for urgent tasks or up to 5 days for standard requests.</p>
            )},
            { icon: <Shield />, title: "Trust & Safety", content: (
              <p className="text-gray-400 text-sm">Your academic records and personal details are handled with extreme confidentiality.</p>
            )}
          ].map((item, i) => (
            <div key={i} className={`scroll-reveal reveal-up stagger-${(i % 2) + 1} space-y-3 p-8 bg-neutral-900/50 rounded-[2rem] border border-white/5 hover:border-[#d4af37]/30 transition-all group`}>
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform flex-shrink-0">
                {/* DO fix: Cast to any to avoid property 'size' does not exist error */}
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
              </div>
              <h3 className="text-xl font-bold group-hover:gold-text transition-colors">{item.title}</h3>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
