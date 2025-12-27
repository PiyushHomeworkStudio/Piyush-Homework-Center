
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-serif gold-text">Piyush Homework Center</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Providing high-quality handwritten homework services to students with precision, care, and timely delivery.
          </p>
          <div className="pt-6 border-t border-white/5 w-full">
            <p className="text-sm text-gray-600">© 2025 PIYUSH HOMEWORK CENTER. All Rights Reserved.</p>
            <p className="text-xs font-bold tracking-widest text-[#d4af37]/40 uppercase mt-4 italic">
              Owned & Managed by PIYUSH SHARMA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
