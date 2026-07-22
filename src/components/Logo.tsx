import React from 'react';

export const Logo = ({ className = "", forceDarkText = false, forceWhiteText = false }: { className?: string, forceDarkText?: boolean, forceWhiteText?: boolean }) => {
  return (
    <div className={`flex items-center space-x-1.5 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M 6,20 L 16,10 L 32,10 L 22,20 Z" fill="#F05A28"/>
        <path d="M 6,20 L 22,20 L 32,30 L 16,30 Z" fill="#D32F2F"/>
      </svg>
      <span className={`text-[20px] font-medium tracking-tight ${forceWhiteText ? 'text-[#eeeeee]' : forceDarkText ? 'text-[#444444]' : 'text-black dark:text-white'}`}>
        Radhika
      </span>
    </div>
  );
};
