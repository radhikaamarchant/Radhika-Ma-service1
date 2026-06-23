import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAppContext } from './AppContext';
import { getBaseMarketTrend } from './marketSimulator';
import { getBlueTickBusinessIds } from './blueTick';

interface MarketDataPoint {
 value: number;
 timestamp: number;
}

interface MarketState {
 trends: Record<string, number>;
 history: Record<string, MarketDataPoint[]>;
 alerts: MarketAlert[];
}

interface MarketAlert {
 id: string;
 type: 'shock' | 'recovery';
 businessId: string;
 businessName: string;
 message: string;
 timestamp: number;
}

interface MarketSimulationContextType {
 marketState: MarketState;
 removeAlert: (id: string) => void;
}

const MarketSimulationContext = createContext<MarketSimulationContextType | undefined>(undefined);

export const MarketSimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { state } = useAppContext();
 const [marketState, setMarketState] = useState<MarketState>({ trends: {}, history: {}, alerts: [] });
 // Keep latest state in ref to avoid effect recreation
 const dataRef = useRef({ businesses: state.businesses || [], investments: state.investments || [] });
 useEffect(() => {
 dataRef.current = { businesses: state.businesses || [], investments: state.investments || [] };
 }, [state.businesses, state.investments]);

 useEffect(() => {
 const interval = setInterval(() => {
 setMarketState(prev => {
 const { businesses = [], investments = [] } = dataRef.current;
 const blueTickIds = getBlueTickBusinessIds(businesses, investments);
 const newTrends: Record<string, number> = {};
 const newHistory = { ...prev.history };
 const newAlerts = [...prev.alerts];
 businesses.forEach(b => {
 const isBlueTick = blueTickIds.has(b.id);
 const currentBase = getBaseMarketTrend(b, investments, isBlueTick);
 const fluctuation = (Math.random() * 2) - 1; // +/- 1% noise
 const newValue = currentBase + fluctuation;
 newTrends[b.id] = newValue;
 if (!newHistory[b.id]) {
 newHistory[b.id] = [];
 }
 const historyArr = [...newHistory[b.id], { value: newValue, timestamp: Date.now() }];
 // keep last 15 values
 if (historyArr.length > 15) {
 historyArr.shift();
 }
 newHistory[b.id] = historyArr;

 // Alert logic
 if (historyArr.length >= 3) {
 const lastValue = historyArr[historyArr.length - 2].value;
 const drop = lastValue - newValue;
 // If drop is sudden and steep (> 8 or 10%)
 if (drop > 10) {
 const hasRecentShock = newAlerts.some(a => a.businessId === b.id && a.type === 'shock' && Date.now() - a.timestamp < 30000);
 if (!hasRecentShock) {
 newAlerts.push({
 id: Math.random().toString(),
 type: 'shock',
 businessId: b.id,
 businessName: b.name,
 message: `⚠️ Market Shock: Significant withdrawal detected in ${b.name}. Trend correcting.`,
 timestamp: Date.now()
 });
 }
 } else if (drop < -10) {
 // Recovery
 const hasRecentRecovery = newAlerts.some(a => a.businessId === b.id && a.type === 'recovery' && Date.now() - a.timestamp < 30000);
 if (!hasRecentRecovery) {
 newAlerts.push({
 id: Math.random().toString(),
 type: 'recovery',
 businessId: b.id,
 businessName: b.name,
 message: `🚀 Market Recovery: ${b.name} is bouncing back. Buyer confidence high!`,
 timestamp: Date.now()
 });
 }
 }
 }
 });
 // Remove old alerts > 10 seconds
 const filteredAlerts = newAlerts.filter(a => Date.now() - a.timestamp < 10000);

 return { trends: newTrends, history: newHistory, alerts: filteredAlerts };
 });
 }, 2000); // 2 seconds tick
 return () => clearInterval(interval);
 }, []);

 const removeAlert = (id: string) => {
 setMarketState(prev => ({
 ...prev,
 alerts: prev.alerts.filter(a => a.id !== id)
 }));
 };

 return (
 <MarketSimulationContext.Provider value={{ marketState, removeAlert }}>
 {children}
 </MarketSimulationContext.Provider>
 );
};

export const useMarketSimulation = () => {
 const context = useContext(MarketSimulationContext);
 if (!context) {
 throw new Error('useMarketSimulation must be used within MarketSimulationProvider');
 }
 return context;
};
