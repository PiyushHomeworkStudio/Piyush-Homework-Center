
import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Clock, ShieldCheck, Star, ChevronRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-16 pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center relative overflow-hidden">
        <div className="relative z-10 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
          <div className="scroll-reveal reveal-down stagger-1 inline-flex items-center space-x-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-black text-[#d4af37] shadow-lg shadow-yellow-500/5 uppercase tracking-widest">
            <Star className="w-3 h-3 sm:w-4 h-4 fill-current animate-pulse flex-shrink-0" />
            <span>#1 Handwritten Homework Service</span>
          </div>
          
          <h1 className="scroll-reveal reveal-up stagger-2 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif leading-tight px-2">
             Get Your <span className="gold-text">Homework Done</span> Professionally
          </h1>
          
          <p className="scroll-reveal reveal-up stagger-3 text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            Premium academic support with high-quality handwriting. Timely delivery and students' favorite pricing logic.
          </p>

          <div className="scroll-reveal reveal-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-10 px-6">
            <Link 
              to="/register" 
              className="group relative w-full sm:w-auto px-8 py-4 sm:px-14 sm:py-6 gold-gradient text-black font-black text-base sm:text-xl rounded-full shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)] hover:-translate-y-1.5 active:scale-95 transition-all duration-500 flex items-center justify-center space-x-3 uppercase tracking-[0.2em] overflow-hidden"
            >
              <span className="relative z-10">Register Now</span>
              <ChevronRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform duration-500 flex-shrink-0" />
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12"></div>
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 sm:px-14 sm:py-6 bg-white/5 border border-white/10 text-white font-black text-base sm:text-xl rounded-full hover:bg-white/10 hover:border-white/30 backdrop-blur-md uppercase tracking-[0.2em] transition-all duration-500"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 sm:mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto w-full px-4 sm:px-6">
          {[
            { icon: <PenTool />, title: "Handwritten", desc: "Original human handwriting tailored to your style" },
            { icon: <Clock />, title: "Fast Delivery", desc: "Express 24-hour delivery available on request" },
            { icon: <ShieldCheck />, title: "Trusted", desc: "Secure data handling and student confidentiality" },
            { icon: <Star />, title: "Quality", desc: "A+ grade presentation and accuracy guaranteed" },
          ].map((item, i) => (
            <div 
              key={i} 
              className={`scroll-reveal reveal-up bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] hover:border-[#d4af37] transition-all duration-500 hover:-translate-y-2 group shadow-xl stagger-${(i % 4) + 1}`}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 text-[#d4af37] group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                {item.icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:gold-text transition-all">{item.title}</h3>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-12 sm:py-20 relative px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="scroll-reveal reveal-zoom bg-neutral-900/60 rounded-[2.5rem] sm:rounded-[4rem] p-10 sm:p-20 border border-white/5 relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 gold-gradient opacity-10 blur-[100px] animate-pulse"></div>
            <h2 className="scroll-reveal reveal-up stagger-1 text-3xl sm:text-4xl md:text-5xl font-serif mb-6 sm:mb-8 gold-text text-center leading-tight">Ready to free up your time?</h2>
            <Link 
              to="/register" 
              className="scroll-reveal reveal-up stagger-2 w-full sm:w-auto text-center bg-white text-black px-8 py-4 sm:px-12 sm:py-5 rounded-full font-black text-lg sm:text-xl hover:bg-[#d4af37] uppercase tracking-widest shadow-xl transition-all duration-500 hover:scale-105 active:scale-95"
            >
              Join 500+ Happy Students
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
