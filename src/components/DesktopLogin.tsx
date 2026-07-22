import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { Logo } from './Logo';
import { generateAppCode } from '../utils/totp';

export const DesktopLogin = ({ onLogin }: { onLogin: (userId: string) => void }) => {
  const { state } = useAppContext();
  const savedUserId = localStorage.getItem("loggedInUserId");
  const [step, setStep] = useState(savedUserId ? 'code' : 'userid_password');
  
  const [userId, setUserId] = useState(savedUserId ? savedUserId : "");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (step === 'userid_password') {
       if (userId === "admin" && password === "admin") {
         setUserId("admin");
         setStep('code');
         return;
       }
       const user = state.users.find(u => (u.userId === userId || u.email === userId) && u.password === password);
       if (user) {
         setUserId(user.userId);
         setStep('code');
       } else {
         setError("Invalid User ID or Password");
       }
    } else if (step === 'code') {
       if (userId === "admin") {
         const expectedCode = generateAppCode("admin");
         if (code === expectedCode) {
           onLogin("admin");
           return;
         } else {
           setError("Invalid App Code");
           return;
         }
       }
       const user = state.users.find(u => u.id === userId || u.userId === userId);
       if (user) {
         const expectedCode = generateAppCode(user.userId);
         if (code === expectedCode) {
           onLogin(user.id || user.userId);
         } else {
           setError("Invalid App Code");
         }
       } else {
         setStep('userid_password');
       }
    }
  };

  let user = state.users.find(u => u.id === userId || u.userId === userId);
  let adminProfile = null;
  if (userId === "admin" || (user && user.role === "CEO")) {
     try {
       const saved = localStorage.getItem("adminProfile");
       if (saved) adminProfile = JSON.parse(saved);
     } catch (e) {}
  }
  
  const displayPhotoUrl = adminProfile?.photoUrl || user?.photoUrl;
  const displayName = adminProfile?.name || user?.name || "DEMOUSER";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center font-sans text-white">
      <div className="w-full max-w-[400px] bg-[#1e1e1e] p-10 rounded shadow-2xl relative border border-white/5">
        
        {step === 'userid_password' ? (
          <div className="animate-fade-in">
             <div className="flex flex-col items-center mb-8">
               <Logo className="scale-125 mb-4" forceWhiteText={true} />
               <h2 className="text-xl font-medium mt-4 text-[#dddddd]">Login to Kite</h2>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                 <label className="block text-xs text-[#999999] mb-1">User ID</label>
                 <input 
                   type="text" 
                   className="w-full bg-transparent border-b border-[#444444] py-2 focus:border-[#DF514C] dark:border-[#E25F5B] focus:outline-none transition-colors text-white"
                   value={userId}
                   onChange={e => setUserId(e.target.value)}
                   required
                 />
               </div>
               <div>
                 <label className="block text-xs text-[#999999] mb-1">Password</label>
                 <input 
                   type="password" 
                   className="w-full bg-transparent border-b border-[#444444] py-2 focus:border-[#DF514C] dark:border-[#E25F5B] focus:outline-none transition-colors text-white"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   required
                 />
               </div>
               {error && <div className="text-[#DF514C] dark:text-[#E25F5B] text-sm">{error}</div>}
               <button type="submit" className="w-full bg-[#FF5722] hover:bg-[#FF5722] text-white font-medium py-3 rounded transition-colors mt-4">
                 Login
               </button>
               <div className="mt-6 text-center">
                 <span className="text-[#999999] text-[13px] hover:text-white cursor-pointer">Forgot user ID or password?</span>
               </div>
             </form>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col items-center">
             {displayPhotoUrl ? (
               <img src={displayPhotoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-4 shadow-md" />
             ) : (
               <div className="w-20 h-20 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-3xl font-normal mb-4 shadow-md">
                 {initials}
               </div>
             )}
             <h2 className="text-xl font-medium mb-1">{user?.userId || userId}</h2>
             <button type="button" onClick={() => { setStep('userid_password'); setPassword(""); }} className="text-[#4184f3] text-[13px] hover:underline mb-8">
               Change user
             </button>
             
             <form onSubmit={handleSubmit} className="w-full space-y-6">
               <div className="relative border border-[#444444] rounded flex items-center bg-[#181818] overflow-hidden">
                  <div className="px-4 py-3 border-r border-[#444444] text-[#999999] bg-[#1e1e1e]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  </div>
                  <div className="flex-1 relative pt-2">
                     <label className="absolute top-1 left-4 px-1 text-[10px] text-[#999999] bg-[#181818]">App Code</label>
                     <input 
                       type="text"
                       className="w-full bg-transparent pb-2 pt-3 px-4 focus:outline-none tracking-[0.5em] text-center text-white text-lg font-mono"
                       placeholder="••••••"
                       maxLength={6}
                       value={code}
                       onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                       required
                       autoFocus
                     />
                  </div>
               </div>
               <p className="text-[#999999] text-[13px] text-center px-2">
                 Open the Kite mobile app on your phone to generate the 2FA App Code. <span className="text-[#4184f3] cursor-pointer hover:underline">Need help?</span>
               </p>
               {error && <div className="text-[#DF514C] dark:text-[#E25F5B] text-sm text-center">{error}</div>}
               <button type="submit" className="w-full bg-[#FF5722] hover:bg-[#FF5722] text-white font-medium py-3.5 rounded transition-colors tracking-wide mt-2">
                 Continue
               </button>
             </form>
             <button onClick={() => { setStep('userid_password'); setPassword(""); }} className="mt-8 text-[#999999] text-[13px] hover:text-white transition-colors">
               Problem with Mobile App Code?
             </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center mt-12 text-[#666666] px-4">
        <div className="flex items-center justify-center space-x-1.5 mb-2 opacity-50 grayscale">
          <span className="font-semibold text-[#999999] text-[13px] tracking-wide uppercase">RADHIKA</span>
        </div>
        <div className="text-[11px] space-y-2 text-center max-w-2xl font-medium text-[#666666]">
          <p className="mb-6 hover:text-white cursor-pointer transition-colors text-[13px]">Don't have an account? Sign up for free!</p>
          <p className="leading-relaxed">
            Radhika Broking Limited Member of ABDL, HPG, GVT - SAKSHI BANK Reg no RADHIKA0000038655, RMAS - HPG no. IN-RM-56-2026
          </p>
          <p className="pt-2 text-[#555]">v3.0.0</p>
        </div>
      </div>
    </div>
  );
};
