import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { Investor, Investment } from '../types';
import { formatINR } from '../utils/mockData';
import { ArrowLeft, User, Save, X, Edit2, Wallet, FileText, ArrowDownRight, ArrowUpRight, Building2 } from 'lucide-react';

interface InvestorDetailProps {
  investorId: string;
  onBack: () => void;
}

export default function InvestorDetail({ investorId, onBack }: InvestorDetailProps) {
  const { state, dispatch } = useAppContext();
  const investor = state.investors.find(i => i.id === investorId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'details' | 'bank'>('details');
  const [editedName, setEditedName] = useState(investor?.name || '');

  if (!investor) return null;

  const handleSave = () => {
    if (editedName.trim() === '') return;
    dispatch({
      type: 'UPDATE_INVESTOR',
      payload: { ...investor, name: editedName.trim() }
    });
    setIsEditing(false);
  };

  const investorInvestments = state.investments
    .filter(inv => inv.investorId === investorId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const bankTransactions: { id: string, type: 'CREDIT' | 'DEBIT', amount: number, date: Date, title: string, description: string }[] = [];
  let totalSettled = 0;

  investorInvestments.forEach(inv => {
    const business = state.businesses.find(b => b.id === inv.businessId);
    
    // Debit: the investor pays money to invest
    bankTransactions.push({
      id: `debit-${inv.id}`,
      type: 'DEBIT',
      amount: inv.amount,
      date: new Date(inv.startDate),
      title: 'Investment Made',
      description: `To ${business?.name || 'Unknown'}`
    });
    

    if (inv.status === 'completed' && inv.payoutDetails) {
      const p = inv.payoutDetails;
      
      const rmasCover = p.rmasMarketCover || 0;
      const rmasSubsidy = p.rmasSubsidyPays || 0;
      
      const actualReceived = p.totalCredited + rmasCover + rmasSubsidy;

      if (actualReceived > 0) {
        bankTransactions.push({
          id: `credit-${inv.id}`,
          type: 'CREDIT',
          amount: actualReceived,
          date: new Date(p.payoutDate),
          title: 'Settlement Received',
          description: `From ${business?.name || 'Unknown'}`
        });
        totalSettled += actualReceived;
      }
    }
  });

  bankTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 animate-fade-in transition-all">
      <div className="flex items-center space-x-4 mb-4 md:mb-8 border-b border-kite-border pb-4 md:pb-0 md:border-0">
        <button onClick={onBack}
          className="p-2 hover:bg-kite-border rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-kite-text" />
        </button>
        <div className="flex-1">
          <p className="text-[13px] md:text-sm text-kite-text-light font-medium uppercase tracking-wider">My RMAS INC A/C</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-kite-border rounded-sm p-4 md:p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start space-x-4 w-full md:w-auto">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-kite-bg rounded-full flex items-center justify-center shrink-0 border border-kite-border">
                  <User className="w-6 h-6 md:w-8 md:h-8 text-kite-text-light" />
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-kite-text-light font-medium mb-1">Investor Name</label>
                        <input 
                          type="text" 
                          value={editedName}
                          onChange={e => setEditedName(e.target.value)}
                          className="w-full text-xl md:text-2xl font-medium text-kite-text border-b border-kite-border focus:border-kite-blue outline-none py-1 bg-transparent"
                          placeholder="Investor Name"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl md:text-3xl font-medium text-kite-text break-words">
                        {investor.name}
                      </h2>
                      <div className="flex items-center mt-2 text-kite-text-light text-sm flex-wrap gap-y-2">
                         <span className="font-mono bg-kite-bg px-2 py-0.5 rounded border border-kite-border/50 text-xs mr-4">#{investor.investorId}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-kite-border md:border-0">
                {!isEditing ? (
                  <div className="flex items-center space-x-2 w-full justify-between md:justify-end">
                    <button onClick={() => setViewMode(viewMode === 'bank' ? 'details' : 'bank')}
                      className={"flex-1 md:flex-none justify-center flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs md:text-sm font-medium border px-2 sm:px-3 py-1.5 md:py-2 rounded-sm transition-colors " + (viewMode === 'bank' ? 'bg-kite-blue/10 text-kite-blue border-kite-blue/30' : 'text-kite-text-light hover:text-kite-text border-kite-border bg-white hover:bg-kite-bg')}
                    >
                      <Wallet className="w-3 md:w-3.5 h-3 md:h-3.5 flex-shrink-0" />
                      <span>{viewMode === 'bank' ? 'Back to Details' : 'Bank Balance'}</span>
                    </button>
                    <button onClick={() => setIsEditing(true)}
                      className="flex-1 md:flex-none justify-center flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs md:text-sm font-medium text-kite-text-light hover:text-kite-text border border-kite-border px-2 sm:px-3 py-1.5 md:py-2 rounded-sm bg-white hover:bg-kite-bg transition-colors"
                    >
                      <Edit2 className="w-3 md:w-3.5 h-3 md:h-3.5 flex-shrink-0" />
                      <span>Edit Details</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-white rounded-sm w-full md:w-auto justify-end">
                    <button onClick={handleSave} className="flex-1 md:flex-none justify-center flex items-center space-x-1 text-sm font-medium text-kite-green hover:text-green-700 bg-kite-green/10 px-3 py-1.5 rounded-sm transition-colors border border-transparent">
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none justify-center flex items-center space-x-1 text-sm font-medium text-kite-red hover:text-red-700 bg-kite-red/10 px-3 py-1.5 rounded-sm transition-colors border border-transparent">
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {viewMode === 'bank' ? (
              <div className="w-full animate-fade-in min-h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-8">
                  <div className="p-4 border-l-4 border-kite-blue bg-kite-bg/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-kite-text-light mb-3 flex items-center space-x-1">
                       <Building2 className="w-3 h-3" />
                       <span>Registered Bank Details</span>
                    </h4>
                    {investor.bankDetails ? (
                      <div className="space-y-1 mt-2">
                        <p className="font-semibold text-kite-text text-sm">{investor.bankDetails.bankName}</p>
                        <p className="font-mono text-kite-text-light text-sm tracking-widest">{investor.bankDetails.accountNumber}</p>
                        <p className="font-mono text-kite-text-light text-sm">IFSC: {investor.bankDetails.ifscCode}</p>
                        <p className="text-xs uppercase font-medium text-kite-text-light mt-2 pt-2 border-t border-kite-border">{investor.bankDetails.accountHolderName}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-kite-text-light">No bank connected yet.</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center items-start md:items-end p-4">
                    <p className="text-xs text-kite-text-light mb-1">Total Settled Amount</p>
                    <p className={"text-2xl md:text-3xl font-medium tracking-tight " + "text-kite-blue"} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {formatINR(totalSettled)}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-xl font-medium text-kite-text mb-4">
                    Statement
                  </h4>
                  {bankTransactions.length > 0 ? (
                    <div className="overflow-x-auto border border-kite-border/50 rounded-sm">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-kite-bg">
                          <tr className="text-[10px] uppercase tracking-wider text-kite-text-light border-b border-kite-border/50">
                            <th className="py-2.5 px-4 font-normal">Date</th>
                            <th className="py-2.5 px-4 font-normal">Particulars</th>
                            <th className="py-2.5 px-4 text-right font-normal">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-kite-border/50 bg-white">
                          {bankTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-kite-bg/30 transition-colors">
                              <td className="py-3 px-4 text-xs text-kite-text-light">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td className="py-3 px-4">
                                <p className="text-sm text-kite-text">{tx.title}</p>
                                <p className="text-[11px] text-kite-text-light mt-0.5">{tx.description}</p>
                              </td>
                              <td className={"py-3 px-4 text-right text-sm " + (tx.type === 'CREDIT' ? 'text-kite-green' : 'text-kite-text')} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                                {tx.type === 'CREDIT' ? '+' : '-'}{formatINR(tx.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-kite-text-light text-sm border border-kite-border/50 rounded-sm">
                      No transactions recorded yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          {viewMode !== 'bank' && (
            <div className="bg-white border border-kite-border rounded-sm p-2 md:p-4 mt-6">
              <h3 className="text-xs md:text-base font-medium text-kite-text flex justify-between items-center mb-4">
                <span>Investment Portfolio</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-kite-bg border-b border-kite-border text-[10px] uppercase tracking-wider text-kite-text-light">
                    <tr>
                      <th className="p-2 md:p-4 font-medium">Business</th>
                      <th className="p-2 md:p-4 font-medium">Principal</th>
                      <th className="p-2 md:p-4 font-medium">Interest</th>
                      <th className="p-2 md:p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {investorInvestments.length > 0 ? investorInvestments.map(inv => {
                    const business = state.businesses.find(b => b.id === inv.businessId);
                    return (
                      <tr key={inv.id} className="border-b border-kite-border hover:bg-kite-bg text-xs md:text-sm">
                        <td className="p-2 md:p-4 font-medium text-kite-text">{business?.name || 'Unknown'}</td>
                        <td className="p-2 md:p-4 font-medium text-kite-text">{formatINR(inv.amount)}</td>
                        <td className="p-2 md:p-4 font-medium text-kite-green">{inv.interestRate}%</td>
                        <td className="p-2 md:p-4">
                          <span className={"inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm text-[10px] md:text-xs font-medium " + (inv.status === 'active' ? "bg-kite-blue/20 text-kite-blue" : inv.status === 'completed' ? "bg-kite-green/20 text-kite-green" : "bg-kite-red/20 text-kite-red")}>
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-kite-text-light">
                        No investments found.
                      </td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-kite-border rounded-sm p-4">
            <h3 className="text-xs uppercase tracking-wider text-kite-text-light font-medium mb-4">Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-kite-text-light mb-1">Total Invested (Lifetime)</p>
                <p className="text-lg font-medium text-kite-text">{formatINR(investor.totalInvested)}</p>
              </div>
              <div className="pt-4 border-t border-kite-border">
                <p className="text-xs text-kite-text-light mb-1">Active Portfolio Value</p>
                <p className="text-lg font-medium text-kite-blue">
                  {formatINR(investorInvestments.filter(i => i.status === 'active').reduce((acc, inv) => acc + inv.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
