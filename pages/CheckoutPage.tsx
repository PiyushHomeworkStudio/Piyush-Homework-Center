
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Transaction } from '../types';
import { CreditCard, ChevronRight, CheckCircle, Info, Sparkles, Smartphone, ShieldCheck, ArrowLeft } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const { requests, currentUser, addTransaction } = useStore();
  const navigate = useNavigate();
  
  const [txId, setTxId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const homework = requests.find(r => r.id === homeworkId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!homework || homework.userId !== currentUser?.id) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center px-6">
        <h2 className="text-2xl font-serif gold-text mb-4">Request Not Found</h2>
        <button onClick={() => navigate('/analytics')} className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest">Back to Analytics</button>
      </div>
    );
  }

  const handlePaymentSubmit = () => {
    if (!txId.trim()) {
      setError('Please enter a valid Transaction ID / UTR.');
      return;
    }

    if (txId.length < 6) {
      setError('Transaction ID seems too short. Please verify.');
      return;
    }

    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      homeworkId: homework.id,
      amount: homework.estimatedAmount,
      transactionId: txId,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    addTransaction(tx);
    setShowSuccess(true);
    setTimeout(() => navigate('/analytics'), 3000);
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-40 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex items-center space-x-4">
             <button onClick={() => navigate('/analytics')} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
               <ArrowLeft className="w-6 h-6 text-gray-400" />
             </button>
             <div>
                <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter gold-text">Secure Checkout</h1>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Institutional Payment Gateway</p>
             </div>
          </div>
          <div className="bg-neutral-900 border border-white/10 px-8 py-4 rounded-[1.5rem] flex items-center space-x-6">
             <div className="text-right">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Payable Amount</p>
                <p className="text-2xl font-black text-[#d4af37]">₹{homework.estimatedAmount}</p>
             </div>
             <div className="h-8 w-[1px] bg-white/10"></div>
             <CreditCard className="text-[#d4af37] w-8 h-8" />
          </div>
        </div>

        {/* Success Feedback overlay */}
        {showSuccess && (
          <div className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-8 animate-bounce">
              <CheckCircle size={60} strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-black gold-text mb-4 uppercase tracking-tighter">Verification Sent!</h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
              We have received your transaction details. Our team will verify the payment within the next 24 hours.
            </p>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-12 animate-pulse">Redirecting to Dashboard...</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* LEFT SIDE: Instructions Panel (HIDDEN ON MOBILE) */}
          <div className="hidden lg:block lg:w-5/12 space-y-10">
            <div className="bg-neutral-900 border border-white/5 rounded-[3rem] p-12 space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 gold-gradient opacity-10 blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-[3s]"></div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-[#d4af37]">
                  <Info size={20} />
                  <h3 className="text-lg font-black uppercase tracking-widest">Payment Instructions</h3>
                </div>
                <div className="h-[2px] w-12 gold-gradient rounded-full"></div>
              </div>

              <ul className="space-y-8">
                {[
                  "Scan the QR code displayed using your PhonePe App.",
                  "Enter the exact amount mentioned above (₹" + homework.estimatedAmount + ").",
                  "After successful payment, copy the 12-digit UTR / Transaction ID.",
                  "Paste the ID in the input box on the right and click Verify.",
                  "Do not close this page until you have submitted the ID.",
                  "Verification will be processed by PIYUSH TEAM within 24 hours."
                ].map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-4 group">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:border-[#d4af37] group-hover:text-[#d4af37] transition-all flex-shrink-0 mt-1">
                      {idx + 1}
                    </div>
                    <p className="text-gray-400 font-medium leading-relaxed group-hover:text-gray-200 transition-colors">{point}</p>
                  </li>
                ))}
              </ul>

              <div className="pt-8 border-t border-white/5 flex items-center space-x-4">
                 <ShieldCheck className="text-green-500 w-6 h-6 flex-shrink-0" />
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">Encrypted Secure Transaction • Verified Professional Service</p>
              </div>
            </div>

            <div className="p-8 bg-black border border-[#d4af37]/20 rounded-[2.5rem] flex items-center space-x-6">
              <div className="w-12 h-12 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center text-[#d4af37] flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <p className="text-xs text-gray-400 font-medium italic">"Every payment is tracked manually to ensure 100% security for our students."</p>
            </div>
          </div>

          {/* RIGHT SIDE: Payment Panel (MOBILE PRIMARY) */}
          <div className="flex-1 space-y-12">
            <div className="bg-white text-black rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-14 border-[8px] border-black shadow-2xl space-y-10 sm:space-y-12">
              
              {/* PhonePe Identity */}
              <div className="flex flex-col items-center text-center space-y-4">
                 <img 
                    src="https://img.icons8.com/color/144/phone-pe.png" 
                    alt="PhonePe" 
                    className="w-16 h-16 sm:w-24 sm:h-24 object-contain animate-float" 
                 />
                 <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">Instant Verification</h2>
                 <p className="text-gray-500 font-black text-[10px] sm:text-xs uppercase tracking-[0.3em]">PhonePe Secure Payment</p>
              </div>

              {/* QR Code Container */}
              <div className="max-w-xs mx-auto space-y-8">
                <div className="aspect-square bg-white border-[6px] sm:border-[8px] border-black rounded-[3rem] p-6 sm:p-8 shadow-2xl hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden group">
                  <img 
                    src="https://instasize.com/api/image/687b32a2051442e5211f5b53f62fb7ad25498a8f65c0ba7ad72b56d2ce1d671c.jpeg" 
                    alt="Scan to Pay" 
                    className="w-full h-full object-contain" 
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="text-center py-4 sm:py-6 bg-gray-100 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-gray-300 group">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Merchant UPI ID</p>
                    <p className="font-black text-base sm:text-xl select-all text-black tracking-tight group-hover:text-[#6739B7] transition-colors">9970139021@ybl</p>
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-10 max-w-lg mx-auto w-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Reference (UTR)</label>
                    {error && <span className="text-[10px] text-red-500 font-black uppercase animate-pulse">Required</span>}
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={txId}
                      onChange={(e) => {
                        setTxId(e.target.value.replace(/\s/g, ''));
                        setError('');
                      }}
                      placeholder="Enter 12-Digit UTR Number"
                      className={`w-full h-16 sm:h-20 bg-gray-50 border-[3px] ${error ? 'border-red-500' : 'border-gray-200'} rounded-[1.5rem] sm:rounded-[2rem] px-8 outline-none focus:border-black focus:bg-white transition-all text-xl sm:text-2xl font-black placeholder:text-gray-200 uppercase`}
                    />
                    {txId.length > 0 && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckCircle size={24} />
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase text-center px-4 leading-relaxed">
                    Check your PhonePe transaction history for the 12-digit UTR number.
                  </p>
                </div>

                <button 
                  onClick={handlePaymentSubmit}
                  className="w-full py-6 sm:py-8 bg-black text-white font-black text-lg sm:text-2xl rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 transition-all hover:scale-[1.02] flex items-center justify-center space-x-4 uppercase tracking-[0.2em] group"
                >
                  <span>Submit Verification</span>
                  <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="pt-6 flex items-center justify-center space-x-3 text-gray-400">
                   <Smartphone size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Mobile Verified Processing</span>
                </div>
              </div>
            </div>

            {/* Mobile-only Notice (Fallback for visibility) */}
            <div className="lg:hidden p-8 bg-neutral-900/50 rounded-[2.5rem] border border-white/5 text-center space-y-4">
              <p className="text-gray-500 text-xs font-medium leading-relaxed">
                Verification can take up to 24 hours. Your task status will be updated automatically in the Analytics dashboard once confirmed.
              </p>
              <div className="h-[1px] w-12 gold-gradient mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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

export default CheckoutPage;
