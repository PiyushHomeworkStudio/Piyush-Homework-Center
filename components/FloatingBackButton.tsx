
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';

const FloatingBackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useStore();

  const isPublicHome = location.pathname === '/';
  const isInternalHome = location.pathname === '/dashboard';
  const isCheckoutPage = location.pathname.startsWith('/checkout/');

  // Include admin routes in the visibility logic
  // Added isCheckoutPage to the exclusion list
  if (isPublicHome || isInternalHome || isCheckoutPage) return null;

  const handleBack = () => {
    if (currentUser) {
      // Internal HOME redirect for logged-in users
      navigate('/dashboard');
    } else {
      // Landing page for guests
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="fixed top-[88px] sm:top-[104px] left-3 sm:left-[20px] z-[1800] group flex items-center bg-black/90 backdrop-blur-xl border border-white/20 p-2 sm:px-4 sm:py-2 rounded-full text-white hover:border-[#d4af37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 shadow-2xl active:scale-95 scroll-reveal reveal-left"
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <ArrowLeft className="w-4 h-4 group-hover:text-[#d4af37] transition-colors" />
      </div>
      <span className="hidden sm:inline-block ml-2 text-[9px] sm:text-[10px] font-black group-hover:text-[#d4af37] transition-colors uppercase tracking-[0.2em]">
        Back to HOME
      </span>
    </button>
  );
};

export default FloatingBackButton;
