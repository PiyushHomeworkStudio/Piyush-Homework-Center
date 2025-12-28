
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Smartphone, AlertCircle } from 'lucide-react';
import PinInput from '../components/PinInput';

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { users, setCurrentUser } = useStore();
  const navigate = useNavigate();

  const isPhoneValid = phoneNumber.length === 10;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and max length of 10
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    
    if (!isPhoneValid) return;

    if (pin.length < 6) {
      setError('Please enter your complete 6-digit PIN.');
      return;
    }

    const user = users.find(u => u.phoneNumber === phoneNumber && u.pin === pin);
    
    if (user) {
      setCurrentUser(user);
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-32 sm:pt-44 pb-12">
      <div className="text-center mb-8 animate-float w-full max-w-6xl mx-auto">
        <h1 className="font-serif font-black tracking-tighter text-shine drop-shadow-[0_0_20px_rgba(212,175,55,0.3)] leading-none">
          <span className="block mb-2 opacity-90 text-[clamp(1.2rem,3.5vw,2rem)] uppercase tracking-[0.4em]">Login to</span>
          <span className="block gold-text text-[clamp(2.5rem,8vw,5rem)]">Piyush Homework Hub</span>
        </h1>
      </div>

      <div className="w-full max-w-md reveal-up stagger-2">
        <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 gold-gradient opacity-10 blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-serif gold-text">Welcome Back</h2>
            <p className="text-gray-500 text-sm font-medium">Sign in to your homework hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#d4af37] transition-colors flex-shrink-0" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-Digit Number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onBlur={() => setPhoneTouched(true)}
                    className={`w-full bg-black border ${phoneTouched && !isPhoneValid ? 'border-red-500' : 'border-white/10'} rounded-2xl py-5 pl-12 pr-4 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 outline-none transition-all font-bold`}
                    required
                  />
                </div>
                {phoneTouched && !isPhoneValid && (
                  <div className="flex items-center space-x-1.5 text-red-500 mt-1 ml-1">
                    <AlertCircle size={12} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Please enter a valid 10-digit mobile number</p>
                  </div>
                )}
              </div>

              <PinInput 
                value={pin} 
                onChange={setPin} 
                label="Enter 6-Digit Security PIN" 
                showToggle={true}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 py-4 rounded-xl">
                <p className="text-red-500 text-xs font-bold text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={!isPhoneValid || pin.length < 6}
              className="w-full py-5 gold-gradient text-black font-black text-lg rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-yellow-500/20 uppercase tracking-widest disabled:opacity-30 disabled:hover:scale-100"
            >
              Unlock Account
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">
              Don't have an account? <Link to="/register" className="text-[#d4af37] hover:underline font-black">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
