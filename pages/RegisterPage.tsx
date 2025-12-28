
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore, OWNER_NUMBER } from '../store';
import { User as UserIcon, Smartphone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import PinInput from '../components/PinInput';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    pin: '',
    confirmPin: ''
  });
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [showPins, setShowPins] = useState(true); 
  const [error, setError] = useState('');
  const { addUser, setCurrentUser, users } = useStore();
  const navigate = useNavigate();

  const isPhoneValid = formData.phoneNumber.length === 10;
  const isPinValid = formData.pin.length === 6;
  const isConfirmValid = formData.confirmPin === formData.pin;
  const isFormValid = formData.fullName.trim() !== '' && isPhoneValid && isPinValid && isConfirmValid;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phoneNumber: value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    setError('');

    if (!isPhoneValid) return;

    if (formData.pin.length !== 6) {
      setError('PIN must be exactly 6 digits.');
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match.');
      return;
    }

    if (users.some(u => u.phoneNumber === formData.phoneNumber)) {
      setError('Phone number already registered.');
      return;
    }

    const newUser: User = {
      // Using crypto.randomUUID() for database compatibility
      id: crypto.randomUUID(),
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      pin: formData.pin,
      isAdmin: formData.phoneNumber === OWNER_NUMBER
    };

    addUser(newUser);
    setCurrentUser(newUser);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-32 sm:pt-44 pb-16">
      <div className="text-center mb-8 animate-float w-full max-w-6xl mx-auto">
        <h1 className="font-serif font-black tracking-tighter text-shine drop-shadow-[0_0_20px_rgba(212,175,55,0.3)] leading-none">
          <span className="block mb-2 opacity-90 text-[clamp(1.2rem,3.5vw,2rem)] uppercase tracking-[0.4em]">Register to</span>
          <span className="block gold-text text-[clamp(2.5rem,8vw,5rem)]">Piyush Homework Hub</span>
        </h1>
      </div>

      <div className="w-full max-w-md reveal-up stagger-2">
        <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 gold-gradient opacity-10 blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-serif gold-text">Create Account</h2>
            <p className="text-gray-500 text-sm font-medium">Join the premium homework service</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-6">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Personal Details</label>
              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:border-[#d4af37] outline-none transition-all font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-Digit Mobile Number"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      onBlur={() => setPhoneTouched(true)}
                      className={`w-full bg-black border ${phoneTouched && !isPhoneValid ? 'border-red-500' : 'border-white/10'} rounded-2xl py-5 pl-12 pr-4 focus:border-[#d4af37] outline-none transition-all font-bold`}
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
              </div>

              <div className="pt-4 space-y-4 border-t border-white/5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Security Credentials</label>
                  <button 
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="flex items-center space-x-2 text-[#d4af37] hover:text-white transition-all bg-[#d4af37]/5 px-3 py-1.5 rounded-full border border-[#d4af37]/20"
                  >
                    {showPins ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{showPins ? 'Hide' : 'Show'} PINs</span>
                  </button>
                </div>

                <PinInput 
                  value={formData.pin} 
                  onChange={(val) => setFormData({...formData, pin: val})} 
                  label="Create 6-Digit PIN" 
                  showToggle={false}
                  externalMasked={!showPins}
                />
                
                <div className="space-y-1">
                  <PinInput 
                    value={formData.confirmPin} 
                    onChange={(val) => setFormData({...formData, confirmPin: val})} 
                    label="Confirm Security PIN" 
                    showToggle={false}
                    externalMasked={!showPins}
                  />
                  {formData.confirmPin !== '' && formData.confirmPin !== formData.pin && (
                    <div className="flex items-center space-x-1.5 text-red-500 mt-1 ml-1 animate-fade-in">
                       <AlertCircle size={12} />
                       <p className="text-[10px] font-black uppercase tracking-widest">PIN not matching</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 py-4 rounded-xl">
                <p className="text-red-500 text-xs font-bold text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={!isFormValid}
              className="w-full py-5 gold-gradient text-black font-black text-lg rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-yellow-500/20 uppercase tracking-widest disabled:opacity-30 disabled:hover:scale-100"
            >
              Create My Account
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account? <Link to="/login" className="text-[#d4af37] hover:underline font-black">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
