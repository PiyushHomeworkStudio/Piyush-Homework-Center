
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useStore, SEASONS } from '../store';
import { ChevronRight, PenTool, Sparkles, X, AlertCircle, Clock, CheckCircle2, Info, Gift } from 'lucide-react';
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
  const [phonePeDiscount, setPhonePeDiscount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const activeSeason = SEASONS.find(s => s.id === activeSeasonId);

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
    let rate = 0;
    let units = 0;
    
    if (formData.calculationType === 'pages') {
      rate = 2; 
      units = formData.pages;
    } else {
      if (['Maths', 'Science'].includes(formData.subject)) {
        rate = 6;
      } else {
        rate = 5; 
      }
      units = formData.lessons;
    }
    
    setCurrentRate(rate);
    const baseTotal = rate * (units || 0);
    setOriginalPrice(baseTotal);

    // 1. Calculate base price after delivery charges
    let extraPct = 0;
    if (!activeSeason) {
      const days = formData.deliveryTime;
      if (days === 1) extraPct = 0.20;
      else if (days === 2) extraPct = 0.15;
      else if (days === 3) extraPct = 0.10;
      else if (days === 4) extraPct = 0.05;
    }
    setExtraChargePercent(extraPct);

    let priceAfterDelivery = baseTotal * (1 + extraPct);

    // 2. Apply Seasonal Discount
    if (activeSeason) {
      priceAfterDelivery = baseTotal * (1 - activeSeason.discount / 100);
    }

    // 3. Apply PhonePe 5% OFF
    let finalDiscountedPrice = priceAfterDelivery;
    let phonePeBenefit = 0;
    if (formData.paymentMethod === 'Online') {
      phonePeBenefit = finalDiscountedPrice * 0.05;
      finalDiscountedPrice = finalDiscountedPrice - phonePeBenefit;
    }
    
    setPhonePeDiscount(phonePeBenefit);
    setEstimatedPrice(finalDiscountedPrice);
  }, [formData.subject, formData.pages, formData.lessons, formData.calculationType, formData.deliveryTime, formData.paymentMethod, activeSeason]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isFormValid) return;

    const newId = crypto.randomUUID();
    const unitsDisplay = formData.calculationType === 'pages' ? `${formData.pages} Pages` : `${formData.lessons} Lessons`;
    
    // Total discount calculation (Seasonal + PhonePe)
    const totalDiscount = originalPrice - estimatedPrice;

    const newRequest: HomeworkRequest = {
      id: String(newId),
      userId: String(currentUser.id),
      subject: formData.subject,
      calculationType: formData.calculationType,
      pages: formData.calculationType === 'pages' ? formData.pages : 0,
      lessons: formData.calculationType === 'lessons' ? formData.lessons : 0,
      grade: `Class ${formData.selectedClass} - Section ${formData.selectedSection} (${unitsDisplay})`,
      language: formData.language,
      handwritingStyle: formData.handwritingStyle,
      deliveryDays: formData.deliveryTime,
      specialInstructions: formData.specialInstructions + (formData.calculationType === 'lessons' ? ` [Order Type: ${formData.lessons} Lessons]` : '') + (formData.paymentMethod === 'Online' ? ' [PhonePe 5% Applied]' : ''),
      estimatedAmount: Number(estimatedPrice.toFixed(2)),
      originalAmount: Number(originalPrice.toFixed(2)),
      discountAmount: Number(totalDiscount.toFixed(2)),
      status: 'Pending',
      paymentStatus: 'Unpaid',
      paymentMethod: formData.paymentMethod,
      createdAt: new Date().toISOString(),
      seasonId: activeSeason?.id
    };

    try {
      await addRequest(newRequest);
      setLastCreatedId(newId);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setShowSuccess(true);
    } catch (err) {
      alert("Error submitting request. Please try again.");
    }
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
          </div>

          <div className="lg:w-7/12 w-full scroll-reveal reveal-right">
            <div className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
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

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Delivery (Days)</label>
                    <select 
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({...formData, deliveryTime: parseInt(e.target.value)})}
                      className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-[#d4af37] transition-all text-white font-bold cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 10].map(day => <option key={day} value={day}>{day} Day{day > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${formData.calculationType === 'pages' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-lg shadow-yellow-500/5' : 'border-white/5 opacity-40'}`} onClick={() => setFormData({...formData, calculationType: 'pages'})}>
                        <div className="flex items-center space-x-3 mb-3">
                          <input type="radio" checked={formData.calculationType === 'pages'} readOnly className="w-4 h-4 accent-[#d4af37]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Pages</span>
                        </div>
                        <input 
                          type="text" inputMode="numeric"
                          disabled={formData.calculationType !== 'pages'}
                          value={formData.pages === 0 ? '' : formData.pages}
                          onChange={(e) => handleUnitChange(e, 'pages')}
                          className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white font-bold text-center"
                        />
                      </div>
                      <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${formData.calculationType === 'lessons' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-lg shadow-yellow-500/5' : 'border-white/5 opacity-40'}`} onClick={() => setFormData({...formData, calculationType: 'lessons'})}>
                        <div className="flex items-center space-x-3 mb-3">
                          <input type="radio" checked={formData.calculationType === 'lessons'} readOnly className="w-4 h-4 accent-[#d4af37]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Lessons</span>
                        </div>
                        <input 
                          type="text" inputMode="numeric"
                          disabled={formData.calculationType !== 'lessons'}
                          value={formData.lessons === 0 ? '' : formData.lessons}
                          onChange={(e) => handleUnitChange(e, 'lessons')}
                          className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Class</label>
                    <select 
                      value={formData.selectedClass}
                      onChange={(e) => setFormData({...formData, selectedClass: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-[#d4af37] transition-all text-white font-bold cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select Class</option>
                      {[5, 6, 7, 8, 9, 10, 11, 12].map(c => <option key={c} value={c.toString()}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Section</label>
                    <select 
                      value={formData.selectedSection}
                      onChange={(e) => setFormData({...formData, selectedSection: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 outline-none focus:border-[#d4af37] transition-all text-white font-bold cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select Section</option>
                      {['A', 'B', 'C', 'D', 'E', 'F'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
                      className={`h-16 rounded-2xl border transition-all font-bold flex flex-col items-center justify-center space-y-1 ${formData.paymentMethod === 'COD' ? 'border-white/20 bg-white/5 text-white' : 'border-white/10 bg-black text-gray-500 hover:border-white/20'}`}
                    >
                      <span className="text-sm">Cash On Delivery</span>
                      <span className="text-[8px] opacity-40 uppercase">Standard Pricing</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'Online'})}
                      className={`h-16 rounded-2xl border transition-all font-bold flex flex-col items-center justify-center space-y-1 relative overflow-hidden ${formData.paymentMethod === 'Online' ? 'border-[#6739B7] bg-[#6739B7]/10 text-[#6739B7]' : 'border-white/10 bg-black text-gray-500 hover:border-white/20'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <img src="https://img.icons8.com/color/48/phone-pe.png" alt="PhonePe" className="h-5 w-5" />
                        <span className="text-sm">PhonePe</span>
                      </div>
                      <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Extra 5% OFF</span>
                      {formData.paymentMethod === 'Online' && <div className="absolute top-0 right-0 bg-[#6739B7] text-white p-1 rounded-bl-lg"><CheckCircle2 size={10} /></div>}
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 space-y-6">
                  <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pricing Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="text-white">₹{originalPrice.toFixed(2)}</span>
                      </div>
                      {extraChargePercent > 0 && (
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-yellow-500">Fast Delivery ({Math.round(extraChargePercent * 100)}%):</span>
                          <span className="text-yellow-500">+₹{(originalPrice * extraChargePercent).toFixed(2)}</span>
                        </div>
                      )}
                      {activeSeason && (
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-[#d4af37]">{activeSeason.title} ({activeSeason.discount}%):</span>
                          <span className="text-[#d4af37]">-₹{(originalPrice * (activeSeason.discount / 100)).toFixed(2)}</span>
                        </div>
                      )}
                      {formData.paymentMethod === 'Online' && (
                        <div className="flex justify-between text-xs font-medium animate-pulse">
                          <div className="flex items-center space-x-1">
                            <Gift size={12} className="text-green-500" />
                            <span className="text-green-500">PhonePe Bonus Discount (5%):</span>
                          </div>
                          <span className="text-green-500">-₹{phonePeDiscount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final Total</span>
                      <span className="text-3xl font-black gold-text">₹{estimatedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={!isFormValid}
                    className="group w-full h-16 gold-gradient text-black font-black text-lg rounded-2xl shadow-xl shadow-yellow-500/20 flex items-center justify-center space-x-3 uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-30"
                  >
                    <span>Complete My Homework</span>
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {createPortal(successPopup, document.body)}
    </div>
  );
};

export default RequestHomework;
