export type AuthorityType =
  |"Government Authorities"
  |"Trust Authorities"
  |"Business Authorities";

export interface Business {
  id: string;
  businessId: string;
  name: string;
  shortName?: string;
  ownerName: string;
  description?: string;
  location?: string;
  photoUrl?: string;
  authorityType?: AuthorityType;
  rmasSubsidy?: number;
  entryFeePaid?: number;
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
  status:"pending" |"listed" |"funded";
}

export interface Investor {
  id: string;
  investorId: string;
  name: string;
  shortName?: string;
  totalInvested: number;
  entryFeePaid?: number;
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
  status:"active" |"completed" |"defaulted";
  payoutDetails?: {
    rmasCommission: number;
    happyIncomeTax: number;
    totalCredited: number;
    payoutDate: string;
    rmasMarketCover?: number;
    rmasSubsidyPays?: number;
    rmasPrematurePenalty?: number;
  };
}

export interface AppUser {
  id: string; // Firebase Auth UID
  name: string;
  shortName?: string;
  email: string;
  role: "CEO" | "EMPLOYEE" | "BUSINESS_OWNER" | "INVESTOR";
  fund?: number; // Optional fund tracking
}

export type View =
  |"dashboard"
  |"data-analysis"
  |"businesses"
  |"investors"
  |"investments"
  |"banking"
  |"pnl"
  |"bids"
  |"admin";

export interface CommissionSetting {
  type:"percentage" |"amount";
  value: number;
}

export interface GlobalSettings {
  newBusinessRegistration: CommissionSetting;
  newInvestorRegistration: CommissionSetting;
  investmentCommission: CommissionSetting;
  profitCommission: CommissionSetting;
  tax: CommissionSetting;
}
