import fs from 'fs';

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// Replace the withdraw-calc view
const withdrawCalcRegex = /\{viewMode === 'withdraw-calc'[\s\S]*?\{viewMode === 'withdraw-bank'/;

const newWithdrawCalc = `{viewMode === 'withdraw-calc' && selectedInvestments.length > 0 && selectedInvestor && (
 <div className="w-full max-w-lg mx-auto bg-white border border-gray-100 rounded md:rounded-md p-4 shadow-sm">
 <div className="border-b border-gray-100 pb-3 mb-4">
 <div className="flex justify-between items-start">
 <div>
 <h3 className="text-blue-600 font-medium text-sm md:text-base tracking-wide flex items-center gap-1">
 <CreditCard className="w-4 h-4" /> PROFIT BOOK
 </h3>
 <p className="text-gray-500 text-xs mt-1">{selectedInvestor.name} • {state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.name} • {selectedInvestments.length} Qty</p>
 </div>
 <div className="text-right">
 <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Inv Amt</span>
 <span className="font-semibold text-sm text-gray-800">{formatINR(selectedInvestments.reduce((s, i) => s + i.amount, 0))}</span>
 </div>
 </div>
 </div>

 <form onSubmit={e => { e.preventDefault(); goToBanking(); }} className="space-y-4">
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Committed Term</label>
 <input type="number" readOnly className="w-full border-b border-gray-200 py-1.5 text-sm outline-none text-gray-400 bg-transparent" value={withdrawFormData.committedMonths} />
 </div>
 <div>
 <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Completed Term</label>
 <input type="number" required className="w-full border-b border-blue-500 py-1.5 text-sm outline-none font-medium bg-transparent focus:border-blue-600" value={withdrawFormData.completedMonths} onChange={e => setWithdrawFormData({...withdrawFormData, completedMonths: e.target.value})} />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 pb-2">
 <div>
 <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">RMAS Comm (₹)</label>
 <input type="number" required className="w-full border-b border-gray-300 py-1.5 text-sm outline-none font-medium bg-transparent focus:border-blue-500 text-gray-800" value={withdrawFormData.rmasCommission} onChange={e => setWithdrawFormData({...withdrawFormData, rmasCommission: e.target.value})} placeholder="e.g. 5000" />
 </div>
 <div>
 <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Income Tax (₹)</label>
 <input type="number" required className="w-full border-b border-gray-300 py-1.5 text-sm outline-none font-medium bg-transparent focus:border-red-500 text-red-500" value={withdrawFormData.happyIncomeTax} onChange={e => setWithdrawFormData({...withdrawFormData, happyIncomeTax: e.target.value})} placeholder="e.g. 2000" />
 </div>
 </div>

 <div className="bg-gray-50 rounded p-3 text-xs border border-gray-100 flex flex-col gap-1.5">
 <div className="flex justify-between items-center text-gray-600">
 <span>P&L Current Trend:</span>
 <span className={calculateProfit().marketTrend >= 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
 {calculateProfit().marketTrend > 0 ? '+' : ''}{calculateProfit().marketTrend.toFixed(2)}%
 </span>
 </div>
 <div className="flex justify-between items-center text-gray-600">
 <span>Net Yield:</span>
 <span className={calculateProfit().totalProfit < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
 {calculateProfit().totalProfit < 0 ? '-' : '+'}{formatINR(Math.abs(calculateProfit().totalProfit))}
 </span>
 </div>
 </div>

 <div className="flex justify-between items-center pt-3 border-t border-gray-100">
 <div className="text-gray-500 text-[10px] uppercase tracking-wider">Gross Payable</div>
 <div className="font-semibold text-gray-900 flex items-center gap-2">Final Amt <span className="text-blue-600 text-lg">{formatINR(calculateFinalPayout())}</span></div>
 </div>

 <div className="mt-4 flex flex-col items-center mx-auto w-full max-w-[280px]">
 <SwipeButton 
 text="SWIPE TO PROCEED" 
 successText="SETTING UP..." 
 colorClass="bg-blue-600" 
 bgClass="bg-gray-100" 
 onSuccess={goToBanking} 
 className="w-full"
 />
 </div>
 </form>
 </div>
 )}

 {viewMode === 'withdraw-bank'`;

content = content.replace(withdrawCalcRegex, newWithdrawCalc);

// Now replace withdraw-bank
const withdrawBankRegex = /\{viewMode === 'withdraw-bank'[\s\S]*?\{viewMode === 'banking-record'/;

const newWithdrawBank = `{viewMode === 'withdraw-bank' && selectedInvestments.length > 0 && selectedInvestor && (
 <div className="w-full max-w-lg mx-auto bg-white border border-gray-100 rounded md:rounded-md p-4 shadow-sm">
 <div className="text-center mb-6">
 <h3 className="text-blue-600 font-medium text-sm md:text-base tracking-wide flex items-center justify-center gap-2">
 <CreditCard className="w-4 h-4" /> SETTLEMENT
 </h3>
 <p className="text-gray-500 text-xs mt-1">Confirm final banking settlement details.</p>
 </div>

 <div className="space-y-4">
 {/* Debit Side (Business) */}
 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
 <div className="flex items-center gap-3">
 <div className="w-6 h-6 rounded-sm bg-red-100 flex items-center justify-center font-medium text-red-600 text-[10px]">DR</div>
 <div>
 <p className="text-xs font-semibold text-gray-800">{state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails?.bankName || 'No Bank Details'}</p>
 <p className="text-[10px] text-gray-500">A/C: *{String(state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails?.accountNumber || '').slice(-4)}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-xs text-red-500 font-medium">-{formatINR(calculateFinalPayout())}</p>
 </div>
 </div>

 {/* Credit Side (Investor) */}
 <div className="flex items-center justify-between border-b border-gray-100 pb-3 pt-1">
 <div className="flex items-center gap-3">
 <div className="w-6 h-6 rounded-sm bg-green-100 flex items-center justify-center font-medium text-green-600 text-[10px]">CR</div>
 <div>
 <p className="text-xs font-semibold text-gray-800">{selectedInvestor.bankDetails.bankName || 'No Bank Details'}</p>
 <p className="text-[10px] text-gray-500">A/C: *{String(selectedInvestor.bankDetails.accountNumber || '').slice(-4)}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-xs text-green-600 font-medium">+{formatINR(calculateFinalPayout())}</p>
 </div>
 </div>
 </div>

 <div className="mt-8 flex flex-col items-center justify-center space-y-4">
 <div className="w-full max-w-[280px]">
 <SwipeButton 
 text="SWIPE TO PAY" 
 successText="SETTLING..." 
 colorClass="bg-blue-600"
 bgClass="bg-blue-50"
 onSuccess={handlePay} 
 className="w-full"
 />
 </div>
 <button onClick={() => setViewMode('withdraw-calc')} className="px-6 py-2 rounded font-medium text-gray-400 hover:text-gray-600 transition-colors text-xs">Cancel / Modify</button>
 </div>
 </div>
 )}

 {viewMode === 'banking-record'`;

content = content.replace(withdrawBankRegex, newWithdrawBank);

fs.writeFileSync('src/pages/Investors.tsx', content, 'utf8');
