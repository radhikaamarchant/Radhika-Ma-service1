import React, { useState } from "react";
import { useAppContext } from "../utils/AppContext";
import { Logo } from "./Logo";
import { Eye, EyeOff, ArrowLeft, User, CheckCircle2, LogIn, Loader2 } from "lucide-react";
import { DesktopLogin } from "./DesktopLogin";

type Step = 'welcome' | 'login' | 'signup_email' | 'signup_name' | 'signup_password' | 'signup_photo' | 'signup_success' | 'forgot_password';

export default function Login({ onLogin }: { onLogin: (userId: string) => void }) {
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 768);
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const { state, dispatch } = useAppContext();

  const [step, setStep] = useState<Step>('welcome');
  
  // Form states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loginId, setLoginId] = useState(""); // For login: email or userId
  const [loginPassword, setLoginPassword] = useState("");
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [generatedUserId, setGeneratedUserId] = useState("");
  
  // Forgot password
  const [forgotId, setForgotId] = useState("");
  const [recoveredPassword, setRecoveredPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateUserId = () => {
    let maxId = 108; // start from RMAS109
    state.users.forEach(u => {
      if (u.userId && u.userId.startsWith("RMAS")) {
        const num = parseInt(u.userId.replace("RMAS", ""), 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    });
    return "RMAS" + (maxId + 1);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordRegex = /^[A-Z][a-z]{4}\d{2}@$/;
    if (!passwordRegex.test(password)) {
      setError("Password must have 1 capital letter, 4 small letters, 2 digits, and end with @ (e.g. Abcde12@)");
      return;
    }
    setStep('signup_photo');
  };

  const handleFinalSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newId = generateUserId();
      const newUser = {
        id: newId,
        userId: newId,
        name: name,
        email: email,
        password: password,
        photoUrl: photoUrl,
        role: "INVESTOR" as any,
      };
              
      await dispatch({
        type: "ADD_USER",
        payload: newUser
      });
      
      setGeneratedUserId(newId);
      setStep('signup_success');
    } catch (err) {
      setError("Error creating account");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = state.users.find(u => 
        (u.userId === loginId || u.email === loginId || u.id === loginId) && 
        u.password === loginPassword
      );
      
      if (user) {
        onLogin(user.id);
      } else if (loginId.toLowerCase() === "admin" && loginPassword === "admin") {
        onLogin("admin");
      } else {
        setError("Invalid User ID or Password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const user = state.users.find(u => 
      u.userId === forgotId || u.email === forgotId || u.id === forgotId
    );
    
    if (user) {
      setRecoveredPassword(user.password);
      setError("");
    } else {
      setError("User not found");
      setRecoveredPassword("");
    }
  };

  const Footer = () => (
    <div className="mt-12 mb-4 w-full text-[#9b9b9b]">
      <div className="flex items-center space-x-2 mb-2">
        <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
          <path d="M 6,20 L 16,10 L 32,10 L 22,20 Z" fill="#9b9b9b"/>
          <path d="M 6,20 L 22,20 L 32,30 L 16,30 Z" fill="#7b7b7b"/>
        </svg>
        <span className="font-semibold text-[#666666] text-[13px] tracking-wide">RADHIKA</span>
      </div>
      <p className="text-[11px] leading-[1.6]">
        Radhika Broking Limited Member of ABDL, HPG, GVT - SAKSHI BANK Reg no RADHIKA0000038655, RMAS - HPG no. IN-RM-56-2026
      </p>
    </div>
  );

  if (isDesktop) return <DesktopLogin onLogin={onLogin} />;

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col md:items-center">
      <div className="w-full max-w-[480px] min-h-[100dvh] flex flex-col px-6 md:px-8 py-6 relative">
        
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col pt-12 md:pt-16">
            <div className="mb-10">
              <Logo className="scale-[1.3] origin-left" forceDarkText={true} />
            </div>
            
            <h1 className="text-[32px] md:text-[36px] font-medium text-[#444444] leading-[1.2] mb-12">
              Welcome to<br/>Kite by Radhika
            </h1>
            
            <div className="space-y-0 border-t border-[#eeeeee]">
              <button 
                onClick={() => setStep('signup_email')}
                className="w-full flex items-center justify-between py-5 text-[16px] text-[#444444] hover:bg-gray-50 transition-colors border-b border-[#eeeeee]"
              >
                <span>Open a free account</span>
                <User className="w-5 h-5 text-[#444444]" />
              </button>
              
              <button 
                onClick={() => setStep('login')}
                className="w-full flex items-center justify-between py-5 text-[16px] text-[#444444] hover:bg-gray-50 transition-colors border-b border-[#eeeeee]"
              >
                <span>Login to Kite</span>
                <LogIn className="w-5 h-5 text-[#444444]" />
              </button>
            </div>
            
            <div className="mt-auto">
              <Footer />
            </div>
          </div>
        )}

        {(step === 'signup_email' || step === 'signup_name' || step === 'signup_password' || step === 'signup_photo') && (
          <div className="flex-1 flex flex-col pt-2">
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setStep(step === 'signup_photo' ? 'signup_password' : step === 'signup_password' ? 'signup_name' : step === 'signup_name' ? 'signup_email' : 'welcome')} className="p-2 -ml-2 text-[#444444]">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Logo className="scale-75 origin-right" forceDarkText={true} />
            </div>
            
            <h1 className="text-[24px] font-medium text-[#444444] mb-8">
              {step === 'signup_email' && "Verify your details"}
              {step === 'signup_name' && "Verify your name"}
              {step === 'signup_password' && "Verify your password"}
              {step === 'signup_photo' && "Profile Photo"}
            </h1>
            
            <div className="flex justify-center mb-10">
               {/* Simple SVG Illustration Placeholder */}
               <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 80C60 60 80 100 100 80C120 60 140 20 160 40" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="100" cy="80" r="10" fill="#E2E8F0"/>
                <circle cx="140" cy="40" r="12" fill="#CBD5E1"/>
                <rect x="50" y="90" width="40" height="4" fill="#3B82F6"/>
                <rect x="150" y="50" width="30" height="4" fill="#3B82F6"/>
                <path d="M120 90 L120 110 M115 95 L120 90 L125 95" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <p className="text-[14px] text-[#444444] mb-4">
              {step === 'signup_email' && "Please enter the your email account"}
              {step === 'signup_name' && "Please enter the your full name"}
              {step === 'signup_password' && "Please enter the your 6-8 Digit Password set"}
              {step === 'signup_photo' && "Please upload your profile photo (Optional)"}
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (step === 'signup_email' && email) setStep('signup_name');
              else if (step === 'signup_name' && name) setStep('signup_password');
              else if (step === 'signup_password') handlePasswordSubmit(e);
              else if (step === 'signup_photo') handleFinalSignup(e);
            }} className="space-y-6">
              
              <div className="relative">
                {step === 'signup_email' && (
                  <input
                    type="email"
                    placeholder="Email ID"
                    className="w-full border border-[#e0e0e0] rounded py-3.5 px-4 text-[16px] !text-black dark:!text-black bg-white dark:bg-white focus:border-[#4184f3] focus:outline-none transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                )}
                {step === 'signup_name' && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full border border-[#e0e0e0] rounded py-3.5 px-4 text-[16px] !text-black dark:!text-black bg-white dark:bg-white focus:border-[#4184f3] focus:outline-none transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                )}
                {step === 'signup_password' && (
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full border border-[#e0e0e0] rounded py-3.5 px-4 text-[16px] !text-black dark:!text-black bg-white dark:bg-white focus:border-[#4184f3] focus:outline-none transition-colors"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    minLength={8}
                    maxLength={8}
                    required
                    autoFocus
                  />
                )}
                {step === 'signup_photo' && (
                  <div className="flex flex-col items-center gap-4">
                     <label className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border border-gray-300">
                        {photoUrl ? (
                           <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-gray-400 text-sm font-medium uppercase tracking-wider text-[11px]">Upload</span>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                           if (e.target.files && e.target.files.length > 0) {
                             const reader = new FileReader();
                             reader.onload = () => setPhotoUrl(reader.result?.toString() || "");
                             reader.readAsDataURL(e.target.files[0]);
                           }
                        }} />
                     </label>
                  </div>
                )}
              </div>

              {error && <div className="text-[#DF514C] dark:text-[#E25F5B] text-[13px]">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4184f3] hover:bg-[#3367d6] text-white py-3.5 rounded text-[15px] font-medium transition-colors uppercase tracking-wide flex items-center justify-center disabled:opacity-100 disabled:pointer-events-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
              </button>
            </form>
            
            <div className="mt-auto">
              <Footer />
            </div>
          </div>
        )}

        {step === 'signup_success' && (
          <div className="flex-1 flex flex-col justify-center pb-20">
            <div className="w-full animate-fade-in text-center flex flex-col items-center">
              <CheckCircle2 className="w-20 h-20 text-[#4184f3] mb-6" />
              <h1 className="text-[28px] font-medium text-[#444444] mb-2">
                Successfully
              </h1>
              <h2 className="text-[24px] font-medium text-[#444444] mb-4">
                {name}
              </h2>
              <p className="text-[16px] text-[#666] mb-10">
                ID number: <span className="font-bold text-[#444444]">{generatedUserId}</span>
              </p>
              
              <button
                onClick={() => onLogin(generatedUserId)}
                className="w-full bg-[#4184f3] hover:bg-[#3367d6] text-white py-3.5 rounded text-[15px] font-medium transition-colors"
              >
                Welcome to Kite page
              </button>
            </div>
          </div>
        )}

        {step === 'login' && (
          <div className="flex-1 flex flex-col pt-2">
            <div className="flex items-center justify-between mb-12">
              <button onClick={() => setStep('welcome')} className="p-2 -ml-2 text-[#444444]">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Logo className="scale-75 origin-right" forceDarkText={true} />
            </div>
            
            <h1 className="text-[28px] font-medium text-[#444444] mb-8">
              Login
            </h1>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Email or User ID"
                  className="w-full border border-[#e0e0e0] rounded py-3.5 px-4 text-[16px] !text-black dark:!text-black bg-white dark:bg-white focus:border-[#4184f3] focus:outline-none transition-colors"
                  value={loginId}
                  onChange={(e) => { setLoginId(e.target.value); setError(""); }}
                  required
                  autoFocus
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9b9b]" />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full border border-[#e0e0e0] rounded py-3.5 px-4 pr-12 text-[16px] !text-black dark:!text-black bg-white dark:bg-white focus:border-[#4184f3] focus:outline-none transition-colors"
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setError(""); }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9b9b] hover:text-[#444444]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && <div className="text-[#DF514C] dark:text-[#E25F5B] text-[13px]">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4184f3] hover:bg-[#3367d6] text-white py-3.5 rounded text-[15px] font-medium transition-colors uppercase tracking-wide flex items-center justify-center disabled:opacity-100 disabled:pointer-events-none mt-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "LOGIN"}
              </button>
            </form>

            <div className="text-center mt-8">
              <button 
                onClick={() => setStep('forgot_password')} 
                className="text-[#4184f3] hover:underline text-[14px]"
              >
                Forgot user ID or password?
              </button>
            </div>
            
            <div className="mt-auto">
              <Footer />
            </div>
          </div>
        )}

        {step === 'forgot_password' && (
          <div className="flex-1 flex flex-col pt-2">
            <div className="flex items-center justify-between mb-12">
              <button onClick={() => {setStep('login'); setRecoveredPassword(""); setForgotId(""); setError("");}} className="p-2 -ml-2 text-[#444444]">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Logo className="scale-75 origin-right" forceDarkText={true} />
            </div>
            
            <h1 className="text-[28px] font-medium text-[#444444] mb-8">
              Recover Password
            </h1>
            
            <form onSubmit={handleRecoverPassword} className="space-y-5">
              <p className="text-[14px] text-[#666]">Enter your Email or User ID to recover your password.</p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Email or User ID"
                  className="w-full border border-[#e0e0e0] rounded py-3.5 px-4 text-[16px] !text-black dark:!text-black bg-white dark:bg-white focus:border-[#4184f3] focus:outline-none transition-colors"
                  value={forgotId}
                  onChange={(e) => { setForgotId(e.target.value); setError(""); setRecoveredPassword(""); }}
                  required
                  autoFocus
                />
              </div>

              {error && <div className="text-[#DF514C] dark:text-[#E25F5B] text-[13px]">{error}</div>}

              {recoveredPassword && (
                <div className="text-[13px] text-[#444444] mt-2 border border-[#e0e0e0] rounded px-3 py-2 bg-gray-50 dark:bg-gray-50">
                  Your password is: <span className="font-semibold">{recoveredPassword}</span>
                </div>
              )}

              {!recoveredPassword ? (
                <button
                  type="submit"
                  className="w-full bg-[#4184f3] hover:bg-[#3367d6] text-white py-3.5 rounded text-[15px] font-medium transition-colors uppercase tracking-wide mt-2"
                >
                  Show Password
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLoginId(forgotId);
                    setLoginPassword(recoveredPassword);
                    setStep('login');
                    setRecoveredPassword("");
                    setForgotId("");
                  }}
                  className="w-full bg-[#4184f3] hover:bg-[#3367d6] text-white py-3.5 rounded text-[15px] font-medium transition-colors uppercase tracking-wide mt-2"
                >
                  direct page
                </button>
              )}
            </form>
            
            <div className="mt-auto">
              <Footer />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
