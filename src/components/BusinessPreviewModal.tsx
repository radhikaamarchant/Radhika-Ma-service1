import React from 'react';
import { Business, Investor, Investment } from '../types';
import { formatINR } from '../utils/mockData';
import { X, BadgeCheck } from 'lucide-react';
import BioRenderer from './BioRenderer';

interface BusinessPreviewModalProps {
  business: Business;
  onClose: () => void;
  businesses: Business[];
  investors: Investor[];
  investments: Investment[];
  settings: any;
  onMentionClick?: (type: 'business' | 'investor', id: string, data: any) => void;
}

const formatCompactZerodha = (num: number) => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  if (absNum >= 10000000) {
    return (num / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
  }
  if (absNum >= 100000) {
    return (num / 100000).toFixed(2).replace(/\.00$/, '') + 'LK';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'K';
  }
  return num.toString();
};

export default function BusinessPreviewModal({
  business,
  onClose,
  businesses,
  investors,
  investments,
  settings,
  onMentionClick
}: BusinessPreviewModalProps) {
  const activeInvestments = investments.filter(inv => inv.businessId === business.id && inv.status === 'active');
  const uniqueInvestors = new Set(activeInvestments.map(inv => inv.investorId)).size;
  const totalRupeesInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const ownerProfit = investments.filter(inv => inv.businessId === business.id).reduce((sum, inv) => sum + (inv.amount * (business.interestRate || 0)) / 100, 0);

  const ownerAsInvestor = investors.find(i => i.name.toLowerCase() === business.ownerName?.toLowerCase());

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 pb-20 md:p-8 animate-fade-in"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] md:max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full z-[101]"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <div className="w-full p-6 md:p-8 overflow-y-auto bg-white dark:bg-kite-bg flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start space-x-4 md:space-x-5 mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 border border-kite-border-soft bg-kite-blue/10 dark:bg-kite-blue/20 flex items-center justify-center text-kite-blue">
                 {business.photoUrl ? (
                   <img src={business.photoUrl} className="w-full h-full object-cover" alt={business.name} />
                 ) : (
                   <span className="text-3xl font-normal">{(business.shortName || business.name)?.substring(0, 2).toUpperCase()}</span>
                 )}
              </div>
              <div className="pt-2 pr-8 md:pr-0">
                <h2 className="text-[18px] md:text-[22px] font-medium text-kite-text mb-1 leading-tight">{business.name?.toUpperCase()}</h2>
                <p className="text-[12px] md:text-[13px] text-kite-text-light tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  #{business.businessId}
                </p>
              </div>
            </div>

            {ownerAsInvestor ? (
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shrink-0 bg-kite-blue/10 dark:bg-kite-blue/20 flex items-center justify-center text-kite-blue">
                  {ownerAsInvestor.photoUrl ? (
                    <img src={ownerAsInvestor.photoUrl} className="w-full h-full object-cover" alt={ownerAsInvestor.name} />
                  ) : (
                    <span className="text-sm font-medium">{(ownerAsInvestor.shortName || ownerAsInvestor.name)?.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div>
                   <p className="text-[10px] md:text-[11px] text-kite-text-light font-medium">Owner</p>
                   <div className="flex items-center space-x-1">
                     <p className="text-[12px] md:text-[13px] text-kite-blue font-medium">{ownerAsInvestor.name}</p>
                     <BadgeCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-kite-blue" />
                   </div>
                </div>
              </div>
            ) : (
              <p className="text-[12px] md:text-[13px] text-kite-blue font-medium mb-6">Owner: {business.ownerName}</p>
            )}

            {business.description && (
              <div className="mb-6">
                <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed">
                  <BioRenderer bio={business.description} onMentionClick={onMentionClick} />
                </p>
              </div>
            )}
            
            {business.location && (
              <div className="mb-6">
                <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed text-kite-text-light">
                  {business.location}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-8 pt-6 border-t border-kite-border">
              <div className="bg-kite-bg dark:bg-kite-surface p-3 md:p-4 rounded-sm border border-kite-border">
                <h3 className="text-[9px] md:text-[10px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Investors</h3>
                <p className="text-[15px] md:text-[17px] font-medium text-kite-text">
                  {uniqueInvestors}
                </p>
              </div>
              
              <div className="bg-kite-bg dark:bg-kite-surface p-3 md:p-4 rounded-sm border border-kite-border">
                <h3 className="text-[9px] md:text-[10px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Invested</h3>
                <p className="text-[15px] md:text-[17px] font-medium text-kite-text">
                  {formatCompactZerodha(totalRupeesInvested)}
                </p>
              </div>

              <div className="bg-kite-bg dark:bg-kite-surface p-3 md:p-4 rounded-sm border border-kite-border col-span-2 lg:col-span-1">
                <h3 className="text-[9px] md:text-[10px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Owner Profit</h3>
                <p className="text-[15px] md:text-[17px] font-medium text-kite-blue">
                  {formatCompactZerodha(ownerProfit)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-kite-border-soft flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 opacity-70">
            <BadgeCheck className="w-4 h-4 text-kite-blue shrink-0" />
            <p className="text-[8px] md:text-[9px] font-medium text-kite-text-light uppercase tracking-widest text-center">
              NOTICE - RADHIKA MARCHANT ACCOUNT SERVICE VERFIED AUTHORITIES
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
