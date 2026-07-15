import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { motion } from "motion/react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, googleSignIn, cachedAccessToken } from "./firebase";
import { Business, Investor, Investment, GlobalSettings, AppUser } from "../types";
import { syncToSheets, fetchFromSheets } from "./googleSheets";
import { io } from "socket.io-client";

// Initialize socket connection
const socket = io(window.location.origin, {
  path: "/socket.io"
});

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

export type Action = (
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
  | { type: "CLEAR_ERROR" }
  | { type: "RESTORE_STATE"; payload: Partial<AppState> }
) & { fromSocket?: boolean };

const AppContext = createContext<
  | {
      state: AppState;
      dispatch: (action: Action) => Promise<void>;
    }
  | undefined
>(undefined);

let syncTimeout: any;
let lastLocalUpdate = 0;
let lastSocketUpdate = 0;

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
    changes.forEach((change) => {
      const data = change.doc.data() as T;
      const id = data.id || change.doc.id;
      if (change.type === "added") {
        const idx = newList.findIndex((item) => (item.id || (item as any).uid) === id);
        if (idx === -1) {
          newList.push(data);
        } else {
          newList[idx] = data;
        }
      }
      if (change.type === "modified") {
        newList = newList.map((item) => ((item.id || (item as any).uid) === id ? data : item));
      }
      if (change.type === "removed") {
        newList = newList.filter((item) => (item.id || (item as any).uid) !== id);
      }
    });
    return newList;
  };

  useEffect(() => {
    const handleSocketAction = (action: Action) => {
      // Apply the action received from the socket
      dispatch({ ...action, fromSocket: true });
    };

    socket.on("receive_action", handleSocketAction);
    
    return () => {
      socket.off("receive_action", handleSocketAction);
    };
  }, []);

  useEffect(() => {
    const handleQuotaError = async (error: any) => {
      console.warn("Firestore error:", error.message);
      try {
        const sheetData = await fetchFromSheets();
        setState((s) => ({
          ...s,
          businesses: sheetData?.businesses?.length ? sheetData.businesses : s.businesses,
          investors: sheetData?.investors?.length ? sheetData.investors : s.investors,
          investments: sheetData?.investments?.length ? sheetData.investments : s.investments,
          users: sheetData?.users?.length ? sheetData.users : s.users,
          settings: sheetData?.settings ? sheetData.settings : s.settings,
          loading: false,
          error: "Database daily limit reached! App is running in Google Sheets backup mode.",
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Database daily limit reached! Changes will only sync via Google Sheets. Sign in to sync your device.",
        }));
        localStorage.removeItem("hideErrorBanner");
      }
    };

    const unsubBusinesses = onSnapshot(collection(db, "businesses"), (snap) => {
      setState((s) => ({
        ...s,
        businesses: applyChanges(s.businesses, snap.docChanges()),
        loading: false,
      }));
    }, handleQuotaError);

    const unsubInvestors = onSnapshot(collection(db, "investors"), (snap) => {
      setState((s) => ({
        ...s,
        investors: applyChanges(s.investors, snap.docChanges()),
      }));
    }, handleQuotaError);

    const unsubInvestments = onSnapshot(collection(db, "investments"), (snap) => {
      setState((s) => ({
        ...s,
        investments: applyChanges(s.investments, snap.docChanges()),
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
        users: applyChanges(s.users, snap.docChanges()),
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
    
    // Broadcast action to other clients if it's not from socket
    if (!action.fromSocket && socket.connected) {
      socket.emit("dispatch_action", action);
    }
    
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
        case "RESTORE_STATE":
          if (action.payload.businesses) newState.businesses = action.payload.businesses;
          if (action.payload.investors) newState.investors = action.payload.investors;
          if (action.payload.investments) newState.investments = action.payload.investments;
          if (action.payload.users) newState.users = action.payload.users;
          if (action.payload.settings) newState.settings = action.payload.settings;
          break;
      }
      updatedState = newState;
      return newState;
    });

    try {
      if (action.fromSocket) {
        return; // Skip Firebase update if this is a mirrored action from another client
      }

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
    } finally {
      // We set lastLocalUpdate here to trigger the syncToSheets useEffect
      if (!action.fromSocket) {
        lastLocalUpdate = Date.now();
      } else {
        lastSocketUpdate = Date.now();
      }
    }
  };

  // Sync to sheets when state changes locally
  useEffect(() => {
    // Check if the change was recently triggered by a local dispatch
    if (Date.now() - lastLocalUpdate < 2000 && !state.loading) {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        syncToSheets(state).catch((e) => console.warn("Sheets sync failed", e));
      }, 3000);
    }
  }, [state]);

  useEffect(() => {
    const handleGoogleAuthSuccess = async (e: any) => {
      const action = e.detail?.action;
      if (action === 'sync') {
        try {
          await syncToSheets(state);
          alert("Successfully synced data to Google Account (Google Sheets backup).");
        } catch (err: any) {
          alert(`Failed to sync to Google Account: ${err.message || String(err)}`);
        }
      } else if (action === 'restore') {
        try {
          const sheetData = await fetchFromSheets();
          if (sheetData) {
            dispatch({ type: "RESTORE_STATE", payload: sheetData });
            alert("Successfully restored data from Google Account.");
          } else {
            alert("No backup data found in Google Account.");
          }
        } catch (err: any) {
          alert(`Failed to restore from Google Account: ${err.message || String(err)}`);
        }
      }
    };
    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess);
    return () => window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess);
  }, [state, dispatch]);

  // Poll Google Sheets if logged in via Google
  useEffect(() => {
    let pollingInterval: any;
    
    const checkAndFetch = async () => {
      // Skip if we recently dispatched a local update (wait 15s to allow sync to settle)
      if (Date.now() - lastLocalUpdate < 15000 || Date.now() - lastSocketUpdate < 15000) return;
      
      try {
        const sheetData = await fetchFromSheets();
        // Ensure no local or socket updates happened while we were fetching
        if (sheetData && Date.now() - lastLocalUpdate >= 15000 && Date.now() - lastSocketUpdate >= 15000) {
          setState((s) => {
            const newBusinesses = sheetData.businesses?.length ? sheetData.businesses : s.businesses;
            const newInvestors = sheetData.investors?.length ? sheetData.investors : s.investors;
            const newInvestments = sheetData.investments?.length ? sheetData.investments : s.investments;
            const newUsers = sheetData.users?.length ? sheetData.users : s.users;
            const newSettings = sheetData.settings ? sheetData.settings : s.settings;
            
            if (
              JSON.stringify(newBusinesses) === JSON.stringify(s.businesses) &&
              JSON.stringify(newInvestors) === JSON.stringify(s.investors) &&
              JSON.stringify(newInvestments) === JSON.stringify(s.investments) &&
              JSON.stringify(newUsers) === JSON.stringify(s.users) &&
              JSON.stringify(newSettings) === JSON.stringify(s.settings)
            ) {
              return s; // No changes
            }

            return {
              ...s,
              businesses: newBusinesses,
              investors: newInvestors,
              investments: newInvestments,
              users: newUsers,
              settings: newSettings,
              loading: false,
              error: undefined
            };
          });
        }
      } catch (e: any) {
        if (e.message?.includes("no access token") || e.message?.includes("Failed to read from sheets")) {
           setState(s => {
              if (s.error && (s.error.includes("Database daily limit reached") || s.error.includes("Google Sheets Sync paused"))) {
                localStorage.removeItem("hideErrorBanner");
                return {
                   ...s, 
                   error: "Google Sheets Sync paused. Sign in to sync your device."
                };
              }
              return s;
           });
        }
      }
    };

    const unsubAuth = auth.onAuthStateChanged((user) => {
      checkAndFetch();
      pollingInterval = setInterval(checkAndFetch, 5000);
    });

    return () => {
      unsubAuth();
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);

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
