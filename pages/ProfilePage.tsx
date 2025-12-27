
import React, { useState } from 'react';
import { useStore } from '../store';
import { Edit2, Eye, EyeOff, Save, CheckCircle, Smartphone, UserCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import PinInput from '../components/PinInput';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUser } = useStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [name, setName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New PIN Change State
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showNewPins, setShowNewPins] = useState(false);

  if (!currentUser) return null;

  const handleSaveName = () => {
    updateUser(currentUser.id, { fullName: name });
    setIsEditingName(false);
    triggerSuccess();
  };

  const handleSavePhone = () => {
    updateUser(currentUser.id, { phoneNumber: phone });
    setIsEditingPhone(false);
    triggerSuccess();
  };

  const handleUpdatePin = () => {
    setPinError('');
    if (newPin.length !== 6) {
      setPinError('PIN must be 6 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    
    updateUser(currentUser.id, { pin: newPin });
    setIsChangingPin(false);
    setNewPin('');
    setConfirmPin('');
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const initial = currentUser.fullName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pt-32 sm:pt-40 pb-16 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-10 scroll-reveal reveal-up">
        
        {/* Header with Avatar */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 gold-gradient rounded-full flex items-center justify-center text-black font-black text-6xl sm:text-7xl shadow-[0_0_50px_rgba(212,175,55,0.2)] border-4 border-white/10 group-hover:scale-105 transition-transform duration-500">
              {initial}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-black text-white">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-serif gold-text">{currentUser.fullName}</h1>
            <p className="text-gray-500 uppercase tracking-widest text-xs font-black mt-2">Member Since 2025</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-neutral-900/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-12">
          <div className="absolute top-0 right-0 w-48 h-48 gold-gradient opacity-5 blur-[100px] pointer-events-none"></div>

          {/* Name Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center space-x-2">
              <UserCircle size={14} className="text-[#d4af37]" />
              <span>Full Name</span>
            </label>
            <div className="flex items-center justify-between group h-14 bg-black/40 border border-white/5 rounded-2xl px-6 transition-all focus-within:border-[#d4af37]/50">
              {isEditingName ? (
                <input 
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-lg w-full"
                />
              ) : (
                <span className="text-white font-bold text-lg">{currentUser.fullName}</span>
              )}
              
              <button 
                onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)}
                className="text-gray-600 hover:text-[#d4af37] transition-colors p-2"
              >
                {isEditingName ? <Save size={20} /> : <Edit2 size={18} className="opacity-40 hover:opacity-100 transition-opacity" />}
              </button>
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center space-x-2">
              <Smartphone size={14} className="text-[#d4af37]" />
              <span>Phone Number</span>
            </label>
            <div className="flex items-center justify-between group h-14 bg-black/40 border border-white/5 rounded-2xl px-6 transition-all focus-within:border-[#d4af37]/50">
              {isEditingPhone ? (
                <input 
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-lg w-full"
                />
              ) : (
                <span className="text-white font-bold text-lg">{currentUser.phoneNumber}</span>
              )}
              
              <button 
                onClick={() => isEditingPhone ? handleSavePhone() : setIsEditingPhone(true)}
                className="text-gray-600 hover:text-[#d4af37] transition-colors p-2"
              >
                {isEditingPhone ? <Save size={20} /> : <Edit2 size={18} className="opacity-40 hover:opacity-100 transition-opacity" />}
              </button>
            </div>
          </div>

          {/* PIN Field */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center space-x-2">
                <ShieldCheck size={14} className="text-[#d4af37]" />
                <span>Security PIN</span>
              </label>
              <div className="flex items-center justify-between group h-14 bg-black/40 border border-white/5 rounded-2xl px-6">
                <span className="text-white font-black tracking-[0.5em] text-xl">
                  {showPin ? currentUser.pin : '••••••'}
                </span>
                
                <button 
                  onClick={() => setShowPin(!showPin)}
                  className="text-gray-600 hover:text-[#d4af37] transition-colors p-2"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Change PIN Expandable Section */}
            <div className="space-y-4">
              <button 
                onClick={() => setIsChangingPin(!isChangingPin)}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all border ${isChangingPin ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-[#d4af37] hover:bg-[#d4af37]/10'}`}
              >
                {isChangingPin ? 'CANCEL CHANGE' : 'CHANGE PIN'}
              </button>

              {isChangingPin && (
                <div className="bg-black/30 border border-white/10 p-6 sm:p-8 rounded-[2rem] space-y-8 animate-page-enter">
                   <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Update Security PIN</p>
                      <button 
                        onClick={() => setShowNewPins(!showNewPins)}
                        className="text-gray-500 hover:text-[#d4af37] transition-colors"
                      >
                        {showNewPins ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                   </div>

                   <PinInput 
                     value={newPin} 
                     onChange={setNewPin} 
                     label="New 6-Digit PIN" 
                     showToggle={false} 
                     externalMasked={!showNewPins} 
                   />
                   
                   <PinInput 
                     value={confirmPin} 
                     onChange={setConfirmPin} 
                     label="Confirm New PIN" 
                     showToggle={false} 
                     externalMasked={!showNewPins} 
                   />

                   {pinError && (
                     <div className="flex items-center space-x-2 text-red-500 justify-center bg-red-500/5 py-2 rounded-xl">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{pinError}</span>
                     </div>
                   )}

                   <button 
                     onClick={handleUpdatePin}
                     disabled={newPin.length !== 6 || confirmPin.length !== 6}
                     className="w-full gold-gradient py-5 rounded-2xl text-black font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
                   >
                     Update PIN
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="flex items-center justify-center space-x-3 text-green-500 animate-bounce">
            <CheckCircle size={20} />
            <span className="font-bold uppercase tracking-widest text-xs">Profile Updated Successfully</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
