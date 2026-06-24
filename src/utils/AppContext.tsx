import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Business, Investor, Investment, GlobalSettings } from '../types';

interface AppState {
 businesses: Business[];
 investors: Investor[];
 investments: Investment[];
 settings: GlobalSettings | null;
 loading: boolean;
}

type Action = | { type: 'ADD_BUSINESS'; payload: Business }
 | { type: 'UPDATE_BUSINESS_STATUS'; payload: { id: string; status: Business['status'] } }
 | { type: 'UPDATE_BUSINESS'; payload: Business }
 | { type: 'DELETE_BUSINESS'; payload: string }
 | { type: 'ADD_INVESTOR'; payload: Investor }
 | { type: 'UPDATE_INVESTOR'; payload: Investor }
 | { type: 'DELETE_INVESTOR'; payload: string }
 | { type: 'ADD_INVESTMENT'; payload: Investment }
 | { type: 'UPDATE_INVESTMENT'; payload: Investment }
 | { type: 'DELETE_INVESTMENT'; payload: string }
 | { type: 'UPDATE_SETTINGS'; payload: GlobalSettings };

const AppContext = createContext<{
 state: AppState;
 dispatch: (action: Action) => Promise<void>;
} | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
 const [state, setState] = useState<AppState>({
 businesses: [],
 investors: [],
 investments: [],
 settings: null,
 loading: true
 });

 useEffect(() => {
 const unsubBusinesses = onSnapshot(collection(db, 'businesses'), (snap) => {
 setState(s => ({ ...s, businesses: snap.docs.map(d => d.data() as Business) }));
 });
 const unsubInvestors = onSnapshot(collection(db, 'investors'), (snap) => {
 setState(s => ({ ...s, investors: snap.docs.map(d => d.data() as Investor) }));
 });
 const unsubInvestments = onSnapshot(collection(db, 'investments'), (snap) => {
 setState(s => ({ ...s, investments: snap.docs.map(d => d.data() as Investment) }));
 });
 const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
   if (docSnap.exists()) {
     setState(s => ({ ...s, settings: docSnap.data() as GlobalSettings }));
   }
 });

 setState(s => ({ ...s, loading: false }));

 return () => {
 unsubBusinesses();
 unsubInvestors();
 unsubInvestments();
 unsubSettings();
 };
 }, []);

 const dispatch = async (action: Action) => {
 try {
 const cleanObj = (obj: any): any => {
   if (obj === null || typeof obj !== 'object') {
     if (typeof obj === 'number' && Number.isNaN(obj)) return 0;
     return obj;
   }
   if (Array.isArray(obj)) return obj.map(cleanObj);
   return Object.fromEntries(
     Object.entries(obj)
       .filter(([_, v]) => v !== undefined)
       .map(([k, v]) => [k, cleanObj(v)])
   );
 };

 // Removed optimistic updates
 const payloadWithTimestamp = action.payload && typeof action.payload === 'object' 
   ? cleanObj({ ...action.payload, updatedAt: serverTimestamp() })
   : action.payload;

 switch (action.type) {
 case 'ADD_BUSINESS':
 await setDoc(doc(db, 'businesses', action.payload.id), payloadWithTimestamp);
 break;
 case 'UPDATE_BUSINESS_STATUS':
 await updateDoc(doc(db, 'businesses', action.payload.id), { status: action.payload.status, updatedAt: serverTimestamp() });
 break;
 case 'UPDATE_BUSINESS':
 await setDoc(doc(db, 'businesses', action.payload.id), payloadWithTimestamp);
 break;
 case 'DELETE_BUSINESS':
 await deleteDoc(doc(db, 'businesses', action.payload));
 break;
 case 'ADD_INVESTOR':
 await setDoc(doc(db, 'investors', action.payload.id), payloadWithTimestamp);
 break;
 case 'UPDATE_INVESTOR':
 await updateDoc(doc(db, 'investors', action.payload.id), payloadWithTimestamp);
 break;
 case 'DELETE_INVESTOR':
 await deleteDoc(doc(db, 'investors', action.payload));
 break;
 case 'ADD_INVESTMENT':
 await setDoc(doc(db, 'investments', action.payload.id), payloadWithTimestamp);
 break;
 case 'UPDATE_INVESTMENT':
 await setDoc(doc(db, 'investments', action.payload.id), payloadWithTimestamp);
 break;
 case 'DELETE_INVESTMENT':
 await deleteDoc(doc(db, 'investments', action.payload));
 break;
 case 'UPDATE_SETTINGS':
 await setDoc(doc(db, 'settings', 'global'), payloadWithTimestamp);
 break;
 }
 } catch (err) {
 console.error('Error dispatching action to Firebase:', err);
 }
 };

 return (
 <AppContext.Provider value={{ state, dispatch }}>
 {state.loading ? (
 <div className="flex h-screen w-full items-center justify-center">
 <p className="text-kite-text-light font-medium tracking-wider uppercase text-sm">Loading System...</p>
 </div>
 ) : children}
 </AppContext.Provider>
 );
}

export function useAppContext() {
 const context = useContext(AppContext);
 if (context === undefined) {
 throw new Error('useAppContext must be used within an AppProvider');
 }
 return context;
}

