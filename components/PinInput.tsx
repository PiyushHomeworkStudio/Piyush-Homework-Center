
import React, { useRef, useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showToggle?: boolean;
  externalMasked?: boolean; // New prop to allow external control of visibility
}

const PinInput: React.FC<PinInputProps> = ({ 
  length = 6, 
  value, 
  onChange, 
  label, 
  showToggle = false,
  externalMasked
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [pinArray, setPinArray] = useState<string[]>(new Array(length).fill(''));
  const [isMasked, setIsMasked] = useState(true);

  // Use externalMasked if provided, otherwise use internal isMasked state
  const finalMasked = externalMasked !== undefined ? externalMasked : isMasked;

  useEffect(() => {
    if (value.length === 0) {
      setPinArray(new Array(length).fill(''));
    } else if (value.length === length) {
      setPinArray(value.split(''));
    }
  }, [value, length]);

  const handleChange = (val: string, index: number) => {
    const digit = val.slice(-1);
    if (!/^\d*$/.test(digit)) return;

    const newPin = [...pinArray];
    newPin[index] = digit;
    setPinArray(newPin);
    onChange(newPin.join(''));

    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pinArray[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(data)) return;

    const newPin = data.split('');
    const paddedPin = [...newPin, ...new Array(length - newPin.length).fill('')];
    setPinArray(paddedPin);
    onChange(paddedPin.join(''));
    
    const nextIndex = Math.min(newPin.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-3 relative w-full">
      <div className="flex items-center justify-between mb-1">
        {label && <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">{label}</label>}
        {showToggle && externalMasked === undefined && (
          <button 
            type="button"
            onClick={() => setIsMasked(!isMasked)}
            className="text-gray-500 hover:text-[#d4af37] transition-colors p-1"
            title={finalMasked ? "Show PIN" : "Hide PIN"}
          >
            {finalMasked ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
      <div className="flex justify-between gap-2 sm:gap-3">
        {pinArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputs.current[index] = el; }}
            type={finalMasked ? "password" : "text"}
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            autoComplete="off"
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-full aspect-square bg-black border border-white/10 rounded-xl sm:rounded-2xl text-center text-xl sm:text-2xl font-black text-[#d4af37] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all duration-300"
          />
        ))}
      </div>
    </div>
  );
};

export default PinInput;
