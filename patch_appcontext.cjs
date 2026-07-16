const fs = require('fs');

const code = `import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
        return s.businesses !== newBusinesses ? { ...s, businesses: newBusinesses, loading: false } : { ...s, loading: false };
      });
    }, handleQuotaError);

    const unsubInvestors = onSnapshot(collection(db, "investors"), (snap) => {
      if (!isMounted) return;
      setState((s) => {
        const newInvestors = applyChanges(s.investors, snap.docChanges());
        return s.investors !== newInvestors ? { ...s, investors: newInvestors } : s;
      });
    }, handleQuotaError);

    const unsubInvestments = onSnapshot(collection(db, "investments"), (snap) => {
      if (!isMounted) return;
      setState((s) => {
        const newInvestments = applyChanges(s.investments, snap.docChanges());
        return s.investments !== newInvestments ? { ...s, investments: newInvestments } : s;
      });
    }, handleQuotaError);

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (!isMounted) return;
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalSettings;
        setState((s) => {
          return JSON.stringify(s.settings) !== JSON.stringify(data) ? { ...s, settings: data } : s;
        });
      }
    }, handleQuotaError);

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      if (!isMounted) return;
      setState((s) => {
        const newUsers = applyChanges(s.users, snap.docChanges());
        return s.users !== newUsers ? { ...s, users: newUsers } : s;
      });
    }, handleQuotaError);

    return () => {
      isMounted = false;
      unsubBusinesses();
      unsubInvestors();
      unsubInvestments();
      unsubSettings();
      unsubUsers();
    };
  }, []);

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
`;

fs.writeFileSync('src/utils/AppContext.tsx', code);
