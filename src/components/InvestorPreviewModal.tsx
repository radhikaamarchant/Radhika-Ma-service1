import React from 'react';
import { Investor, Business, Investment } from '../types';
import { getUnifiedBankBalance } from '../utils/bankBalance';
import { formatINR } from '../utils/mockData';
import { X } from 'lucide-react';
import BioRenderer from './BioRenderer';

interface InvestorPreviewModalProps {
  investor: Investor;
  onClose: () => void;
  businesses: Business[];
  investors: Investor[];
  investments: Investment[];
  settings: any;
  onMentionClick?: (type: 'business' | 'investor', id: string, data: any) => void;
}

export default function InvestorPreviewModal({
  investor,
  onClose,
  businesses,
  investors,
  investments,
  settings,
  onMentionClick
}: InvestorPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pb-20 md:p-8 animate-fade-in"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[80vh] md:max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full z-[101]"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        {/* Left side - Image */}
        <div className="w-full md:w-1/2 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center min-h-[300px] md:min-h-0 md:h-auto relative shrink-0 border-b md:border-b-0 md:border-r border-kite-border">
          {investor.photoUrl ? (
            <img
              src={investor.photoUrl}
              alt={investor.name}
              className="w-full h-full object-contain absolute inset-0 p-2 md:p-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-kite-blue/10 dark:bg-kite-blue/20 text-kite-blue flex items-center justify-center overflow-hidden border border-kite-border-soft">
              <span className="text-4xl font-normal">{(investor.shortName || investor.name)?.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>
        
        {/* Right side - Information */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-white dark:bg-kite-bg flex-1">
          <h2 className="text-[18px] md:text-[22px] font-medium text-kite-text mb-1">{investor.name?.toUpperCase()}</h2>
          <p className="text-[12px] md:text-[13px] text-kite-text-light mb-6 tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            #{investor.investorId}
          </p>
          
          {investor.bio && (
            <div className="mb-6">
              <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed">
                <BioRenderer bio={investor.bio} onMentionClick={onMentionClick} />
              </p>
            </div>
          )}
          
          {investor.address && (investor.address.flatHouse || investor.address.residentHouseName || investor.address.landmark || investor.address.city || investor.address.state) && (
            <div className="mb-6">
              <div className="text-[13px] md:text-[14px] text-kite-text space-y-1">
                {investor.address.flatHouse && <p>{investor.address.flatHouse}</p>}
                {investor.address.residentHouseName && <p>{investor.address.residentHouseName}</p>}
                {investor.address.landmark && <p>{investor.address.landmark}</p>}
                {(investor.address.city || investor.address.state) && (
                  <p>
                    {investor.address.city}{investor.address.city && investor.address.state ? ', ' : ''}{investor.address.state}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-kite-border">
            <div className="bg-kite-bg dark:bg-kite-surface p-4 rounded-sm border border-kite-border">
              <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Available Balance</h3>
              <p className={"text-[15px] md:text-[17px] font-medium " + ((() => {
                const balance = getUnifiedBankBalance(
                  investor.name,
                  businesses,
                  investors,
                  investments,
                  settings,
                );
                return balance >= 0 ? "text-kite-blue" : "text-kite-red";
              })())}>
                {(() => {
                  const balance = getUnifiedBankBalance(
                    investor.name,
                    businesses,
                    investors,
                    investments,
                    settings,
                  );
                  return (balance >= 0 ? "" : "-") + formatINR(Math.abs(balance));
                })()}
              </p>
            </div>
            
            <div className="bg-kite-bg dark:bg-kite-surface p-4 rounded-sm border border-kite-border">
              <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Total Invested</h3>
              <p className="text-[15px] md:text-[17px] font-medium text-kite-text">
                {(() => {
                  const activeInvs = investments.filter(
                    (inv) => inv.investorId === investor.id && inv.status !== "completed"
                  );
                  let totalAmountInvested = activeInvs.reduce((sum, inv) => sum + inv.amount, 0);
                  
                  if (investor.id === "admin_investor") {
                    totalAmountInvested = getUnifiedBankBalance(
                      "Radhika M",
                      businesses,
                      investors,
                      investments,
                      settings,
                    );
                  }
                  
                  return formatINR(totalAmountInvested);
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
