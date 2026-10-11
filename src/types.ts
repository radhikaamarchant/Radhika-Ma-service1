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
  increaseMarket?: number;
  downMarket?: number;
  triggerHistory?: { id: string; amount: number; timestamp: string }[];
  companyInfo?: {
    companyName: string;
    ownerName: string;
    since: string;
    documents: string[];
    governmentRegIdentifies: string[];
    companyInformation: string;
    profitRevenueInvest: string;
    investmentIdea: string;
    companyShareHolder: string;
    companyAddress: string;
  };
  addedFunds?: { id: string; amount: number; date: string; }[];
  profitLimitMode?: "manual" | "percentage";
  profitLimitPercentage?: number;
  subsidyYojna?: SubsidyYojnaData;
}

export interface SubsidyDocumentItem {
  boxIndex: number;
  value: string;
  prefix: string;
  fullName: string;
  isVerified: boolean;
}

export interface SubsidySecurityChecks {
  takeResponsibility: boolean;
  trustCompany: boolean;
  monthlyVisit: boolean;
  helpedInvestors: boolean;
  profitAppropriate: boolean;
}

export interface SubsidyYojnaData {
  subsidyNumber: string; // 12-digit number e.g. "849201948291"
  appliedDate: string;
  sanctionDate: string;
  status: "ACTIVE" | "CANCELLED";
  
  // Page 1: Basic Info & Eligibility
  companyTradeRegister: string;
  ownership: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  documents: SubsidyDocumentItem[];
  businessPurpose: "PRIVATE LIMITED" | "GOVERNMENT AUTHORITIES";
  
  // Financial statistics
  totalInvestedLifetime: number;
  currentInvestedAmount: number;
  pastReturnsPaid: number;
  currentReturnsPending: number;
  pastOwnerProfit: number;
  currentOwnerProfit: number;
  pastBrokeragePaid: number;
  currentBrokeragePayable: number;
  
  // Page 2: Radhika Brokerage Security
  exchangeBroker: string;
  founderName: string;
  securityChecks: SubsidySecurityChecks;
  applicantName: string;
  consenterName: string;
  applicationDate: string;
  feeAmount: number;
  
  // Page 3: Sanction Details
  sanctionProviderName: string;
  sanctionProviderTitle: string;
  subsidyPercentage: number;
  eligibleCategory: string;
  isEligible: boolean;
  grossPayable: number;
  subsidyAmount: number;
  netPayableAfterSubsidy: number;
  totalSaved: number;
  
  // Previous Records Slip Attachment
  attachedPreviousRecords?: SubsidyInvestorSlipRecord[];
  isPreviousRecordAttached?: boolean;
}

export interface SubsidyInvestorSlipRecord {
  id?: string;
  investorName: string;
  investAmount: number;
  profitAmount: number;
  capitalPercentage: number;
  profitBookPercentage: number;
  taxPaid: number;
  brokeragePaid: number;
  totalTaxBrokerage: number;
  settlementDate?: string;
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
  availableMargin?: number;
  fundHistory?: { id: string; amount: number; type: "ADD" | "WITHDRAW"; date: string; category?: string; description?: string; }[];
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
  id: string; // Firebase Auth UID or custom ID
  userId?: string; // e.g., RMAS109
  password?: string;
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
  inactivityTax?: {
    enabled: boolean;
    durationType: "hours" | "days";
    hourlyAmount: number;
    hoursThreshold: number;
    dailyAmount: number;
    daysThreshold: number;
  };
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

export interface Employee {
  id: string;
  empId: string;
  fullName: string;
  role: string;
  salaryType: "Daily Wage" | "Monthly Salary";
  salaryAmount: number;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
  };
  status: "Active" | "Inactive";
  assignedInvestors: string[];
  assignedBusinesses: string[];
  ledger: {
    id: string;
    date: string;
    amount: number;
    deductedFrom: string;
    accountNumber: string;
  }[];
}
