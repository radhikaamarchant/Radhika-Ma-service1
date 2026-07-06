import { useEffect, useState, ReactNode } from "react";
import { motion } from "motion/react";
import { initAuth, googleSignIn, db } from "../utils/firebase";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAppContext } from "../utils/AppContext";
import { AppUser } from "../types";

export function AuthWrapper({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [roleSelection, setRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppUser["role"] | null>(null);
  const [roleCode, setRoleCode] = useState("");
  const [error, setError] = useState("");
  
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const unsubscribe = initAuth(
      async (user: User) => {
        if (!user.isAnonymous) {
          setAuthUser(user);
          // Check if user exists in db
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              dispatch({ type: "SET_CURRENT_USER", payload: userDoc.data() as AppUser });
              setLoading(false);
            } else {
              setRoleSelection(true);
              setLoading(false);
            }
          } catch (error) {
            console.warn("Firestore quota error in auth:", error.message);
            // Graceful fallback to mock user
            dispatch({ 
              type: "SET_CURRENT_USER", 
              payload: { id: user.uid, name: user.displayName || "Mock User", email: user.email || "", role: "CEO", fund: 0 } as AppUser 
            });
            setLoading(false);
          }
        } else {
          // It's an anonymous user, we force them to sign in
          setLoading(false);
        }
      }
    );

    const t = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      clearTimeout(t);
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setAuthUser(result.user);
        try {
          const userDoc = await getDoc(doc(db, "users", result.user.uid));
          if (userDoc.exists()) {
            dispatch({ type: "SET_CURRENT_USER", payload: userDoc.data() as AppUser });
          } else {
            setRoleSelection(true);
          }
        } catch (error) {
          console.warn("Firestore quota error in login:", error.message);
          dispatch({ type: "SET_CURRENT_USER", payload: { id: result.user.uid, name: result.user.displayName || "Mock User", email: result.user.email || "", role: "CEO", fund: 0 } as AppUser });
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSubmit = async () => {
    if (!authUser || !selectedRole) return;
    setError("");

    if (selectedRole === "CEO" && roleCode !== "445677") {
      setError("Invalid CEO Code");
      return;
    }
    if (selectedRole === "EMPLOYEE" && roleCode !== "789755") {
      setError("Invalid Employee Code");
      return;
    }

    const newUser: AppUser = {
      id: authUser.uid,
      name: authUser.displayName || "Unknown User",
      email: authUser.email || "",
      role: selectedRole,
      fund: 0,
    };

    try {
      await setDoc(doc(db, "users", authUser.uid), newUser);
      dispatch({ type: "SET_CURRENT_USER", payload: newUser });
      setRoleSelection(false);
    } catch (err) {
      console.error(err);
      setError("Failed to assign role.");
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex h-full w-full items-center justify-center bg-white dark:bg-kite-bg z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3 md:gap-5"
        >
          <motion.img 
            src="/logo.svg" 
            alt="Radhika" 
            className="w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-sm"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-black dark:text-white">
            Radhika
          </h1>
        </motion.div>
      </motion.div>
    );
  }

  // Kite-like Login UI
  if (!state.currentUser && !roleSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] p-4 font-sans">
        <div className="max-w-[400px] w-full flex flex-col items-center">
          <div className="mb-8 flex items-center space-x-2">
            <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0L93.3013 25V75L50 100L6.69873 75V25L50 0Z" fill="#ff5722"/>
              <path d="M50 20L75.9808 35V65L50 80L24.0192 65V35L50 20Z" fill="#fff"/>
              <path d="M50 40L62.9904 47.5V62.5L50 70L37.0096 62.5V47.5L50 40Z" fill="#ff5722"/>
            </svg>
            <h1 className="text-3xl font-bold text-[#424242] dark:text-[#e0e0e0] tracking-tight">Kite</h1>
          </div>
          
          <div className="bg-white dark:bg-[#1e1e1e] w-full p-8 rounded-md shadow-sm border border-gray-200 dark:border-[#2a2a2a]">
            <h2 className="text-xl font-medium text-[#424242] dark:text-[#e0e0e0] mb-6 text-center">Login to Kite</h2>
            
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-[#1a1a1a] text-[#424242] dark:text-[#e0e0e0] border border-gray-300 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors py-3 px-4 rounded"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span className="font-medium">Sign in with Google</span>
            </button>
            
            {error && <p className="text-[#ff5722] text-sm mt-4 text-center">{error}</p>}
          </div>
          
          <div className="mt-8 text-center text-sm text-[#9b9b9b]">
            <p>Don't have an account? Connect with Google above to create one.</p>
          </div>
        </div>
      </div>
    );
  }

  if (roleSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] p-4 font-sans">
        <div className="max-w-[400px] w-full">
          <div className="mb-8 flex items-center justify-center space-x-2">
            <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0L93.3013 25V75L50 100L6.69873 75V25L50 0Z" fill="#ff5722"/>
              <path d="M50 20L75.9808 35V65L50 80L24.0192 65V35L50 20Z" fill="#fff"/>
              <path d="M50 40L62.9904 47.5V62.5L50 70L37.0096 62.5V47.5L50 40Z" fill="#ff5722"/>
            </svg>
            <h1 className="text-3xl font-bold text-[#424242] dark:text-[#e0e0e0] tracking-tight">Kite</h1>
          </div>
          
          <div className="bg-white dark:bg-[#1e1e1e] w-full p-8 rounded-md shadow-sm border border-gray-200 dark:border-[#2a2a2a]">
            <h2 className="text-xl font-medium text-[#424242] dark:text-[#e0e0e0] mb-6 text-center">Select Your Role</h2>
            
            <div className="space-y-3 mb-6">
              {(["CEO", "EMPLOYEE", "BUSINESS_OWNER", "INVESTOR"] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left px-4 py-3 border rounded transition-colors ${
                    selectedRole === role 
                      ? "border-[#ff5722] bg-[#ff5722]/10 text-[#ff5722]" 
                      : "border-gray-200 dark:border-[#333] text-[#424242] dark:text-[#a0a0a0] hover:border-gray-300 dark:hover:border-[#444]"
                  }`}
                >
                  <span className="font-medium">{role.replace("_", " ")}</span>
                </button>
              ))}
            </div>

            {(selectedRole === "CEO" || selectedRole === "EMPLOYEE") && (
              <div className="mb-6">
                <label className="block text-sm text-[#424242] dark:text-[#a0a0a0] mb-1">Access Code</label>
                <input
                  type="password"
                  value={roleCode}
                  onChange={e => setRoleCode(e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded px-3 py-2 text-[#424242] dark:text-[#e0e0e0] focus:outline-none focus:border-[#ff5722]"
                  placeholder="Enter access code"
                />
              </div>
            )}

            <button
              onClick={handleRoleSubmit}
              disabled={!selectedRole || ((selectedRole === "CEO" || selectedRole === "EMPLOYEE") && !roleCode)}
              className="w-full bg-[#ff5722] hover:bg-[#e64a19] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded transition-colors"
            >
              Continue
            </button>
            
            {error && <p className="text-[#ff5722] text-sm mt-4 text-center">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
