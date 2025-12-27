import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useStore, SEASONS } from '../store';
// Added Info to the imports from lucide-react to fix 'Cannot find name Info' error on line 349
import { ChevronRight, PenTool, Sparkles, X, AlertCircle, Clock, CheckCircle2, Info } from 'lucide-react';
import { HomeworkRequest, PaymentMethod } from '../types';

const RequestHomework: React.FC = () => {
  const { currentUser, addRequest, activeSeasonId, requests } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: 'English',
    calculationType: 'pages' as 'pages' | 'lessons',
    pages: 2,
    lessons: 1,
    selectedClass: '',
    selectedSection: '',
    language: 'English',
    handwritingStyle: 'Normal',
    deliveryTime: 5, 
    specialInstructions: '',
    paymentMethod: 'COD' as PaymentMethod
  });

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [currentRate, setCurrentRate] = useState(0);
  const [extraChargePercent, setExtraChargePercent] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const activeSeason = SEASONS.find(s => s.id === activeSeasonId);

  // Background Scroll Locking Logic
  useEffect(() => {
    if (showSuccess) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showSuccess]);

  useEffect(() => {
    // 1. Base Rate Calculation
    let rate = 0;
    let units = 0;
    
    if (formData.calculationType === 'pages') {
      rate = 2; // Flat rate per prompt for Notebook style (English, Hindi, Marathi, etc. all ₹2)
      units = formData.pages;
    } else {
      // Lessons pricing
      if (['Maths', 'Science'].includes(formData.subject)) {
        rate = 6;
      } else {
        rate = 5; // English, Hindi, Marathi
      }
      units = formData.lessons;
    }
    
    setCurrentRate(rate);
    const baseTotal = rate * (units || 0);
    setOriginalPrice(baseTotal);

    // 2. Extra Charges Logic (Only when no season is active)
    let extraPct = 0;
    if (!activeSeason) {
      const days = formData.deliveryTime;
      if (days === 1) extraPct = 0.20;
      else if (days === 2) extraPct = 0.15;
      else if (days === 3) extraPct = 0.10;
      else if (days === 4) extraPct = 0.05;
    }
    setExtraChargePercent(extraPct);

    // 3. Final Calculation
    if (activeSeason) {
      setEstimatedPrice(baseTotal * (1 - activeSeason.discount / 100));
    } else {
      setEstimatedPrice(baseTotal * (1 + extraPct));
    }
  }, [formData.subject, formData.pages, formData.lessons, formData.calculationType, formData.deliveryTime, activeSeason]);

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'pages' | 'lessons') => {
    const val = e.target.value;
    if (val === '') {
      setFormData({ ...formData, [field]: 0 });
      return;
    }
    const num = parseInt(val.replace(/\D/g, ''));
    if (!isNaN(num)) {
      setFormData({ ...formData, [field]: Math.max(0, num) });
    }
  };

  const isFormValid = formData.selectedClass !== '' && formData.selectedSection !== '' && (formData.calculationType === 'pages' ? formData.pages > 0 : formData.lessons > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isFormValid) return;

    const newId = Math.random().toString(36).substr(2, 9);
    const unitsDisplay = formData.calculationType === 'pages' ? `${formData.pages} Pages` : `${formData.lessons} Lessons`;
    
    const newRequest: HomeworkRequest = {
      id: newId,
      userId: currentUser.id,
      subject: formData.subject,
      calculationType: formData.calculationType,
      pages: formData.calculationType === 'pages' ? formData.pages : 0,
      lessons: formData.calculationType === 'lessons' ? formData.lessons : 0,
      grade: `Class ${formData.selectedClass} - Section ${formData.selectedSection} (${unitsDisplay})`,
      language: formData.language,
      handwritingStyle: formData.handwritingStyle,
      deliveryDays: formData.deliveryTime,
      specialInstructions: formData.specialInstructions + (formData.calculationType === 'lessons' ? ` [Order Type: ${formData.lessons} Lessons]` : ''),
      estimatedAmount: Number(estimatedPrice.toFixed(2)),
      originalAmount: Number(originalPrice.toFixed(2)),
      status: 'Pending',
      paymentStatus: 'Unpaid',
      paymentMethod: formData.paymentMethod,
      createdAt: new Date().toISOString(),
      seasonId: activeSeason?.id
    };

    addRequest(newRequest);
    setLastCreatedId(newId);
    
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setShowSuccess(true);
  };

  const handleSuccessAction = () => {
    setShowSuccess(false);
    navigate('/analytics');
  };

  const successPopup = showSuccess ? (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 999999, 
        display: 'flex', 
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
        pointerEvents: 'auto',
        overflowY: 'auto'
      }}
    >
      <div 
        className="animate-fade-in"
        style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.95)', 
          backdropFilter: 'blur(20px)',
          zIndex: -1
        }}
      ></div>
      
      <div 
        className="animate-zoom-in"
        style={{ 
          position: 'relative',
          width: '90%',
          maxWidth: '448px',
          backgroundColor: '#000',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '2.5rem',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 0 120px rgba(212,175,55,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginBottom: '50px'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '64px', height: '4px', background: 'linear-gradient(135deg, #d4af37 0%, #f9e29c 100%)', borderRadius: '9999px', opacity: 0.5 }}></div>

        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          {/* Fix: Changed justifyRules to justifyContent */}
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid rgba(212,175,55,0.2)' }}>
            <span style={{ fontSize: '2.25rem', display: 'block' }} className="animate-bounce">🎉</span>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Congratulations!
          </h2>
          <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: '1rem', lineHeight: 1.6, padding: '0 0.5rem' }}>
            Your homework request has been successfully sent to <br />
            <span className="gold-text" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginTop: '0.5rem', fontSize: '1.25rem' }}>PIYUSH HOMEWORK CENTER</span>
          </p>
        </div>

        <div style={{ width: '100%', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleSuccessAction}
            className="gold-gradient"
            style={{ 
              width: '100%', 
              height: '56px', 
              color: '#000', 
              fontWeight: 900, 
              fontSize: '1rem', 
              borderRadius: '1rem', 
              boxShadow: '0 20px 25px -5px rgba(234,179,8,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em',
              border: 'none',
              cursor: 'pointer',
              padding: '0 1rem'
            }}
          >
            Check Your Homework Activity
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen pt-36 sm:pt-48 pb-20 px-4 sm:px-6 overflow-hidden relative">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="text-center scroll-reveal reveal-down">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight mb-4">
            <span className="gold-text">Request Homework</span> Form
          </h1>
          <div className="h-1 w-24 gold-gradient mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
          
          {/* LEFT SIDE */}
          <div className="lg:w-5/12 w-full flex flex-col justify-center space-y-8 scroll-reveal reveal-left">
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop" 
                alt="Professional Writing" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-black/40 backdrop-blur-md p-6 rounded-full border border-white/10 animate-float">
                  <PenTool className="w-10 h-10 gold-text" />
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block space-y-4">
              <h3 className="text-2xl font-bold gold-text">Quality Assurance</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every assignment is completed with premium stationery and verified handwriting styles 
                that match typical student output. Your satisfaction is our priority.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:w-7/12 w-full scroll-reveal reveal-right">
            <div className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 gold-gradient opacity-5 blur-[100px] pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Subject</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-[#d4af37] transition-all text-white font-bold appearance-none cursor-pointer"
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Marathi</option>
                      <option>Maths</option>
                      <option>Science</option>
                    </select>
                  </div>

                  {/* PAGES VS LESSONS UNIT INPUT */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Pages Radio Group */}
                      <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${formData.calculationType === 'pages' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-lg shadow-yellow-500/5' : 'border-white/5 opacity-40'}`} onClick={() => setFormData({...formData, calculationType: 'pages'})}>
                        <div className="flex items-center space-x-3 mb-3">
                          <input 
                            type="radio" 
                            name="unitType" 
                            checked={formData.calculationType === 'pages'} 
                            onChange={() => setFormData({...formData, calculationType: 'pages'})}
                            className="w-4 h-4 accent-[#d4af37]"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">No. of Pages</span>
                        </div>
                        <input 
                          type="text"
                          inputMode="numeric"
                          disabled={formData.calculationType !== 'pages'}
                          value={formData.pages === 0 ? '' : formData.pages}
                          onChange={(e) => handleUnitChange(e, 'pages')}
                          placeholder="e.g. 10"
                          className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-[#d4af37] transition-all text-white font-bold text-center disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Lessons Radio Group */}
                      <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${formData.calculationType === 'lessons' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-lg shadow-yellow-500/5' : 'border-white/5 opacity-40'}`} onClick={() => setFormData({...formData, calculationType: 'lessons'})}>
                        <div className="flex items-center space-x-3 mb-3">
                          <input 
                            type="radio" 
                            name="unitType" 
                            checked={formData.calculationType === 'lessons'} 
                            onChange={() => setFormData({...formData, calculationType: 'lessons'})}
                            className="w-4 h-4 accent-[#d4af37]"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">No. of Lessons</span>
                        </div>
                        <input 
                          type="text"
                          inputMode="numeric"
                          disabled={formData.calculationType !== 'lessons'}
                          value={formData.lessons === 0 ? '' : formData.lessons}
                          onChange={(e) => handleUnitChange(e, 'lessons')}
                          placeholder="e.g. 3"
                          className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-[#d4af37] transition-all text-white font-bold text-center disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* PRICING INSTRUCTION BOX */}
                    <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-white font-black uppercase tracking-[0.2em] text-[10px]">
                         <Info size={14} className="text-[#d4af37]" />
                         <span>Choose ONE option above: Pages OR Lessons</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                         <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest border-b border-[#d4af37]/10 pb-1">Notebook (per page)</p>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                               <span>English / Hindi / Marathi</span>
                               <span className="text-white">₹2</span>
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest border-b border-[#d4af37]/10 pb-1">Lesson-based</p>
                            <div className="space-y-1">
                               <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                                  <span>Eng / Hin / Mar</span>
                                  <span className="text-white">₹5</span>
                               </div>
                               <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                                  <span>Maths / Science</span>
                                  <span className="text-white">₹6</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* LIVE PRICE DISTRIBUTION DISPLAY */}
                    <div className="flex items-center justify-center py-2 px-6 bg-black/40 rounded-full border border-white/5 w-fit mx-auto animate-fade-in">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] gold-text">
                         {formData.calculationType === 'pages' 
                           ? `${formData.pages} pages × ₹${currentRate} = ₹${originalPrice}` 
                           : `${formData.lessons} lessons × ₹${currentRate} = ₹${originalPrice}`}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Select Class</label>
                    <select 
                      value={formData.selectedClass}
                      onChange={(e) => setFormData({...formData, selectedClass: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-[#d4af37] transition-all text-white font-bold appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select Class</option>
                      {[5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                        <option key={c} value={c.toString()}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Select Section</label>
                    <select 
                      value={formData.selectedSection}
                      onChange={(e) => setFormData({...formData, selectedSection: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-[#d4af37] transition-all text-white font-bold appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Delivery Time (Days)</label>
                    <select 
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({...formData, deliveryTime: parseInt(e.target.value)})}
                      className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-[#d4af37] transition-all text-white font-bold appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
                        <option key={day} value={day}>{day} Day{day > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    
                    {/* IMPORTANT NOTICE UI */}
                    <div className="flex items-start space-x-2 bg-red-500/5 border border-red-500/20 p-4 rounded-xl mt-3 animate-fade-in">
                       <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">IMPORTANT NOTICE</p>
                          <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                             Faster delivery (1–4 days) may include extra charges. <br />
                             <span className="text-gray-200">No extra charge if any season is active.</span> <br />
                             Orders with 5+ days delivery have no extra charges.
                          </p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Special Instructions</label>
                  <textarea 
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                    placeholder="Any specific pen color or notes..."
                    rows={4}
                    className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-[#d4af37] transition-all text-white font-bold resize-none"
                  ></textarea>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
                      className={`h-14 rounded-2xl border transition-all font-bold flex items-center justify-center ${formData.paymentMethod === 'COD' ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-black text-gray-500 hover:border-white/20'}`}
                    >
                      Cash On Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'Online'})}
                      className={`h-14 rounded-2xl border transition-all font-bold flex items-center justify-center space-x-3 ${formData.paymentMethod === 'Online' ? 'border-[#6739B7] bg-[#6739B7]/10 text-[#6739B7]' : 'border-white/10 bg-black text-gray-500 hover:border-white/20'}`}
                    >
                      <img 
                        src="https://img.icons8.com/color/48/phone-pe.png" 
                        alt="PhonePe" 
                        className="h-6 w-6 object-contain" 
                      />
                      <span className="text-sm">PhonePe</span>
                    </button>
                  </div>
                </div>

                {/* Pricing & Submit */}
                <div className="pt-8 border-t border-white/10 space-y-6">
                  {activeSeason ? (
                    <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 p-5 rounded-2xl flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-[#d4af37]">
                        <Sparkles size={14} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{activeSeason.title} Applied</span>
                      </div>
                      <p className="text-white font-black text-sm">{activeSeason.discount}% Discount Unlocked! (No delivery charges)</p>
                    </div>
                  ) : extraChargePercent > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center space-x-3 animate-fade-in">
                       <Clock size={16} className="text-[#d4af37]" />
                       <p className="text-[11px] font-black text-[#d4af37] uppercase tracking-widest">
                         {Math.round(extraChargePercent * 100)}% extra charge applied for {formData.deliveryTime}-day homework
                       </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Fees</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl font-black gold-text">₹{estimatedPrice.toFixed(2)}</span>
                        {(activeSeason || extraChargePercent > 0) && (
                          <div className="flex flex-col">
                            <span className="text-lg text-gray-600 line-through font-bold">₹{originalPrice.toFixed(2)}</span>
                            {activeSeason ? (
                              <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest w-fit mt-1">{activeSeason.discount}% OFF</span>
                            ) : (
                              <span className="text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded font-black uppercase tracking-widest w-fit mt-1">+{Math.round(extraChargePercent * 100)}% Fast Fee</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={!isFormValid}
                    className="group w-full h-14 sm:h-16 gold-gradient text-black font-black text-lg sm:text-xl rounded-2xl shadow-xl shadow-yellow-500/20 flex items-center justify-center space-x-3 uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:scale-100"
                  >
                    <span>Complete My Homework</span>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform ml-1" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {createPortal(successPopup, document.body)}

      <style>{`
        @keyframes zoom-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-zoom-in { 
          animation: zoom-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
        }
        .animate-fade-in { 
          animation: fade-in 0.4s ease-out forwards; 
        }
      `}</style>
    </div>
  );
};

export default RequestHomework;