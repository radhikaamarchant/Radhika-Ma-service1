export type AuthorityType = 'Government Authorities' | 'Trust Authorities' | 'Business Authorities';

export interface Business {
  id: string;
  businessId: string;
  name: string;
  ownerName: string;
  authorityType?: AuthorityType;
  rmasSubsidy?: number;
  registrationDate: string;
  fundingRequired: number;
  interestRate: number; // dynamically set by admin
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  registrationFee?: number;
  registrationCommissionPaid: number;
  taxPaid: number;
  status: 'pending' | 'listed' | 'funded';
}

export interface Investor {
  id: string;
  investorId: string;
  name: string;
  totalInvested: number;
  joinDate: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  rmasServiceCharge: number;
}

export interface Investment {
  id: string;
  businessId: string;
  investorId: string;
  amount: number;
  timePeriodMonths: number;
  interestRate: number; // applied rate
  startDate: string;
  endDate: string;
  adminCommissionInvestor: number; // commission from investor
  adminCommissionBusiness: number; // commission from business upon funding
  status: 'active' | 'completed' | 'defaulted';
  payoutDetails?: {
    rmasCommission: number;
    happyIncomeTax: number;
    totalCredited: number;
    payoutDate: string;
  };
}

export type View = 'dashboard' | 'data-analysis' | 'businesses' | 'investors' | 'investments' | 'banking' | 'pnl';
