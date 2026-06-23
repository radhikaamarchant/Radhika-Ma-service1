import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Lightbulb, Target, Trophy, Clock, PieChart as PieChartIcon, BadgeCheck, X, TrendingUp, Users, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Business } from '../types';

import { getVerificationStats } from '../utils/blueTick';
import { MarketTrendCell } from '../components/MarketTrendCell';

export default function DataAnalysis() {
 const { state } = useAppContext();
 const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortBy, setSortBy] = useState<'investment' | 'interest'>('interest');

 const businessesWithStats = state.businesses.map(b => {
 const bizInvs = state.investments.filter(i => i.businessId === b.id);
 const totalInv = bizInvs.reduce((sum, inv) => sum + inv.amount, 0);
 const investorSet = new Set(bizInvs.map(i => i.investorId));
 const investorCount = investorSet.size;
 const profitedInvestorsSet = new Set(bizInvs.filter(i => i.status === 'completed').map(i => i.investorId));
 const profitedInvestorsCount = profitedInvestorsSet.size;

 const completedInvs = bizInvs.filter(i => i.status === 'completed');
 const totalRet = completedInvs.reduce((sum, inv) => {
 const p = inv.payoutDetails;
 return sum + (p ? (p.totalCredited + p.rmasCommission + p.happyIncomeTax) : 0);
 }, 0);
 const avgReturnPct = completedInvs.length > 0 ? completedInvs.reduce((sum, i) => sum + i.interestRate, 0) / completedInvs.length : b.interestRate;

 return { ...b, totalInv, totalRet, investorCount, profitedInvestorsCount, activeInvsCount: bizInvs.length - completedInvs.length, completedInvsCount: completedInvs.length, avgReturnPct };
 });

 const topInvested = [...businessesWithStats].filter(b => b.totalInv > 0).sort((a, b) => b.totalInv - a.totalInv).slice(0, 10);
 const topBacked = [...businessesWithStats].filter(b => b.investorCount > 0).sort((a, b) => b.investorCount - a.investorCount).slice(0, 10);
 const topEarners = [...businessesWithStats].filter(b => b.totalRet > 0).sort((a, b) => b.totalRet - a.totalRet).slice(0, 10);
 const untappedBusinesses = businessesWithStats.filter(b => b.totalInv === 0);
 const newlyListed = [...businessesWithStats].filter(b => b.totalInv < b.fundingRequired * 0.5).reverse().slice(0, 8); const overviewBusinesses = [...businessesWithStats]
 .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) || b.businessId.toLowerCase().includes(searchTerm.toLowerCase()))
 .sort((a, b) => {
 if (sortBy === 'investment') {
 return b.totalInv - a.totalInv;
 }
 return a.interestRate - b.interestRate;
 });
 const statsMap = getVerificationStats(state.businesses, state.investments);

 // Business Analytics Details
 const renderBusinessDetails = (business: Business) => {
 const bizStats = businessesWithStats.find(b => b.id === business.id);
 const bizInvestments = state.investments.filter(i => i.businessId === business.id);
 const completedInvestments = bizInvestments.filter(i => i.status === 'completed');
 const totalInvested = bizInvestments.reduce((sum, inv) => sum + inv.amount, 0);
 const fundingRemaining = Math.max(0, business.fundingRequired - totalInvested);
 const fundingPercentage = business.fundingRequired > 0 ? (totalInvested / business.fundingRequired) * 100 : 0;

 let expectedProfitToPay = 0;
 let actualProfitPaid = 0;

 bizInvestments.forEach(inv => {
 if (inv.status === 'completed') {
 const payout = inv.payoutDetails;
 if (payout) {
 const grossPayout = payout.totalCredited + payout.rmasCommission + payout.happyIncomeTax;
 actualProfitPaid += (grossPayout - inv.amount);
 }
 } else {
 const expectedProfit = inv.amount * (inv.interestRate / 100);
 expectedProfitToPay = expectedProfit;
 }
 });

 const fundingData = [
 { name: 'Funded', value: totalInvested, color: '#4caf50' },
 { name: 'Remaining', value: fundingRemaining, color: '#eeeeee' }
 ];

 const profitData = [
 { name: 'Profit Paid', value: actualProfitPaid, color: '#4184f3' },
 { name: 'Expected', value: expectedProfitToPay, color: '#000000' }
 ];

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-kite-bg/60 p-4">
 <div className="bg-white border border-kite-border rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto">
 <div className="sticky top-0 bg-white border-b border-kite-border p-2 md:p-4 flex justify-between items-center z-10">
 <div>
 <div className="flex items-center space-x-2">
 <h3 className="font-medium text-xs md:text-base text-kite-text flex items-center space-x-1">
 <span>{business.name}</span>
 {statsMap.get(business.id)?.isBlueTick && <BadgeCheck  className="w-4 h-4 md:w-5 md:h-5 text-white fill-blue-500" title="RMAS Verified" />}
 {statsMap.get(business.id)?.isPreVerified && <Clock  className="w-4 h-4 md:w-5 md:h-5 text-kite-text" title="Pre-Verified" />}
 </h3>
 </div>
 <p className="text-[11px] font-medium text-kite-text-light mt-0.5 tracking-wide uppercase">
 {business.ownerName} &bull; {business.businessId}
 </p>
 </div>
 <button onClick={() => setSelectedBusiness(null)}
 className="p-1.5 hover:bg-kite-bg rounded-full text-kite-text-light transition-colors"
 >
 <X className="w-4 h-4 md:w-5 md:h-5" />
 </button>
 </div>
 <div className="p-1.5 md:p-3 md:p-5 space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
 <div className="bg-kite-bg p-2 md:p-4 rounded-sm border border-kite-border">
 <p className="text-[10px] font-medium text-kite-text-light uppercase tracking-widest mb-1">Total Investors</p>
 <p className="text-xs md:text-base font-medium text-kite-text">{bizStats?.investorCount || 0}</p>
 <p className="text-[10px] text-kite-text-light mt-1">Unique</p>
 </div>
 <div className="bg-kite-blue/10 p-2 md:p-4 rounded-sm border border-kite-blue/30">
 <p className="text-[10px] font-medium text-kite-blue uppercase tracking-widest mb-1">Active</p>
 <p className="text-xs md:text-base font-medium text-kite-blue">{bizStats?.activeInvsCount || 0}</p>
 <p className="text-[10px] text-kite-blue mt-1">Running</p>
 </div>
 <div className="bg-kite-green/10 p-2 md:p-4 rounded-sm border border-kite-green/30">
 <p className="text-[10px] font-medium text-kite-green uppercase tracking-widest mb-1">Profited</p>
 <p className="text-xs md:text-base font-medium text-kite-green">{bizStats?.profitedInvestorsCount || 0}</p>
 <p className="text-[10px] text-kite-green mt-1">Paid out</p>
 </div>
 <div className="bg-white p-2 md:p-4 rounded-sm border border-kite-border">
 <p className="text-[10px] font-medium text-kite-text uppercase tracking-widest mb-1">Avg. Return</p>
 <p className="text-xs md:text-base font-medium text-kite-text">{bizStats?.avgReturnPct.toFixed(1)}%</p>
 <p className="text-[10px] text-kite-text mt-1">Historical</p>
 </div>
 <div className="bg-kite-blue/10 p-2 md:p-4 rounded-sm border border-kite-blue/30">
 <p className="text-[10px] font-medium text-kite-blue uppercase tracking-widest mb-1">Live Trend</p>
 <div className="mt-1.5 text-xs md:text-base">
 <MarketTrendCell businessId={business.id} showIcon={true} />
 </div>
 <p className="text-[10px] text-[#3367d6] mt-1">Real-time stats</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
 <div className="w-full border border-kite-border rounded-sm p-2 md:p-4 bg-white">
 <h4 className="font-medium text-kite-text mb-4 text-center text-sm">
 Funding Progress ({fundingPercentage.toFixed(1)}%)
 </h4>
 <div className="h-48">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={fundingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
 
 <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666666' }} axisLine={false} tickLine={false} />
 <YAxis tickFormatter={(value) => formatINR(value)} width={80} tick={{ fontSize: 10, fill: '#666666' }} axisLine={false} tickLine={false} />
 <Tooltip cursor={{ fill: '#f9f9f9' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '2px', fontSize: '12px', color: '#444444' }} itemStyle={{ color: '#444444' }} formatter={(value: number) => formatINR(value)} labelStyle={{ color: '#666666', marginBottom: '4px' }} />
 <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
 {fundingData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="w-full border border-kite-border rounded-sm p-2 md:p-4 bg-white">
 <h4 className="font-medium text-kite-text mb-4 text-center text-sm">
 Profit Distribution Status
 </h4>
 <div className="h-48">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={profitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
 
 <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666666' }} axisLine={false} tickLine={false} />
 <YAxis tickFormatter={(value) => formatINR(value)} width={80} tick={{ fontSize: 10, fill: '#666666' }} axisLine={false} tickLine={false} />
 <Tooltip cursor={{ fill: '#f9f9f9' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '2px', fontSize: '12px', color: '#444444' }} itemStyle={{ color: '#444444' }} formatter={(value: number) => formatINR(value)} labelStyle={{ color: '#666666', marginBottom: '4px' }} />
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

 <div className={`bg-kite-bg text-kite-text p-1.5 md:p-3 md:p-5 rounded-sm relative overflow-hidden`}>
 <div className="relative z-10">
 <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
 <Lightbulb className={`w-3 md:w-4 h-3 md:h-4 ${statsMap.get(business.id)?.isBlueTick ? "text-kite-blue flex-shrink-0" : statsMap.get(business.id)?.isPreVerified ? "text-kite-text flex-shrink-0" : "text-kite-text flex-shrink-0"}`} />
 <span>RMAS Advisory Summary</span>
 </h4>
 <div className="space-y-2 text-sm text-kite-text">
 {bizStats?.totalInv === 0 && (
 <p>• આ કંપનીમાં હજુ સુધી કોઈએ રોકાણ કર્યું નથી. આ <strong>Newly Untapped</strong> તક છે. તમે રોકાણકારોને <strong>{bizStats.interestRate}%</strong> ના ફિક્સ વળતર માટે આની ખાતરી આપી શકો છો.</p>
 )}
 {bizStats && bizStats.totalInv > 0 && bizStats.totalRet === 0 && (
 <p>• આ બિઝનેસમાં અત્યાર સુધી <strong>{formatINR(bizStats.totalInv)}</strong> નું રોકાણ થયું છે. રોકાણ ચાલુ છે, પરંતુ વળતર મળવાનું બાકી છે. વધુ રોકાણકારો માટે આ મધ્યમ-જોખમી (Medium Risk) પ્રોફાઇલ ગણી શકાય.</p>
 )}
 {bizStats && bizStats.totalRet > 0 && (
 <p>• આ <strong>RMAS Verified </strong> કંપની છે. અત્યાર સુધીમાં <strong>{bizStats.profitedInvestorsCount} રોકાણકારો</strong> આરામથી <strong>{formatINR(actualProfitPaid)}</strong> જેટલું નફો કમાઈ ચૂક્યા છે. નવા રોકાણકારો માટે આ <strong>અત્યંત સુરક્ષિત</strong> અને ભરોસાપાત્ર વિકલ્પ છે.</p>
 )}
 {bizStats && bizStats.investorCount > 5 && (
 <p>• <strong>Most Backed:</strong> આ કંપનીમાં સૌથી વધુ (<strong>{bizStats.investorCount}</strong>) ઇન્વેસ્ટરે વિશ્વાસ દાખવ્યો છે.</p>
 )}
 </div>
 </div>
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
 <h2 className="text-xs md:text-base font-medium text-kite-text tracking-tight">Data Analysis & Advisory</h2>
 <p className="text-xs text-kite-text-light mt-1">Deep insights into cross-business performance. Use this to guide investors.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4">
 {/* Most Popular */}
 <div className="bg-white border border-kite-border rounded-sm flex flex-col">
 <div className="p-2 md:p-4 border-b border-kite-border">
 <h3 className="font-medium text-kite-text flex items-center space-x-2">
 <Target  className="w-3.5 h-3.5 md:w-4 md:h-4 text-white fill-blue-500" />
 <span>Most Popular (Top Invested)</span>
 </h3>
 <p className="text-[11px] text-kite-text-light mt-1">Businesses with the highest capital invested.</p>
 </div>
 <div className="divide-y divide-kite-border flex-1">
 {topInvested.length > 0 ? topInvested.map(b => (
 <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="p-1.5 md:p-3 hover:bg-kite-blue/10 cursor-pointer transition-colors flex justify-between items-center group">
 <div className="min-w-0 pr-2">
 <h4 className="font-medium text-sm text-kite-text group-hover:text-kite-blue truncate flex items-center space-x-1">
 <span>{b.name}</span>
 {statsMap.get(b.id)?.isBlueTick && <BadgeCheck  className="w-3 md:w-3.5 h-3 md:h-3.5 text-white fill-blue-500" />}
 {statsMap.get(b.id)?.isPreVerified && <Clock  className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text" />}
 </h4>
 <p className="text-[10px] text-kite-text-light mt-0.5">{b.investorCount} Investors</p>
 </div>
 <div className="text-right flex-shrink-0">
 <p className="text-sm font-medium text-kite-blue">{formatINR(b.totalInv)}</p>
 </div>
 </div>
 )) : <div className="p-2 md:p-4 text-center text-sm text-kite-text-light">No data available</div>}
 </div>
 </div>

 {/* Most Backed */}
 <div className="bg-white border border-kite-border rounded-sm flex flex-col">
 <div className="p-2 md:p-4 border-b border-kite-border">
 <h3 className="font-medium text-kite-text flex items-center space-x-2">
 <Users  className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
 <span>Most Backed (By Investors)</span>
 </h3>
 <p className="text-[11px] text-kite-text-light mt-1">Businesses trusted by the highest number of unique people.</p>
 </div>
 <div className="divide-y divide-kite-border flex-1">
 {topBacked.length > 0 ? topBacked.map(b => (
 <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="p-1.5 md:p-3 hover:bg-kite-blue/10 cursor-pointer transition-colors flex justify-between items-center group">
 <div className="min-w-0 pr-2">
 <h4 className="font-medium text-sm text-kite-text group-hover:text-kite-blue truncate flex items-center space-x-1">
 <span>{b.name}</span>
 {statsMap.get(b.id)?.isBlueTick && <BadgeCheck  className="w-3 md:w-3.5 h-3 md:h-3.5 text-white fill-blue-500" />}
 {statsMap.get(b.id)?.isPreVerified && <Clock  className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text" />}
 </h4>
 <p className="text-[10px] text-kite-text-light mt-0.5">{formatINR(b.totalInv)} Invested</p>
 </div>
 <div className="text-right flex-shrink-0">
 <p className="text-sm font-medium text-kite-blue">{b.investorCount}</p>
 <p className="text-[9px] text-blue-600 uppercase">Investors</p>
 </div>
 </div>
 )) : <div className="p-2 md:p-4 text-center text-sm text-kite-text-light">No data available</div>}
 </div>
 </div>

 {/* Top Earners */}
 <div className="bg-white border border-kite-border rounded-sm flex flex-col">
 <div className="p-2 md:p-4 border-b border-kite-border">
 <h3 className="font-medium text-kite-text flex items-center space-x-2">
 <Trophy  className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-green" />
 <span>Top Earners (Most Profitable)</span>
 </h3>
 <p className="text-[11px] text-kite-text-light mt-1">Highest payouts successfully delivered back to investors.</p>
 </div>
 <div className="divide-y divide-kite-border flex-1">
 {topEarners.length > 0 ? topEarners.map(b => (
 <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="p-1.5 md:p-3 hover:bg-kite-green/10 cursor-pointer transition-colors flex justify-between items-center group">
 <div className="min-w-0 pr-2">
 <h4 className="font-medium text-sm text-kite-text group-hover:text-kite-green truncate flex items-center space-x-1">
 <span>{b.name}</span>
 {statsMap.get(b.id)?.isBlueTick && <BadgeCheck  className="w-3 md:w-3.5 h-3 md:h-3.5 text-white fill-blue-500" />}
 {statsMap.get(b.id)?.isPreVerified && <Clock  className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text" />}
 </h4>
 <p className="text-[10px] text-kite-text-light mt-0.5">{b.profitedInvestorsCount} Profited Investors</p>
 </div>
 <div className="text-right flex-shrink-0">
 <p className="text-sm font-medium text-kite-green">{formatINR(b.totalRet)}</p>
 <p className="text-[9px] text-kite-green uppercase">Total Payouts</p>
 </div>
 </div>
 )) : <div className="p-2 md:p-4 text-center text-sm text-kite-text-light">No data available</div>}
 </div>
 </div>

 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
 {/* Untapped Potential */}
 <div className="w-full bg-white border border-kite-border rounded-sm p-1.5 md:p-3 md:p-5">
 <h3 className="font-medium text-kite-text flex items-center space-x-2 mb-1">
 <PieChartIcon  className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-text" />
 <span>Untapped Potential (0 Investments)</span>
 </h3>
 <p className="text-[11px] text-kite-text-light mb-4">Complete fresh opportunities. Recommend these to early-bird investors.</p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:p-3 max-h-60 overflow-y-auto pr-2">
 {untappedBusinesses.length > 0 ? untappedBusinesses.map(b => (
 <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="p-1.5 md:p-3 border border-kite-border hover:border-kite-border rounded-sm cursor-pointer transition-colors hover:bg-white">
 <p className="font-medium text-sm text-kite-text truncate mb-1">{b.name}</p>
 <p className="text-xs font-medium text-kite-text">{b.interestRate}% Return</p>
 </div>
 )) : <div className="col-span-2 text-center text-sm text-kite-text-light py-4">No untapped businesses left. Great!</div>}
 </div>
 </div>

 {/* Newly Listed Section */}
 <div className="w-full bg-white border border-kite-border rounded-sm p-1.5 md:p-3 md:p-5">
 <h3 className="font-medium text-kite-text flex items-center space-x-2 mb-1">
 <Clock  className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-text" />
 <span>Newly Listed (Latest Additions)</span>
 </h3>
 <p className="text-[11px] text-kite-text-light mb-4">The most recently added businesses on the platform.</p>
 <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
 {newlyListed.length > 0 ? newlyListed.map(b => (
 <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="flex justify-between items-center p-1.5 md:p-3 border border-kite-border rounded-sm hover:bg-kite-bg cursor-pointer transition-colors group">
 <div className="min-w-0 pr-3">
 <p className="font-medium text-sm text-kite-text truncate group-hover:text-kite-blue flex items-center space-x-1">
 <span>{b.name}</span>
 {statsMap.get(b.id)?.isBlueTick && <BadgeCheck  className="w-3 md:w-3.5 h-3 md:h-3.5 text-white fill-blue-500" />}
 {statsMap.get(b.id)?.isPreVerified && <Clock  className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text" />}
 </p>
 <p className="text-[10px] text-kite-text-light mt-0.5 truncate">{b.ownerName}</p>
 </div>
 <div className="text-right flex-shrink-0">
 <span className="inline-block px-2 py-1 bg-kite-green/10 text-kite-green text-[10px] font-medium uppercase rounded">
 {b.interestRate}% Return
 </span>
 </div>
 </div>
 )) : <div className="text-center text-sm text-kite-text-light py-4">No recent listings.</div>}
 </div>
 </div>
 </div>

 <div className="bg-white border border-kite-border rounded-sm overflow-hidden flex flex-col">
 <div className="p-1.5 md:p-3 md:p-5 border-b border-kite-border flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
 <div>
 <h3 className="font-medium text-kite-text flex items-center space-x-2 text-xs md:text-base">
 <Info  className="w-4 h-4 md:w-5 md:h-5 text-white fill-blue-500" />
 <span>Comprehensive Market Overview</span>
 </h3>
 <p className="text-xs text-kite-text-light mt-1">
 Complete list of all listed businesses structured for professional analysis.
 </p>
 </div>
 <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
 <input type="text" placeholder="Search business or owner..." value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="px-3 py-2 border border-kite-border rounded-sm text-sm text-kite-text bg-kite-bg w-full md:w-64 focus:outline-none focus:border-kite-blue"
 />
 <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'investment' | 'interest')}
 className="px-3 py-2 border border-kite-border rounded-sm text-sm text-kite-text bg-kite-bg w-full sm:w-auto focus:outline-none focus:border-kite-blue cursor-pointer"
 >
 <option value="interest">Sort by Interest Rate</option>
 <option value="investment">Sort by Total Investment</option>
 </select>
 </div>
 </div>
 <div className="overflow-hidden">
 {/* Desktop Table */}
 <div className="hidden md:block overflow-x-auto w-full max-w-full">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-kite-bg border-b border-kite-border text-[10px] uppercase tracking-wider text-kite-text-light">
 <th className="p-2 md:p-2 md:p-4 font-medium">Business</th>
 <th className="p-2 md:p-2 md:p-4 font-medium">Base Interest</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-right">Total Invested</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-right">Total Payouts</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-center">Active Investors</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-center">Live Trend</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-center">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-kite-border">
 {overviewBusinesses.map(b => (
 <tr key={`all_desk_${b.id}`} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)}
 className="hover:bg-kite-blue/10 transition-colors cursor-pointer group"
 >
 <td className="p-4">
 <div className="flex items-center space-x-3">
 <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-medium text-[10px] ${statsMap.get(b.id)?.isBlueTick ? 'bg-kite-blue/10 text-kite-blue' : statsMap.get(b.id)?.isPreVerified ? 'bg-white text-kite-text' : 'bg-kite-bg text-kite-text'}`}>
 {b.name.charAt(0)}
 </div>
 <div className="min-w-0">
 <div className="flex items-center space-x-1.5">
 <p className="font-medium text-sm text-kite-text group-hover:text-kite-blue truncate">{b.name}</p>
 {statsMap.get(b.id)?.isBlueTick && <BadgeCheck  className="w-3 md:w-3.5 h-3 md:h-3.5 text-white fill-blue-500 flex-shrink-0" title="RMAS Verified" />}
 {statsMap.get(b.id)?.isPreVerified && <Clock  className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text flex-shrink-0" title="Pre-Verified" />}
 </div>
 <p className="text-[10px] text-kite-text-light uppercase tracking-wide mt-0.5">{b.ownerName}</p>
 </div>
 </div>
 </td>
 <td className="p-4">
 <span className={`inline-block px-2 py-1 text-[10px] font-medium rounded-sm ${b.interestRate <= 10 ? 'bg-kite-blue/10 text-kite-blue' : b.interestRate <= 20 ? 'bg-white text-kite-text' : 'bg-kite-red/10 text-kite-red'}`}>
 {b.interestRate}%
 </span>
 </td>
 <td className="p-2 md:p-2 md:p-4 text-right">
 <p className="font-medium text-sm text-kite-text">{formatINR(b.totalInv)}</p>
 </td>
 <td className="p-2 md:p-2 md:p-4 text-right">
 <p className={`font-medium text-sm ${b.totalRet > 0 ? 'text-kite-green' : 'text-kite-text-light'}`}>
 {b.totalRet > 0 ? formatINR(b.totalRet) : '-'}
 </p>
 </td>
 <td className="p-2 md:p-2 md:p-4 text-center">
 <div className="flex justify-center items-center space-x-1">
 <Users  className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text-light" />
 <span className="font-medium text-kite-text text-sm">{b.investorCount}</span>
 </div>
 {b.profitedInvestorsCount > 0 && (
 <p className="text-[9px] text-kite-green mt-0.5 font-medium">{b.profitedInvestorsCount} Profited</p>
 )}
 </td>
 <td className="p-2 md:p-2 md:p-4 text-center">
 <div className="flex justify-center text-sm">
 <MarketTrendCell businessId={b.id} showIcon={true} />
 </div>
 </td>
 <td className="p-2 md:p-2 md:p-4 text-center">
 {b.totalInv === 0 ? (
 <span className="inline-block px-2 py-1 bg-kite-bg text-kite-text-light text-[9px] font-medium uppercase rounded-sm tracking-wide">Untapped</span>
 ) : b.totalRet > 0 ? (
 <span className="inline-block px-2 py-1 bg-kite-green/20 text-kite-green text-[9px] font-medium uppercase rounded-sm tracking-wide flex items-center justify-center space-x-1 w-max mx-auto"><BadgeCheck className="w-[10px] h-[10px]" /> <span>Verified</span></span>
 ) : (
 <span className="inline-block px-2 py-1 bg-kite-blue/10 text-kite-blue text-[9px] font-medium uppercase rounded-sm tracking-wide">Active</span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Mobile Cards View */}
 <div className="block md:hidden divide-y divide-kite-border">
 {overviewBusinesses.map(b => (
 <div key={`all_mob_${b.id}`}
 onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)}
 className="p-2 md:p-4 hover:bg-kite-bg active:bg-kite-bg transition-colors cursor-pointer"
 >
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center space-x-3">
 <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-medium text-sm ${statsMap.get(b.id)?.isBlueTick ? 'bg-kite-blue/10 text-kite-blue' : statsMap.get(b.id)?.isPreVerified ? 'bg-white text-kite-text' : 'bg-kite-bg text-kite-text'}`}>
 {b.name.charAt(0)}
 </div>
 <div>
 <div className="flex items-center space-x-1.5">
 <p className="font-medium text-sm text-kite-text">{b.name}</p>
 {statsMap.get(b.id)?.isBlueTick && <BadgeCheck  className="w-3 md:w-3.5 h-3 md:h-3.5 text-white fill-blue-500" />}
 {statsMap.get(b.id)?.isPreVerified && <Clock  className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text" />}
 </div>
 <p className="text-[11px] text-kite-text-light uppercase tracking-wider">{b.ownerName}</p>
 </div>
 </div>
 <div className="text-right">
 <span className={`inline-block px-2 py-1 text-[10px] font-medium rounded-sm ${b.interestRate <= 10 ? 'bg-kite-blue/10 text-kite-blue' : b.interestRate <= 20 ? 'bg-white text-kite-text' : 'bg-kite-red/10 text-kite-red'}`}>
 {b.interestRate}% Int.
 </span>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 bg-kite-bg border border-kite-border rounded-sm p-3">
 <div>
 <p className="text-[10px] text-kite-text-light font-medium uppercase mb-0.5">Total Invested</p>
 <p className="font-medium text-sm text-kite-text">{formatINR(b.totalInv)}</p>
 </div>
 <div className="text-right">
 <p className="text-[10px] text-kite-text-light font-medium uppercase mb-0.5">Total Payouts</p>
 <p className={`font-medium text-sm ${b.totalRet > 0 ? 'text-kite-green' : 'text-kite-text-light'}`}>
 {b.totalRet > 0 ? formatINR(b.totalRet) : '-'}
 </p>
 </div>
 <div>
 <p className="text-[10px] text-kite-text-light font-medium uppercase mb-0.5">Live Trend</p>
 <MarketTrendCell businessId={b.id} showIcon={true} />
 </div>
 <div className="flex items-center justify-between col-span-2 pt-2 border-t border-kite-border">
 <div className="flex items-center space-x-2">
 <div className="flex items-center space-x-1 text-kite-text-light">
 <Users className="w-2.5 md:w-3 h-2.5 md:h-3" />
 <span className="font-medium text-xs">{b.investorCount} Active</span>
 </div>
 {b.profitedInvestorsCount > 0 && (
 <span className="text-[10px] text-kite-green font-medium bg-kite-green/10 px-1.5 py-0.5 rounded">
 {b.profitedInvestorsCount} Profited
 </span>
 )}
 </div>
 <div>
 {b.totalInv === 0 ? (
 <span className="text-[10px] text-kite-text-light font-medium uppercase tracking-wider">Untapped</span>
 ) : b.totalRet > 0 ? (
 <span className="text-[10px] text-kite-green font-medium uppercase tracking-wider flex items-center"><BadgeCheck  className="w-2.5 md:w-3 h-2.5 md:h-3 mr-1" /> Verified</span>
 ) : (
 <span className="text-[10px] text-kite-blue font-medium uppercase tracking-wider">Active</span>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {overviewBusinesses.length === 0 && (
 <div className="p-2 md:p-4 text-center text-kite-text-light text-sm border-t border-kite-border">No businesses found.</div>
 )}
 </div>
 </div>

 {selectedBusiness && renderBusinessDetails(selectedBusiness)}
 </div>
 );
}

