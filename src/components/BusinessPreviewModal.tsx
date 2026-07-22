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

const BlueVerifiedBadge = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-label="Verified" className="inline-block ml-1 -mt-0.5">
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.838 3.45-.038.225-.06.456-.06.69 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25.52 1.333 1.828 2.25 3.337 2.25 1.51 0 2.816-.917 3.337-2.25.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.234-.022-.465-.06-.69 1.098-.704 1.838-1.99 1.838-3.45z" fill="#1DA1F2"/>
    <path d="M15.42 8.783L10.33 14.1l-2.45-2.45c-.322-.322-.843-.322-1.165 0-.322.32-.322.84 0 1.16l3.03 3.03c.16.16.37.24.58.24.21 0 .42-.08.58-.24l5.67-6.07c.32-.32.31-.84-.01-1.16-.32-.32-.84-.31-1.16.01z" fill="#FFFFFF"/>
  </svg>
);

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
                <p className="text-[12px] md:text-[13px] text-kite-text-light tracking-wide">
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

            {business.companyInfo && (
              <div className="mb-6 space-y-4">
                {business.companyInfo.companyName && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Company Name</h3>
                    <p className="text-[13px] md:text-[14px] text-kite-text">{business.companyInfo.companyName}</p>
                  </div>
                )}
                {business.companyInfo.ownerName && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Owner Name</h3>
                    <p className="text-[13px] md:text-[14px] text-kite-text">{business.companyInfo.ownerName}</p>
                  </div>
                )}
                {business.companyInfo.since && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Since</h3>
                    <p className="text-[13px] md:text-[14px] text-kite-text">{business.companyInfo.since}</p>
                  </div>
                )}
                {business.companyInfo.documents && business.companyInfo.documents.length > 0 && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Documents</h3>
                    <ul className="space-y-1">
                      {business.companyInfo.documents.map((doc, idx) => (
                        <li key={idx} className="text-[13px] md:text-[14px] text-kite-text flex items-center gap-1.5">
                          {doc} <BlueVerifiedBadge />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {business.companyInfo.governmentRegIdentifies && business.companyInfo.governmentRegIdentifies.length > 0 && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Government Reg Identifies</h3>
                    <ul className="space-y-1">
                      {business.companyInfo.governmentRegIdentifies.map((id, idx) => (
                        <li key={idx} className="text-[13px] md:text-[14px] text-kite-text flex items-center gap-1.5">
                          {id} <BlueVerifiedBadge />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {business.companyInfo.companyInformation && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Company Information</h3>
                    <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.companyInformation} onMentionClick={onMentionClick} /></p>
                  </div>
                )}
                {business.companyInfo.profitRevenueInvest && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Profit Revenue & Invest</h3>
                    <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.profitRevenueInvest} onMentionClick={onMentionClick} /></p>
                  </div>
                )}
                {business.companyInfo.investmentIdea && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Investments Idea</h3>
                    <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.investmentIdea} onMentionClick={onMentionClick} /></p>
                  </div>
                )}
                {business.companyInfo.companyShareHolder && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Company Share Holder</h3>
                    <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.companyShareHolder} onMentionClick={onMentionClick} /></p>
                  </div>
                )}
                {business.companyInfo.companyAddress && (
                  <div>
                    <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Company Address</h3>
                    <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.companyAddress} onMentionClick={onMentionClick} /></p>
                  </div>
                )}
              </div>
            )}
            
            {!business.companyInfo && business.description && (
              <div className="mb-6">
                <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed">
                  <BioRenderer bio={business.description} onMentionClick={onMentionClick} />
                </p>
              </div>
            )}
            
            {!business.companyInfo && business.location && (
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
