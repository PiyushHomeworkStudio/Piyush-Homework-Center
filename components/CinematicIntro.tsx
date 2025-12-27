
import React, { useState, useEffect } from 'react';

const CinematicIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<'logo' | 'typing' | 'exit'>('logo');
  const [displayText, setDisplayText] = useState('');
  const [showSubtext, setShowSubtext] = useState(false);
  
  const fullText = "PIYUSH HOMEWORK CENTER";
  const subText = "Professional Homework & Handwriting";

  useEffect(() => {
    // STAGE 1: Logo Reveal (1 Second)
    const logoTimer = setTimeout(() => {
      setStage('typing');
    }, 1000);

    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (stage === 'typing') {
      let charIndex = 0;
      // Typing "PIYUSH HOMEWORK CENTER" (22 chars)
      // We slow down the typing to make it cinematic and consume the 6-second window
      const typingInterval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          // Show subtext after main typing finishes
          setTimeout(() => setShowSubtext(true), 500);
          
          // The total duration for typing + subtext is 6 seconds.
          // Since typing takes approx 22 * 200ms = 4.4s, 
          // we wait until the 7th total second to exit.
          setTimeout(() => {
            setStage('exit');
            setTimeout(onComplete, 1200); // Smooth fade out
          }, 1500); 
        }
      }, 200); 

      return () => clearInterval(typingInterval);
    }
  }, [stage, onComplete]);

  return (
    <div className={`fixed inset-0 z-[5000] bg-black flex items-center justify-center overflow-hidden transition-all duration-1000 ${stage === 'exit' ? 'opacity-0 scale-125 blur-3xl' : 'opacity-100'}`}>
      
      {/* Cinematic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4af37]/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)]"></div>
      </div>

      <div className="relative flex flex-col items-center">
        {stage === 'logo' ? (
          /* LOGO PHASE: Golden Box with Curved Borders and Black 'P' */
          <div className="animate-splash-p flex flex-col items-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 gold-gradient rounded-[2.5rem] flex items-center justify-center shadow-[0_0_80px_rgba(212,175,55,0.5)] border border-white/20 transform transition-transform">
              <span className="text-black font-black text-6xl sm:text-7xl tracking-tighter drop-shadow-sm">P</span>
            </div>
          </div>
        ) : (
          /* TYPING PHASE: Main Title and Elegant Subtext */
          <div className="text-center space-y-6 px-8 max-w-5xl">
            <div className="relative">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-black tracking-tight gold-text leading-tight drop-shadow-2xl">
                {displayText}
                <span className="inline-block w-1.5 h-10 sm:h-20 bg-[#d4af37] ml-2 animate-cursor shadow-[0_0_15px_#d4af37]"></span>
              </h1>
            </div>
            
            <div className={`transition-all duration-[1.5s] ease-out transform ${showSubtext ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
              <p className="text-gray-400 font-medium tracking-[0.4em] text-sm sm:text-lg md:text-xl uppercase italic">
                {subText}
              </p>
              <div className="mt-8 flex justify-center">
                <div className="h-[2px] w-48 gold-gradient opacity-60 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinematicIntro;
