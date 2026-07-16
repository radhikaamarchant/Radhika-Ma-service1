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
  investmentType?: 'manual' | 'trigger';
  triggerAmount?: number;
  triggerMinQuantity?: number;
  triggerMaxQuantity?: number;
  triggerHistory?: { id: string; amount: number; timestamp: string }[];
}

export interface Investor {
  id: string;
  investorId: string;
  name: string;
  shortName?: string;
  photoUrl?: string;
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
  bio?: string;
  address?: {
    flatHouse?: string;
    residentHouseName?: string;
    landmark?: string;
    city?: string;
    state?: string;
  };
}

export interface Investment {
  id: string;
  businessId: string;
  investorId: string;
  amount: number;
  quantity?: number;
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
  photoUrl?: string;
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

export interface DailyMarketTiming {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface GlobalSettings {
  newBusinessRegistration: CommissionSetting;
  newInvestorRegistration: CommissionSetting;
  investmentCommission: CommissionSetting;
  profitCommission: CommissionSetting;
  tax: CommissionSetting;
  marketTiming?: {
    openTime: string;
    closeTime: string;
    days?: {
      monday: DailyMarketTiming;
      tuesday: DailyMarketTiming;
      wednesday: DailyMarketTiming;
      thursday: DailyMarketTiming;
      friday: DailyMarketTiming;
      saturday: DailyMarketTiming;
      sunday: DailyMarketTiming;
      [key: string]: DailyMarketTiming | undefined;
    };
  };
}
