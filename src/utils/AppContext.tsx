import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { motion } from "motion/react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";
import { Business, Investor, Investment, GlobalSettings, AppUser } from "../types";

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

  const applyChanges = <T extends { id?: string }>(currentList: T[], changes: any[]): T[] => {
    let newList = [...currentList];
    let hasChanges = false;
    changes.forEach((change) => {
      const data = change.doc.data() as T;
      const id = data.id || change.doc.id;
      if (change.type === "added") {
        const idx = newList.findIndex((item) => (item.id || (item as any).uid) === id);
        if (idx === -1) {
          newList.push(data);
          hasChanges = true;
        } else if (JSON.stringify(newList[idx]) !== JSON.stringify(data)) {
          newList[idx] = data;
          hasChanges = true;
        }
      }
      if (change.type === "modified") {
        const idx = newList.findIndex((item) => (item.id || (item as any).uid) === id);
        if (idx !== -1 && JSON.stringify(newList[idx]) !== JSON.stringify(data)) {
          newList[idx] = data;
          hasChanges = true;
        } else if (idx === -1) {
          newList.push(data);
          hasChanges = true;
        }
      }
      if (change.type === "removed") {
        const idx = newList.findIndex((item) => (item.id || (item as any).uid) === id);
        if (idx !== -1) {
          newList.splice(idx, 1);
          hasChanges = true;
        }
      }
    });
    return hasChanges ? newList : currentList; // Only return new array reference if something actually changed
  };

  useEffect(() => {
    let isMounted = true;
    
    const handleQuotaError = (error: any) => {
      console.warn("Firestore error:", error.message);
      if (isMounted) {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Database daily limit reached! Please try again tomorrow.",
        }));
      }
    };

    // Use onSnapshot which will utilize the local cache from persistentLocalCache in firebase.ts
    const unsubBusinesses = onSnapshot(collection(db, "businesses"), (snap) => {
      if (!isMounted) return;
      setState((s) => {
        const newBusinesses = applyChanges(s.businesses, snap.docChanges());
        if (s.businesses !== newBusinesses || s.loading !== false) {
          return { ...s, businesses: newBusinesses, loading: false };
        }
        return s;
      });
    }, handleQuotaError);

    const unsubInvestors = onSnapshot(collection(db, "investors"), (snap) => {
      if (!isMounted) return;
      setState((s) => {
        const newInvestors = applyChanges(s.investors, snap.docChanges());
        if (s.investors !== newInvestors) {
          return { ...s, investors: newInvestors };
        }
        return s;
      });
    }, handleQuotaError);

    const unsubInvestments = onSnapshot(collection(db, "investments"), (snap) => {
      if (!isMounted) return;
      setState((s) => {
        const newInvestments = applyChanges(s.investments, snap.docChanges());
        if (s.investments !== newInvestments) {
          return { ...s, investments: newInvestments };
        }
        return s;
      });
    }, handleQuotaError);

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (!isMounted) return;
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalSettings;
        setState((s) => {
          if (JSON.stringify(s.settings) !== JSON.stringify(data)) {
            return { ...s, settings: data };
          }
          return s;
        });
      }
    }, handleQuotaError);

    return () => {
      isMounted = false;
      unsubBusinesses();
      unsubInvestors();
      unsubInvestments();
      unsubSettings();
    };
  }, []); // Only run once on mount

  const dispatch = async (action: Action) => {
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
        <div className="fixed inset-0 flex h-full w-full items-center justify-center bg-white dark:bg-kite-bg z-50">
          <div className="flex flex-col items-center justify-center gap-6 md:gap-8">
            <div className="flex items-center gap-3 md:gap-5">
              <img 
                src="/logo.svg" 
                alt="Radhika" 
                className="w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-sm"
              />
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-black dark:text-white">
                Radhika
              </h1>
            </div>
            
            {/* Mobile Progress Bar (hidden on md) */}
            <div className="md:hidden w-40 h-[2px] bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              <div className="h-full bg-kite-blue w-full origin-left animate-progress-indeterminate"></div>
            </div>

            {/* Desktop Dots (hidden on sm) */}
            <div className="hidden md:flex items-center justify-center space-x-2.5">
              <div className="w-2.5 h-2.5 bg-kite-text dark:bg-kite-text-light rounded-full animate-dot-1"></div>
              <div className="w-2.5 h-2.5 bg-kite-text dark:bg-kite-text-light rounded-full animate-dot-2"></div>
              <div className="w-2.5 h-2.5 bg-kite-text dark:bg-kite-text-light rounded-full animate-dot-3"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
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
