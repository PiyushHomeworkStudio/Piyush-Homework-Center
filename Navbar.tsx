
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User as UserIcon, LogOut, ChevronDown, Sparkles, Menu, X, UserCircle, MessageCircle } from 'lucide-react';
import { useStore } from '../store';
import ChatPanel from './ChatPanel';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Track if we should render the mobile menu to allow for animations
  const [renderMobileMenu, setRenderMobileMenu] = useState(false);

  // Scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      setRenderMobileMenu(true);
    } else {
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setRenderMobileMenu(false), 450); // Slightly more than transition duration
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  const handleOwnerDashboardClick = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/owner-dashboard');
  };

  const handleChatClick = () => {
    if (currentUser?.isAdmin) {
      navigate('/owner-chat');
    } else {
      setIsChatOpen(true);
    }
    setMobileMenuOpen(false);
  };

  const logoClasses = "flex items-center space-x-2 sm:space-x-3 group z-[2010] flex-shrink-0 transition-all";
  const LogoContent = (
    <>
      <div className="w-9 h-9 sm:w-11 sm:h-11 gold-gradient rounded-xl sm:rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:rotate-12 transition-transform duration-500 flex-shrink-0">
        <span className="text-black font-black text-xl sm:text-2xl">P</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm sm:text-lg font-black tracking-tighter text-white uppercase leading-tight">
          PIYUSH <span className="gold-text">HOMEWORK</span>
        </span>
        <span className="text-[7px] sm:text-[9px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-gray-500 uppercase -mt-0.5 sm:-mt-1 group-hover:text-[#d4af37] transition-colors">Business Center</span>
      </div>
    </>
  );

  const menuLinks = !currentUser 
    ? [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Chat with Team', onClick: () => { setMobileMenuOpen(false); setIsChatOpen(true); }, color: 'text-[#d4af37]' },
        { label: 'Sign In', to: '/login' },
        { label: 'Register Now', to: '/register', isButton: true }
      ]
    : [
        { label: 'Home', to: '/dashboard' },
        { label: 'Profile', to: '/profile' },
        { label: 'Chat with Team', onClick: handleChatClick, color: 'text-[#d4af37]' },
        { label: 'Analytics', to: '/analytics' },
        ...(currentUser.isAdmin ? [{ label: 'Owner Dashboard', onClick: handleOwnerDashboardClick, color: 'text-[#d4af37]' }] : []),
        { label: 'Sign Out', onClick: handleLogout, color: 'text-red-500' }
      ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[2100] bg-black border-b border-white/5 px-4 sm:px-6 py-2 sm:py-3 h-[72px] sm:h-[88px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          
          {/* LOGO & TITLE */}
          {!currentUser ? (
            <Link to="/" className={`${logoClasses} cursor-pointer`}>
              {LogoContent}
            </Link>
          ) : (
            <div className={logoClasses}>
              {LogoContent}
            </div>
          )}

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {!currentUser ? (
              <>
                <Link to="/" className="text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest">Home</Link>
                <Link to="/about" className="text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest">About</Link>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="text-[10px] font-black text-[#d4af37] hover:text-white transition-all uppercase tracking-widest flex items-center space-x-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Chat with Team</span>
                </button>
                <Link to="/login" className="text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest">Sign In</Link>
                <Link to="/register" className="gold-gradient text-black px-5 py-2 rounded-full text-[10px] font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/20 uppercase tracking-widest">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest">Home</Link>
                <Link to="/profile" className="text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest">Profile</Link>
                <button 
                  onClick={handleChatClick}
                  className="text-[10px] font-black text-[#d4af37] hover:text-white transition-all uppercase tracking-widest flex items-center space-x-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Chat with Team</span>
                </button>
                <Link to="/analytics" className="text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest flex items-center space-x-1">
                  <span>Analytics</span>
                  <Sparkles className="w-3 h-3 text-[#d4af37] flex-shrink-0" />
                </Link>
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:border-[#d4af37] hover:bg-white/10 transition-all z-[1010]"
                  >
                    <div className="w-5 h-5 rounded-full gold-gradient flex items-center justify-center p-0.5 flex-shrink-0">
                      <UserIcon className="w-3 h-3 text-black" />
                    </div>
                    <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{currentUser.fullName}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-neutral-900 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 z-[1100] scale-in overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/5 mb-1 bg-black/40">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Signed in as</p>
                        <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                      </div>
                      {currentUser.isAdmin && (
                        <button 
                          onClick={handleOwnerDashboardClick}
                          className="w-full flex items-center space-x-3 px-5 py-3.5 text-[10px] font-bold text-gray-300 hover:bg-white/5 hover:text-[#d4af37] transition-all text-left"
                        >
                          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Owner Dashboard</span>
                        </button>
                      )}
                      <Link to="/profile" className="w-full flex items-center space-x-3 px-5 py-3.5 text-[10px] font-bold text-gray-300 hover:bg-white/5 transition-all text-left">
                        <UserCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>My Profile</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-5 py-3.5 text-[10px] font-bold text-red-500 hover:bg-red-500/5 transition-all text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <div className="flex items-center space-x-3 md:hidden z-[2010]">
            <button className="text-white p-2 hover:bg-white/5 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} className="text-[#d4af37]" /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* SOLID BLACK MOBILE MENU DROPDOWN - STRICT POSITIONING */}
        <div 
          className={`md:hidden fixed top-[72px] sm:top-[88px] left-0 right-0 bottom-0 z-[2000] bg-[#000000] transition-all duration-[400ms] ease-in-out transform origin-top border-t border-white/5 
            ${mobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-4 opacity-0 pointer-events-none'}
            ${renderMobileMenu ? 'block' : 'hidden'}
          `}
        >
          {/* Content Wrapper */}
          <div className="flex flex-col h-full px-8 py-10 space-y-1 relative z-10 overflow-y-auto custom-scroll">
            {menuLinks.map((link, index) => {
              const baseClasses = `block w-full text-left py-4 text-xl font-black uppercase tracking-[0.2em] transition-all border-b border-white/5 last:border-0`;
              
              const delay = `${(index + 1) * 60}ms`;

              if (link.isButton) {
                return (
                  <div 
                    key={index} 
                    className={`pt-8 animate-mobile-item`} 
                    style={{ animationDelay: delay, animationFillMode: 'forwards' }}
                  >
                    <Link 
                      to={link.to || '#'} 
                      className="block w-full py-5 gold-gradient text-black rounded-full text-center font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-yellow-500/20 active:scale-95 transition-transform"
                    >
                      {link.label}
                    </Link>
                  </div>
                );
              }

              if (link.onClick) {
                return (
                  <button 
                    key={index} 
                    onClick={link.onClick}
                    className={`${baseClasses} animate-mobile-item ${link.color || 'text-white hover:text-[#d4af37]'}`}
                    style={{ animationDelay: delay, animationFillMode: 'forwards' }}
                  >
                    {link.label}
                  </button>
                );
              }

              return (
                <Link 
                  key={index} 
                  to={link.to || '#'} 
                  className={`${baseClasses} animate-mobile-item ${link.color || 'text-white hover:text-[#d4af37]'}`}
                  style={{ animationDelay: delay, animationFillMode: 'forwards' }}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Bottom Decorative Element */}
            <div 
              className="mt-auto py-10 text-center animate-mobile-item" 
              style={{ animationDelay: `${(menuLinks.length + 1) * 60}ms`, animationFillMode: 'forwards' }}
            >
              <div className="h-[1px] w-12 bg-[#d4af37]/30 mx-auto mb-4"></div>
              <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">Elite Academic Hub</p>
            </div>
          </div>
        </div>
      </nav>

      {/* User Chat Sidebar Overlay */}
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default Navbar;
