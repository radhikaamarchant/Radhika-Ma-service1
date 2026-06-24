import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { ArrowUpRight, TrendingUp, Users, Wallet, BadgeCheck, X, Building, PieChart as PieChartIcon, Search, Lightbulb, Target, Trophy, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Business } from '../types';

import { getVerificationStats } from '../utils/blueTick';
import { MarketTrendCell } from '../components/MarketTrendCell';
import { getUnifiedBankBalance } from '../utils/bankBalance';
import { calculateLiveProfit } from '../utils/profitCalculator';
import { useMarketSimulation } from '../utils/MarketSimulationContext';

export default function Dashboard() {
 const { state } = useAppContext();
 const { marketState } = useMarketSimulation();
 const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
 const [searchTerm, setSearchTerm] = useState('');

 // Calculate stats
 const totalBusinesses = state.businesses.length;
 const totalInvestors = state.investors.length;
 const totalFundingRequired = state.businesses
 .filter(b => b.status === 'listed')
 .reduce((sum, b) => sum + b.fundingRequired, 0);

  const totalCommissions = getUnifiedBankBalance('Radhika M', state.businesses, state.investors, state.investments);

 const stats = [
 { label: 'RMAS Profit Balance', value: formatINR(totalCommissions), icon: TrendingUp, positive: true },
 { label: 'Registered Businesses', value: totalBusinesses, icon: Wallet, positive: false },
 { label: 'Total Investors', value: totalInvestors, icon: Users, positive: false },
 { label: 'Funding Needed (Listed)', value: formatINR(totalFundingRequired), icon: ArrowUpRight, positive: false },
 ];

 // Top Businesses by Interest Rate
 const topBusinesses = [...state.businesses]
 .sort((a, b) => b.interestRate - a.interestRate)
 .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));

 // Top Performing / Blue Tick Businesses (High Investment & High Returns)
 const businessesWithStats = state.businesses.map(b => {
 const bizInvs = state.investments.filter(i => i.businessId === b.id);
 const totalInv = bizInvs.reduce((sum, inv) => sum + inv.amount, 0);
 const totalRet = bizInvs.filter(i => i.status === 'completed').reduce((sum, inv) => {
 const p = inv.payoutDetails;
 return sum + (p ? (p.totalCredited + p.rmasCommission + p.happyIncomeTax) : 0);
 }, 0);
 return { ...b, totalInv, totalRet };
 });

 // Data Analysis Setup
 const highestInvested = [...businessesWithStats].sort((a, b) => b.totalInv - a.totalInv)[0];
 const highestProfit = [...businessesWithStats].sort((a, b) => b.totalRet - a.totalRet)[0];
 const untappedBusinesses = businessesWithStats.filter(b => b.totalInv === 0);
 const newlyListed = [...state.businesses].reverse().slice(0, 3); // Since they are appended
 const statsMap = getVerificationStats(state.businesses, state.investments);
 const blueTickBusinesses = businessesWithStats
 .filter(b => statsMap.get(b.id)?.isBlueTick)
 .sort((a, b) => b.totalRet - a.totalRet)
 .slice(0, 4)
 .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));

 const preVerifiedBusinesses = businessesWithStats
 .filter(b => statsMap.get(b.id)?.isPreVerified)
 .sort((a, b) => b.totalRet - a.totalRet)
 .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));

 const otherBusinesses = topBusinesses.filter(b => {
 const stats = statsMap.get(b.id);
 return !stats?.isBlueTick && !stats?.isPreVerified;
 });

 const getTime = (id: string) => parseInt(id.replace(/\D/g, '')) || 0;

 const recentFilteredInvestments = state.investments.slice()
 .sort((a, b) => getTime(b.id) - getTime(a.id))
 .filter(inv => {
 const business = state.businesses.find(b => b.id === inv.businessId);
 const investor = state.investors.find(i => i.id === inv.investorId);
 const match = searchTerm.toLowerCase();
 return business?.name.toLowerCase().includes(match) || investor?.name.toLowerCase().includes(match);
 });

 // Business Analytics Details
 const renderBusinessDetails = (business: Business) => {
 const bizInvestments = state.investments.filter(i => i.businessId === business.id);
 const totalInvested = bizInvestments.reduce((sum, inv) => sum + inv.amount, 0);
 const fundingRemaining = Math.max(0, business.fundingRequired - totalInvested);
 const fundingPercentage = business.fundingRequired > 0 ? (totalInvested / business.fundingRequired) * 100 : 0;

 // Calculate profits
 let expectedProfitToPay = 0;
 let actualProfitPaid = 0;

 bizInvestments.forEach(inv => {
 if (inv.status === 'completed') {
 const payout = inv.payoutDetails;
 if (payout) {
 // Profit paid is what total credited is minus the invested amount, and plus taxes/fees if we consider profit generated by business.
 // Or we just display the raw profit derived from payout.
 // A simple way: Profit paid to investor is just the gross profit before deductions, since that's what the business paid!
 const grossPayout = payout.totalCredited + payout.rmasCommission + payout.happyIncomeTax;
 actualProfitPaid += (grossPayout - inv.amount);
 } else {
 // fallback
 actualProfitPaid += inv.amount * ((inv.interestRate || business.interestRate) / 100);
 }
 } else {
 const { liveProfit } = calculateLiveProfit([inv], business.id, marketState.trends, state.settings);
 expectedProfitToPay += liveProfit;
 }
 });

 const fundingData = [
 { name: 'Invested', value: totalInvested, color: '#4caf50' }, // Green
 { name: 'Remaining', value: fundingRemaining, color: '#eeeeee' } // Gray
 ];

 const profitData = [
 { name: 'Paid Back (Profit)', value: actualProfitPaid, color: '#4184f3' }, // Blue
 { name: 'Expected (Pending)', value: expectedProfitToPay, color: '#000000' } // Orange
 ];

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
 <div className="bg-white rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto">
 <div className="sticky top-0 bg-white border-b border-kite-border p-2 md:p-4 flex justify-between items-center z-10">
 <div>
 <div className="flex items-center space-x-2">
 <h3 className="font-medium text-xs md:text-base text-kite-text">
 {business.name}
 </h3>
 {statsMap.get(business.id)?.isBlueTick && <BadgeCheck  className="w-4 h-4 md:w-5 md:h-5 text-white fill-blue-500" />}
 {statsMap.get(business.id)?.isPreVerified && <Clock  className="w-4 h-4 md:w-5 md:h-5 text-black" title="Pre-Verified" />}
 </div>
 <p className="text-[11px] font-medium text-kite-text-light mt-0.5 tracking-wide uppercase">
 {statsMap.get(business.id)?.isBlueTick ? "RMAS Verified & High Profit Business" : statsMap.get(business.id)?.isPreVerified ? "Verification Coming Soon" : "RMAS Registered Business"}
 </p>
 {business.location && <p className="text-sm font-medium text-kite-text-light mt-1">{business.location}</p>}
 </div>
 <button onClick={() => setSelectedBusiness(null)}
 className="p-1.5 hover:bg-kite-bg rounded-full text-kite-text-light transition-colors"
 >
 <X className="w-4 h-4 md:w-5 md:h-5" />
 </button>
 </div>
 <div className="p-1.5 md:p-3 md:p-5 space-y-6">
 {business.description && (
 <div className="bg-kite-bg border border-kite-border p-2 md:p-4 rounded-sm">
 <p className="text-sm text-kite-text whitespace-pre-wrap">{business.description}</p>
 </div>
 )}
 <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
 <div className="bg-kite-bg p-1.5 md:p-3 rounded-sm border border-kite-border">
 <p className="text-[10px] font-medium text-kite-text-light uppercase tracking-widest">Total Required</p>
 <p className="text-xs md:text-base font-medium text-kite-text mt-1">{formatINR(business.fundingRequired)}</p>
 </div>
 <div className="bg-kite-green/10 p-1.5 md:p-3 rounded-sm border border-kite-green/30">
 <p className="text-[10px] font-medium text-kite-green uppercase tracking-widest">Total Invested</p>
 <p className="text-xs md:text-base font-medium text-kite-green mt-1">{formatINR(totalInvested)}</p>
 </div>
 <div className="bg-kite-blue/10 p-1.5 md:p-3 rounded-sm border border-kite-blue/30">
 <p className="text-[10px] font-medium text-kite-blue uppercase tracking-widest">Profit Paid</p>
 <p className="text-xs md:text-base font-medium text-kite-blue mt-1">{formatINR(actualProfitPaid)}</p>
 </div>
 <div className="bg-white p-1.5 md:p-3 rounded-sm border border-kite-border">
 <p className="text-[10px] font-medium text-black uppercase tracking-widest">Expected</p>
 <p className="text-xs md:text-base font-medium text-black mt-1">{formatINR(expectedProfitToPay)}</p>
 </div>
 <div className="bg-kite-blue/10 p-1.5 md:p-3 rounded-sm border border-blue-100">
 <p className="text-[10px] font-medium text-kite-blue uppercase tracking-widest">Live Trend</p>
 <div className="mt-1.5 text-xs md:text-base">
 <MarketTrendCell businessId={business.id} showIcon={true} />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
 {/* Funding Chart */}
 <div className="w-full border border-kite-border rounded-sm p-2 md:p-4 bg-white ">
 <h4 className="font-medium text-kite-text mb-4 text-center flex items-center justify-center space-x-2 text-sm">
 <PieChartIcon className="w-3 md:w-4 h-3 md:h-4" />
 <span>Funding Status ({fundingPercentage.toFixed(1)}%)</span>
 </h4>
 <div className="h-56">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={fundingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} />
 <XAxis dataKey="name" tick={{ fontSize: 12 }} />
 <YAxis tickFormatter={(value) => formatINR(value)} width={80} tick={{ fontSize: 12 }} />
 <Tooltip formatter={(value: number) => formatINR(value)} cursor={{ fill: 'transparent' }} />
 <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
 {fundingData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Returns Chart */}
 <div className="w-full border border-kite-border rounded-sm p-2 md:p-4 bg-white ">
 <h4 className="font-medium text-kite-text mb-4 text-center flex items-center justify-center space-x-2 text-sm">
 <TrendingUp className="w-3 md:w-4 h-3 md:h-4" />
 <span>Profit & Returns</span>
 </h4>
 <div className="h-56">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={profitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} />
 <XAxis dataKey="name" tick={{ fontSize: 12 }} />
 <YAxis tickFormatter={(value) => formatINR(value)} width={80} tick={{ fontSize: 12 }} />
 <Tooltip formatter={(value: number) => formatINR(value)} cursor={{ fill: 'transparent' }} />
 <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
 {profitData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* Advice Panel */}
 <div className="bg-kite-blue/10 text-black p-2 md:p-4 rounded-sm relative overflow-hidden border border-kite-blue/30">
 <div className="relative z-10">
 <h4 className="font-medium text-sm mb-1.5 flex items-center space-x-2">
 <BadgeCheck  className="w-3 md:w-4 h-3 md:h-4 text-white fill-blue-500 flex-shrink-0" />
 <span className="truncate">RMAS Investment Insight</span>
 </h4>
 <p className="text-kite-text text-xs leading-relaxed max-w-2xl text-justify break-words whitespace-normal">
 આ કંપની RMAS દ્વારા ચકાસાયેલ છે. અહીં તમે <strong>{business.interestRate}%</strong> વળતર સાથે સુરક્ષિત રોકાણ કરી શકો છો. અત્યાર સુધી લોકોએ <strong>{formatINR(totalInvested)}</strong> જેટલું વિશ્વાસપાત્ર ઇન્વેસ્ટમેન્ટ કર્યું છે. નવા રોકાણકારો માટે આ એક સુરક્ષિત વિકલ્પ સાબિત થઇ શકે છે.
 </p>
 </div>
 <Building  className="w-[80px] h-[80px] absolute -right-4 -bottom-4 text-blue-200 opacity-20" />
 </div>

 </div>
 </div>
 </div>
 );
 };

 return (
 <div className="max-w-6xl mx-auto space-y-6">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
 <div>
 <h2 className="text-xs md:text-base font-medium text-kite-text tracking-tight">System Overview</h2>
 <p className="text-xs text-kite-text-light mt-1">Key metrics and top investment opportunities for Radhika Ma Service.</p>
 </div>
 <div className="relative w-full md:w-72">
 <Search className="w-3 md:w-4 h-3 md:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-kite-text-light"  />
 <input type="text"
 placeholder="Search businesses or investors..."
 className="w-full pl-9 pr-4 py-1.5 text-sm border border-black rounded-sm focus:ring-2 focus:ring-black focus:outline-none transition-shadow font-medium"
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
 {stats.map((stat, i) => {
 const Icon = stat.icon;
 return (
 <div key={i} className="w-full bg-white p-2 md:p-4 rounded-sm border border-kite-border ">
 <div className="flex flex-col">
 <div className="w-8 h-8 rounded-sm bg-kite-bg flex items-center justify-center mb-3">
 <Icon  className="w-3 md:w-4 h-3 md:h-4 text-kite-text" />
 </div>
 <div>
 <p className="text-[11px] font-medium text-kite-text-light mb-1 tracking-wide uppercase leading-tight">{stat.label}</p>
 <h3 className={`text-xs md:text-base font-medium tracking-tight ${stat.positive ? 'text-kite-green' : 'text-kite-text'}`}>
 {stat.value}
 </h3>
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Top Performing / Blue Tick Businesses */}
 {blueTickBusinesses.length > 0 && (
 <div className="mb-4 md:mb-8">
 <h3 className="text-xs md:text-base font-medium text-kite-text mb-4 flex items-center space-x-2">
 <BadgeCheck  className="w-4 h-4 md:w-6 md:h-6 text-white fill-blue-500" />
 <span>Top Performing / Verified Businesses</span>
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
 {blueTickBusinesses.map(b => (
 <div key={`blue_${b.id}`} onClick={() => setSelectedBusiness(b)}
 className="flex flex-col sm:flex-row sm:items-center justify-between p-2 md:p-4 bg-white border border-kite-border hover:border-kite-blue rounded-sm cursor-pointer transition-all   group gap-1.5 md:p-3 relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-12 h-12 bg-kite-blue/10 transform rotate-45 translate-x-6 -translate-y-6 group-hover:bg-kite-blue/20 transition-colors"></div>
 <div className="flex items-center space-x-3 min-w-0 z-10">
 <div className="w-10 h-10 rounded-sm bg-kite-blue flex-shrink-0 text-white flex items-center justify-center font-medium text-xs md:text-base-inner">
 {b.name.charAt(0)}
 </div>
 <div className="min-w-0">
 <div className="flex items-center space-x-1.5">
 <h4 className="font-medium text-sm text-kite-text group-hover:text-kite-blue transition-colors truncate">{b.name}</h4>
 <BadgeCheck  className="w-3 md:w-4 h-3 md:h-4 text-white fill-blue-500 flex-shrink-0" />
 </div>
 <p className="text-[11px] text-kite-text-light mt-0.5 truncate uppercase tracking-wider leading-tight">{b.ownerName}</p>
 </div>
 </div>
 <div className="text-right flex-shrink-0 z-10">
 <div className="flex flex-col items-end">
 <p className="text-[9px] text-kite-text-light uppercase tracking-widest font-medium mb-0.5">Total Returns Info</p>
 <p className="text-sm font-medium text-kite-green block mb-1">{formatINR(b.totalRet)}</p>
 <MarketTrendCell businessId={b.id} showIcon={true} />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Other Listed Businesses (Verified) */}
 <div>
 <h3 className="text-xs md:text-base font-medium text-kite-text mb-4 flex items-center space-x-2">
 {preVerifiedBusinesses.length > 0 && <Clock  className="w-4 h-4 md:w-6 md:h-6 text-black" />}
 <span>{preVerifiedBusinesses.length > 0 ? "Pre-Verified / Approaching Verification" : "Other Listed Businesses"}</span>
 </h3>
 {preVerifiedBusinesses.length > 0 && (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5 md:p-3 mb-4 md:mb-8">
 {preVerifiedBusinesses.map(b => {
 const vStats = statsMap.get(b.id);
 return (
 <div key={`pre_${b.id}`} onClick={() => setSelectedBusiness(b)}
 className="flex flex-col p-2 md:p-4 bg-white border border-kite-border hover:border-kite-blue rounded-sm cursor-pointer transition-all hover: group overflow-hidden gap-3"
 >
 <div className="flex justify-between items-start">
 <div className="flex items-center space-x-3 min-w-0">
 <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 text-black flex items-center justify-center font-medium text-sm">
 {b.name.charAt(0)}
 </div>
 <div className="min-w-0">
 <div className="flex items-center space-x-1">
 <h4 className="font-medium text-xs text-kite-text group-hover:text-kite-text transition-colors truncate">{b.name}</h4>
 <Clock  className="w-2.5 md:w-3 h-2.5 md:h-3 text-black flex-shrink-0" title="Pre-Verified" />
 </div>
 <p className="text-[10px] text-kite-text-light font-medium truncate">Owner: {b.ownerName}</p>
 </div>
 </div>
 </div>
 <div className="mt-2 text-xs">
 <div className="flex justify-between mb-1 font-medium text-black">
 <span>Profit: {vStats?.profitPctDisplay.toFixed(1)}%</span>
 <span>Goal: 60%</span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-1.5">
 <div className="bg-black h-1.5 rounded-full transition-all duration-500" style={{ width: `${(vStats?.progressToBlueTick ?? 0) * 100}%` }}></div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}

 <h3 className="text-xs md:text-base font-medium text-kite-text mb-4">Other Listed Businesses</h3>
 {otherBusinesses.length === 0 && preVerifiedBusinesses.length === 0 ? (
 <div className="p-2 md:p-4 text-center text-kite-text-light text-sm font-medium">No businesses found.</div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 {otherBusinesses.map(b => (
 <div key={b.id} onClick={() => setSelectedBusiness(b)}
 className="flex flex-col sm:flex-row sm:items-center justify-between p-1.5 md:p-3 bg-white border border-kite-border hover:border-kite-blue rounded-sm cursor-pointer transition-all hover: group overflow-hidden gap-3"
 >
 <div className="flex items-center space-x-3 min-w-0">
 <div className="w-8 h-8 rounded-full bg-kite-blue/10 flex-shrink-0 text-kite-blue flex items-center justify-center font-medium text-sm">
 {b.name.charAt(0)}
 </div>
 <div className="min-w-0">
 <div className="flex items-center space-x-1">
 <h4 className="font-medium text-xs text-kite-text group-hover:text-kite-blue transition-colors truncate">{b.name}</h4>
 </div>
 <p className="text-[10px] text-kite-text-light font-medium truncate">Owner: {b.ownerName}</p>
 </div>
 </div>
 <div className="text-right flex-shrink-0">
 <div className="text-[9px] font-medium text-kite-green bg-kite-green/10 px-1.5 py-0.5 rounded-sm inline-block mb-1 tracking-wide uppercase">{b.interestRate}% Return</div>
 <div className="flex flex-col items-end">
 <p className="text-[11px] font-medium text-kite-text mx-w-[80px] truncate mb-1">{formatINR(b.fundingRequired)}</p>
 <MarketTrendCell businessId={b.id} showIcon={true} />
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="grid grid-cols-1 gap-2 md:p-4 mt-3 md:mt-6">
 <div className="w-full bg-white border border-kite-border rounded-sm p-1.5 md:p-3 md:p-5 ">
 <h3 className="text-xs md:text-base font-medium text-kite-text mb-4">Recent Investments</h3>
 <div className="space-y-3">
 {recentFilteredInvestments.slice(0, 5).map(inv => {
 const business = state.businesses.find(b => b.id === inv.businessId);
 const investor = state.investors.find(i => i.id === inv.investorId);
 return (
 <div key={inv.id} className="p-1.5 md:p-3 bg-kite-bg rounded-sm flex flex-col md:flex-row md:items-center justify-between border border-kite-border">
 <div className="mb-2 md:mb-0">
 <div className="flex items-center space-x-2">
 <p className="font-medium text-kite-text text-sm">{investor?.name}</p>
 </div>
 <div className="flex items-center text-xs text-kite-text-light mt-1">
 <span>Invested in <span className="font-medium text-kite-text">{business?.name}</span></span>
 {business && statsMap.get(business.id)?.isBlueTick && <BadgeCheck  className="w-2.5 md:w-3 h-2.5 md:h-3 text-white fill-blue-500 ml-1" />}
 {business && statsMap.get(business.id)?.isPreVerified && <Clock  className="w-2.5 md:w-3 h-2.5 md:h-3 text-black ml-1" />}
 </div>
 </div>
 <div className="flex items-center space-x-4 text-right">
 <div>
 <p className="text-[10px] font-medium text-kite-text-light uppercase tracking-wider">Amount</p>
 <p className="font-medium text-kite-text text-base">{formatINR(inv.amount)}</p>
 </div>
 <div className="hidden sm:block text-right">
 <p className="text-[10px] font-medium text-kite-text-light uppercase tracking-wider">Interest</p>
 <p className="font-medium text-kite-green text-sm">{inv.interestRate}%</p>
 </div>
 <div className="hidden sm:block">
 <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-kite-green/20 text-green-800 text-[10px] font-medium tracking-wide uppercase">
 {inv.status}
 </span>
 </div>
 </div>
 </div>
 );
 })}
 {recentFilteredInvestments.length === 0 && (
 <div className="p-2 md:p-4 text-center text-kite-text-light text-sm font-medium border border-kite-border border-dashed rounded-sm">No investments found.</div>
 )}
 </div>
 </div>
 </div>

 {selectedBusiness && renderBusinessDetails(selectedBusiness)}
 </div>
 );
}

