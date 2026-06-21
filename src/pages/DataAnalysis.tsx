import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Lightbulb, Target, Trophy, Clock, PieChart as PieChartIcon, BadgeCheck, X, TrendingUp, Users, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Business } from '../types';

import { getBlueTickBusinessIds } from '../utils/blueTick';

export default function DataAnalysis() {
  const { state } = useAppContext();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

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
    const avgReturnPct = completedInvs.length > 0 
      ? completedInvs.reduce((sum, i) => sum + i.interestRate, 0) / completedInvs.length 
      : b.interestRate;

    return { ...b, totalInv, totalRet, investorCount, profitedInvestorsCount, activeInvsCount: bizInvs.length - completedInvs.length, completedInvsCount: completedInvs.length, avgReturnPct };
  });

  const topInvested = [...businessesWithStats].filter(b => b.totalInv > 0).sort((a, b) => b.totalInv - a.totalInv).slice(0, 5);
  const topBacked = [...businessesWithStats].filter(b => b.investorCount > 0).sort((a, b) => b.investorCount - a.investorCount).slice(0, 5);
  const topEarners = [...businessesWithStats].filter(b => b.totalRet > 0).sort((a, b) => b.totalRet - a.totalRet).slice(0, 5);
  
  const untappedBusinesses = businessesWithStats.filter(b => b.totalInv === 0);
  const newlyListed = [...businessesWithStats].filter(b => b.totalInv < b.fundingRequired * 0.5).reverse().slice(0, 8); 
  const yieldSortedBusinesses = [...businessesWithStats].sort((a, b) => a.interestRate - b.interestRate);
  
  const blueTickBusinessIds = getBlueTickBusinessIds(state.businesses, state.investments);

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
        expectedProfitToPay += expectedProfit;
      }
    });

    const fundingData = [
      { name: 'Funded', value: totalInvested, color: '#10B981' },
      { name: 'Remaining', value: fundingRemaining, color: '#E5E7EB' }
    ];

    const profitData = [
      { name: 'Profit Paid', value: actualProfitPaid, color: '#3B82F6' },
      { name: 'Expected', value: expectedProfitToPay, color: '#F59E0B' }
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-xl text-black flex items-center space-x-1">
                  <span>{business.name}</span>
                  {blueTickBusinessIds.has(business.id) && <BadgeCheck size={20} className="text-blue-500" title="RMAS Verified" />}
                </h3>
              </div>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5 tracking-wide uppercase">
                {business.ownerName} &bull; {business.businessId}
              </p>
            </div>
            <button 
              onClick={() => setSelectedBusiness(null)}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-5 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Investors</p>
                 <p className="text-2xl font-black text-black">{bizStats?.investorCount || 0}</p>
                 <p className="text-[10px] text-gray-500 mt-1">Unique individuals</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                 <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Active Investments</p>
                 <p className="text-2xl font-black text-blue-700">{bizStats?.activeInvsCount || 0}</p>
                 <p className="text-[10px] text-blue-600 mt-1">Currently running</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                 <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-1">Profited Investors</p>
                 <p className="text-2xl font-black text-green-700">{bizStats?.profitedInvestorsCount || 0}</p>
                 <p className="text-[10px] text-green-600 mt-1">Successfully paid out</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                 <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Avg. Return</p>
                 <p className="text-2xl font-black text-amber-700">{bizStats?.avgReturnPct.toFixed(1)}%</p>
                 <p className="text-[10px] text-amber-600 mt-1">Historical rate</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h4 className="font-bold text-black mb-4 text-center text-sm">
                  Funding Progress ({fundingPercentage.toFixed(1)}%)
                </h4>
                <div className="h-48">
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

              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h4 className="font-bold text-black mb-4 text-center text-sm">
                  Profit Distribution Status
                </h4>
                <div className="h-48">
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

            <div className={`bg-gray-900 text-white p-5 rounded-lg relative overflow-hidden`}>
              <div className="relative z-10">
                <h4 className="font-bold text-sm mb-2 flex items-center space-x-2">
                  <Lightbulb size={16} className={blueTickBusinessIds.has(business.id) ? "text-blue-400 flex-shrink-0" : "text-amber-400 flex-shrink-0"} />
                  <span>RMAS Advisory Summary</span>
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-black tracking-tight">Data Analysis & Advisory</h2>
          <p className="text-xs text-gray-500 mt-1">Deep insights into cross-business performance. Use this to guide investors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Most Popular */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-black flex items-center space-x-2">
              <Target size={18} className="text-blue-500" />
              <span>Most Popular (Top Invested)</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Businesses with the highest capital invested.</p>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {topInvested.length > 0 ? topInvested.map(b => (
              <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="p-3 hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center group">
                <div className="min-w-0 pr-2">
                   <h4 className="font-bold text-sm text-black group-hover:text-blue-700 truncate flex items-center space-x-1">
                     <span>{b.name}</span>
                     {blueTickBusinessIds.has(b.id) && <BadgeCheck size={14} className="text-blue-500" />}
                   </h4>
                   <p className="text-[10px] text-gray-500 mt-0.5">{b.investorCount} Investors</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-blue-700">{formatINR(b.totalInv)}</p>
                </div>
              </div>
            )) : <div className="p-4 text-center text-sm text-gray-500">No data available</div>}
          </div>
        </div>

        {/* Most Backed */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-black flex items-center space-x-2">
              <Users size={18} className="text-purple-500" />
              <span>Most Backed (By Investors)</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Businesses trusted by the highest number of unique people.</p>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {topBacked.length > 0 ? topBacked.map(b => (
              <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="p-3 hover:bg-purple-50 cursor-pointer transition-colors flex justify-between items-center group">
                <div className="min-w-0 pr-2">
                   <h4 className="font-bold text-sm text-black group-hover:text-purple-700 truncate flex items-center space-x-1">
                     <span>{b.name}</span>
                     {blueTickBusinessIds.has(b.id) && <BadgeCheck size={14} className="text-blue-500" />}
                   </h4>
                   <p className="text-[10px] text-gray-500 mt-0.5">{formatINR(b.totalInv)} Invested</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-purple-700">{b.investorCount}</p>
                  <p className="text-[9px] text-purple-600 uppercase">Investors</p>
                </div>
              </div>
            )) : <div className="p-4 text-center text-sm text-gray-500">No data available</div>}
          </div>
        </div>

        {/* Top Earners */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-black flex items-center space-x-2">
              <Trophy size={18} className="text-green-500" />
              <span>Top Earners (Most Profitable)</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Highest payouts successfully delivered back to investors.</p>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {topEarners.length > 0 ? topEarners.map(b => (
              <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="p-3 hover:bg-green-50 cursor-pointer transition-colors flex justify-between items-center group">
                <div className="min-w-0 pr-2">
                   <h4 className="font-bold text-sm text-black group-hover:text-green-700 truncate flex items-center space-x-1">
                     <span>{b.name}</span>
                     <BadgeCheck size={14} className="text-blue-500" />
                   </h4>
                   <p className="text-[10px] text-gray-500 mt-0.5">{b.profitedInvestorsCount} Profited Investors</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-green-700">{formatINR(b.totalRet)}</p>
                  <p className="text-[9px] text-green-600 uppercase">Total Payouts</p>
                </div>
              </div>
            )) : <div className="p-4 text-center text-sm text-gray-500">No data available</div>}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Untapped Potential */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
           <h3 className="font-bold text-black flex items-center space-x-2 mb-1">
             <PieChartIcon size={18} className="text-amber-500" />
             <span>Untapped Potential (0 Investments)</span>
           </h3>
           <p className="text-[11px] text-gray-500 mb-4">Complete fresh opportunities. Recommend these to early-bird investors.</p>
           
           <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
             {untappedBusinesses.length > 0 ? untappedBusinesses.map(b => (
               <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="p-3 border border-gray-100 hover:border-amber-300 rounded-lg cursor-pointer transition-colors hover:bg-amber-50">
                  <p className="font-bold text-sm text-black truncate mb-1">{b.name}</p>
                  <p className="text-xs font-bold text-amber-700">{b.interestRate}% Return</p>
               </div>
             )) : <div className="col-span-2 text-center text-sm text-gray-500 py-4">No untapped businesses left. Great!</div>}
           </div>
        </div>

        {/* Newly Listed Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-black flex items-center space-x-2 mb-1">
            <Clock size={18} className="text-gray-700" />
            <span>Newly Listed (Latest Additions)</span>
          </h3>
          <p className="text-[11px] text-gray-500 mb-4">The most recently added businesses on the platform.</p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {newlyListed.length > 0 ? newlyListed.map(b => (
              <div key={b.id} onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                 <div className="min-w-0 pr-3">
                    <p className="font-bold text-sm text-black truncate group-hover:text-blue-600 flex items-center space-x-1">
                      <span>{b.name}</span>
                      {blueTickBusinessIds.has(b.id) && <BadgeCheck size={14} className="text-blue-500" />}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">{b.ownerName}</p>
                 </div>
                 <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded">
                      {b.interestRate}% Return
                    </span>
                 </div>
              </div>
            )) : <div className="text-center text-sm text-gray-500 py-4">No recent listings.</div>}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-black flex items-center space-x-2 text-lg">
              <Info size={20} className="text-blue-500" />
              <span>Comprehensive Market Overview</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Complete list of all listed businesses organized by interest rate (lowest to highest risk-yield ratio).
            </p>
          </div>
        </div>
        
        <div className="overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Business</th>
                  <th className="p-4 font-bold">Base Interest</th>
                  <th className="p-4 font-bold text-right">Total Invested</th>
                  <th className="p-4 font-bold text-right">Total Payouts</th>
                  <th className="p-4 font-bold text-center">Active Investors</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {yieldSortedBusinesses.map(b => (
                  <tr 
                    key={`all_desk_${b.id}`} 
                    onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)}
                    className="hover:bg-blue-50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[10px] ${blueTickBusinessIds.has(b.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {b.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <p className="font-bold text-sm text-black group-hover:text-blue-700 truncate">{b.name}</p>
                            {blueTickBusinessIds.has(b.id) && <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" title="RMAS Verified" />}
                          </div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">{b.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded ${b.interestRate <= 10 ? 'bg-blue-50 text-blue-700' : b.interestRate <= 20 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                        {b.interestRate}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-sm text-gray-900">{formatINR(b.totalInv)}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className={`font-bold text-sm ${b.totalRet > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {b.totalRet > 0 ? formatINR(b.totalRet) : '-'}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center space-x-1">
                        <Users size={14} className="text-gray-400" />
                        <span className="font-bold text-black text-sm">{b.investorCount}</span>
                      </div>
                      {b.profitedInvestorsCount > 0 && (
                        <p className="text-[9px] text-green-600 mt-0.5 font-bold">{b.profitedInvestorsCount} Profited</p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {b.totalInv === 0 ? (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[9px] font-bold uppercase rounded tracking-wide">Untapped</span>
                      ) : b.totalRet > 0 ? (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[9px] font-bold uppercase rounded tracking-wide flex items-center justify-center space-x-1 w-max mx-auto"><BadgeCheck size={10} /> <span>Verified</span></span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-[9px] font-bold uppercase rounded tracking-wide">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden divide-y divide-gray-100">
            {yieldSortedBusinesses.map(b => (
              <div 
                key={`all_mob_${b.id}`}
                onClick={() => setSelectedBusiness(state.businesses.find(biz => biz.id === b.id) || null)}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${blueTickBusinessIds.has(b.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <p className="font-bold text-sm text-black">{b.name}</p>
                        {blueTickBusinessIds.has(b.id) && <BadgeCheck size={14} className="text-blue-500" />}
                      </div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{b.ownerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded ${b.interestRate <= 10 ? 'bg-blue-50 text-blue-700' : b.interestRate <= 20 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {b.interestRate}% Int.
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-gray-50 rounded-xl p-3">
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase mb-0.5">Total Invested</p>
                    <p className="font-bold text-sm text-gray-900">{formatINR(b.totalInv)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-medium uppercase mb-0.5">Total Payouts</p>
                    <p className={`font-bold text-sm ${b.totalRet > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {b.totalRet > 0 ? formatINR(b.totalRet) : '-'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between col-span-2 pt-2 border-t border-gray-200/60">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users size={12} />
                        <span className="font-bold text-xs">{b.investorCount} Active</span>
                      </div>
                      {b.profitedInvestorsCount > 0 && (
                        <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                          {b.profitedInvestorsCount} Profited
                        </span>
                      )}
                    </div>
                    <div>
                      {b.totalInv === 0 ? (
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Untapped</span>
                      ) : b.totalRet > 0 ? (
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center"><BadgeCheck size={12} className="mr-1" /> Verified</span>
                      ) : (
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Active</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {yieldSortedBusinesses.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm border-t border-gray-100">No businesses found.</div>
          )}
        </div>
      </div>

      {selectedBusiness && renderBusinessDetails(selectedBusiness)}
    </div>
  );
}

