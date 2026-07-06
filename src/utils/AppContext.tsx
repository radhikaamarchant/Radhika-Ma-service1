import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { motion } from "motion/react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Business, Investor, Investment, GlobalSettings, AppUser } from "../types";
import { MOCK_BUSINESSES, MOCK_INVESTORS, MOCK_INVESTMENTS } from "./mockData";

export interface AppState {
  businesses: Business[];
  investors: Investor[];
  investments: Investment[];
  users: AppUser[];
  settings: GlobalSettings | null;
  loading: boolean;
  error?: string;
  currentUser: AppUser | null;
}

type Action =
  | { type: "ADD_BUSINESS"; payload: Business }
  | { type: "UPDATE_BUSINESS_STATUS"; payload: { id: string; status: Business["status"] } }
  | { type: "UPDATE_BUSINESS"; payload: Business }
  | { type: "DELETE_BUSINESS"; payload: string }
  | { type: "ADD_INVESTOR"; payload: Investor }
  | { type: "UPDATE_INVESTOR"; payload: Investor }
  | { type: "DELETE_INVESTOR"; payload: string }
  | { type: "ADD_INVESTMENT"; payload: Investment }
  | { type: "UPDATE_INVESTMENT"; payload: Investment }
  | { type: "DELETE_INVESTMENT"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: GlobalSettings }
  | { type: "SET_CURRENT_USER"; payload: AppUser | null }
  | { type: "CLEAR_ERROR" };

const AppContext = createContext<
  | {
      state: AppState;
      dispatch: (action: Action) => Promise<void>;
    }
  | undefined
>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    businesses: [],
    investors: [],
    investments: [],
    users: [],
    settings: null,
    loading: true,
    currentUser: null,
  });

  useEffect(() => {
    const handleQuotaError = (error: any) => {
      console.warn("Firestore error:", error.message);
      setState((s) => ({
        ...s,
        businesses: s.businesses.length ? s.businesses : MOCK_BUSINESSES,
        investors: s.investors.length ? s.investors : MOCK_INVESTORS,
        investments: s.investments.length ? s.investments : MOCK_INVESTMENTS,
        loading: false,
        error: "Firestore quota exceeded. Switched to offline mock data mode.",
      }));
    };

    const unsubBusinesses = onSnapshot(collection(db, "businesses"), (snap) => {
      setState((s) => ({
        ...s,
        businesses: snap.docs.map((d) => d.data() as Business),
        loading: false,
      }));
    }, handleQuotaError);

    const unsubInvestors = onSnapshot(collection(db, "investors"), (snap) => {
      setState((s) => ({
        ...s,
        investors: snap.docs.map((d) => d.data() as Investor),
      }));
    }, handleQuotaError);

    const unsubInvestments = onSnapshot(collection(db, "investments"), (snap) => {
      setState((s) => ({
        ...s,
        investments: snap.docs.map((d) => d.data() as Investment),
      }));
    }, handleQuotaError);

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setState((s) => ({
          ...s,
          settings: docSnap.data() as GlobalSettings,
        }));
      }
    }, handleQuotaError);

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setState((s) => ({
        ...s,
        users: snap.docs.map((d) => d.data() as AppUser),
      }));
    }, handleQuotaError);

    return () => {
      unsubBusinesses();
      unsubInvestors();
      unsubInvestments();
      unsubSettings();
      unsubUsers();
    };
  }, []);

  const dispatch = async (action: Action) => {
    let updatedState: AppState | null = null;
    
    // Optimistic Update so the app doesn't freeze/stop if Firebase is down
    setState((prevState) => {
      let newState = { ...prevState };
      switch (action.type) {
        case "ADD_BUSINESS":
          newState.businesses = [...newState.businesses, action.payload];
          break;
        case "UPDATE_BUSINESS_STATUS":
          newState.businesses = newState.businesses.map((b) =>
            b.id === action.payload.id ? { ...b, status: action.payload.status } : b
          );
          break;
        case "UPDATE_BUSINESS":
          newState.businesses = newState.businesses.map((b) =>
            b.id === action.payload.id ? action.payload : b
          );
          break;
        case "DELETE_BUSINESS":
          newState.businesses = newState.businesses.filter((b) => b.id !== action.payload);
          newState.investments = newState.investments.filter((i) => i.businessId !== action.payload);
          break;
        case "ADD_INVESTOR":
          newState.investors = [...newState.investors, action.payload];
          break;
        case "UPDATE_INVESTOR":
          newState.investors = newState.investors.map((i) =>
            i.id === action.payload.id ? action.payload : i
          );
          break;
        case "DELETE_INVESTOR":
          newState.investors = newState.investors.filter((i) => i.id !== action.payload);
          newState.investments = newState.investments.filter((i) => i.investorId !== action.payload);
          break;
        case "ADD_INVESTMENT":
          newState.investments = [...newState.investments, action.payload];
          break;
        case "UPDATE_INVESTMENT":
          newState.investments = newState.investments.map((i) =>
            i.id === action.payload.id ? action.payload : i
          );
          break;
        case "DELETE_INVESTMENT":
          newState.investments = newState.investments.filter((i) => i.id !== action.payload);
          break;
        case "UPDATE_SETTINGS":
          newState.settings = action.payload;
          break;
        case "SET_CURRENT_USER":
          newState.currentUser = action.payload;
          break;
        case "CLEAR_ERROR":
          newState.error = undefined;
          break;
      }
      updatedState = newState;
      return newState;
    });

    try {
      const cleanObj = (obj: any): any => {
        if (obj === null || typeof obj !== "object") {
          if (typeof obj === "number" && Number.isNaN(obj)) return 0;
          return obj;
        }
        if (Array.isArray(obj)) return obj.map(cleanObj);
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, cleanObj(v)])
        );
      };

      const payloadWithTimestamp =
        "payload" in action && action.payload && typeof action.payload === "object"
          ? cleanObj({ ...action.payload, updatedAt: serverTimestamp() })
          : "payload" in action ? action.payload : undefined;

      switch (action.type) {
        case "ADD_BUSINESS":
          await setDoc(doc(db, "businesses", action.payload.id), payloadWithTimestamp);
          break;
        case "UPDATE_BUSINESS_STATUS":
          await updateDoc(doc(db, "businesses", action.payload.id), {
            status: action.payload.status,
            updatedAt: serverTimestamp(),
          });
          break;
        case "UPDATE_BUSINESS":
          await setDoc(doc(db, "businesses", action.payload.id), payloadWithTimestamp);
          break;
        case "DELETE_BUSINESS": {
          const bizInvestments = state.investments.filter((i) => i.businessId === action.payload);
          await Promise.all(bizInvestments.map((inv) => deleteDoc(doc(db, "investments", inv.id))));
          await deleteDoc(doc(db, "businesses", action.payload));
          break;
        }
        case "ADD_INVESTOR":
          await setDoc(doc(db, "investors", action.payload.id), payloadWithTimestamp);
          break;
        case "UPDATE_INVESTOR":
          await updateDoc(doc(db, "investors", action.payload.id), payloadWithTimestamp);
          break;
        case "DELETE_INVESTOR": {
          const invInvestments = state.investments.filter((i) => i.investorId === action.payload);
          await Promise.all(invInvestments.map((inv) => deleteDoc(doc(db, "investments", inv.id))));
          await deleteDoc(doc(db, "investors", action.payload));
          break;
        }
        case "ADD_INVESTMENT":
          await setDoc(doc(db, "investments", action.payload.id), payloadWithTimestamp);
          break;
        case "UPDATE_INVESTMENT":
          await setDoc(doc(db, "investments", action.payload.id), payloadWithTimestamp);
          break;
        case "DELETE_INVESTMENT":
          await deleteDoc(doc(db, "investments", action.payload));
          break;
        case "UPDATE_SETTINGS":
          await setDoc(doc(db, "settings", "global"), payloadWithTimestamp);
          break;
        case "SET_CURRENT_USER":
          if (action.payload) {
            await setDoc(doc(db, "users", action.payload.id), action.payload);
          }
          break;
      }
    } catch (err) {
      console.warn("Error dispatching action to Firebase (might be quota exceeded):", err);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {state.loading ? (
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
      ) : (
        <>
          {state.error && localStorage.getItem("hideErrorBanner") !== "true" && (
            <div className="bg-red-500/10 text-red-500 p-2 text-center text-xs w-full fixed top-0 z-50 flex items-center justify-center">
              <span>{state.error}</span>
              <button 
                onClick={() => {
                  localStorage.setItem("hideErrorBanner", "true");
                  dispatch({ type: "CLEAR_ERROR" } as any); // Force re-render or handle differently, but simplest is just window reload or rely on state.
                }} 
                className="ml-4 hover:opacity-70 text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}
          {children}
        </>
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
