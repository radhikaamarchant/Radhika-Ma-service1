import React, { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Landmark, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Check
} from "lucide-react";
import { Business, SubsidyYojnaData, SubsidySecurityChecks } from "../types";
import { formatINR } from "../utils/mockData";
import { useAppContext } from "../utils/AppContext";

export const BlueVerifiedBadge = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-label="Verified" className="inline-block ml-1 shrink-0">
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.838 3.45-.038.225-.06.456-.06.69 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25.52 1.333 1.828 2.25 3.337 2.25 1.51 0 2.816-.917 3.337-2.25.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.234-.022-.465-.06-.69 1.098-.704 1.838-1.99 1.838-3.45z" fill="#1DA1F2"/>
    <path d="M15.42 8.783L10.33 14.1l-2.45-2.45c-.322-.322-.843-.322-1.165 0-.322.32-.322.84 0 1.16l3.03 3.03c.16.16.37.24.58.24.21 0 .42-.08.58-.24l5.67-6.07c.32-.32.31-.84-.01-1.16-.32-.32-.84-.31-1.16.01z" fill="#FFFFFF"/>
  </svg>
);

export const SUBSIDY_PREFIX_MAP: Record<string, { label: string; category: "DOCUMENT" | "GOV_REG" }> = {
  APN: { label: "ABDL PERMIT NUMBER", category: "DOCUMENT" },
  CPN: { label: "CITY PERMIT NUMBER", category: "DOCUMENT" },
  SPN: { label: "STATE PERMIT NUMBER", category: "DOCUMENT" },
  BMPN: { label: "BSE-MHL BHARAT STOCK EXCHANGE MARCHANT HELICATION LIBERTRY PERMIT NUMBER", category: "DOCUMENT" },
  PPN: { label: "PATHAN PERMIT NUMBER", category: "DOCUMENT" },
  PCCTPM: { label: "PATHAN COMUNITY CHERITABLE TRUST PERMIT NUMBER", category: "DOCUMENT" },
  BSPM: { label: "BAPS SANSTHA PERMIT NUMBER", category: "DOCUMENT" },
  SSPM: { label: "SWAMINARAYN SAMPARADAY PERMIT NUMBER", category: "DOCUMENT" },
  HTDELPN: { label: "HAPPY TAX DEPARTMENT ESLAMIC LERNER PERMIT NUMBER", category: "DOCUMENT" },

  GST: { label: "GOODS SERVICE TAX", category: "GOV_REG" },
  PAN: { label: "PANCARD", category: "GOV_REG" },
  MSME: { label: "MUSLIM SENCRO MAHUDAY ESLAMIC BUSSINESS", category: "GOV_REG" },
  ADHARD: { label: "ADHARCARD", category: "GOV_REG" },
  ADHAR: { label: "ADHARCARD", category: "GOV_REG" },
  HPGTCL: { label: "HAPPY GOVERMENT TAX CITY LIBERTRY", category: "GOV_REG" },
  HPGPRCT: { label: "HAPPY PRIMIE RULING CITY TAX", category: "GOV_REG" },
  PTHN: { label: "JAVED BHAI PATHAN DALAL CERTIFICATE", category: "GOV_REG" },
  ABDL: { label: "ABDUL BHAI PATHAN ADVOCATE CERTIFICATE", category: "GOV_REG" },
};

export function parseSubsidyDoc(val: string, business: Business): {
  prefix: string;
  fullName: string;
  isVerified: boolean;
} {
  const trimmed = val.trim();
  if (!trimmed) {
    return { prefix: "", fullName: "", isVerified: false };
  }

  const keys = Object.keys(SUBSIDY_PREFIX_MAP).sort((a, b) => b.length - a.length);
  const upperVal = trimmed.toUpperCase();
  
  let matchedKey = "";
  for (const k of keys) {
    const regex = new RegExp(`^${k}[-_\\s:]*`, "i");
    if (regex.test(trimmed) || upperVal.startsWith(k)) {
      matchedKey = k;
      break;
    }
  }

  const registeredDocs = [
    ...(business.companyInfo?.documents || []),
    ...(business.companyInfo?.governmentRegIdentifies || []),
  ];

  if (!matchedKey) {
    const foundDirect = registeredDocs.some(
      (d) => d.toUpperCase().includes(upperVal) || upperVal.includes(d.toUpperCase())
    );
    return {
      prefix: "",
      fullName: foundDirect ? "REGISTERED LEGAL IDENTIFIER" : "",
      isVerified: foundDirect,
    };
  }

  const prefixInfo = SUBSIDY_PREFIX_MAP[matchedKey];
  const isRegisteredInCompany = registeredDocs.some((d) => {
    const dUpper = d.toUpperCase();
    return dUpper.includes(matchedKey) || dUpper.includes(upperVal) || upperVal.includes(dUpper);
  });

  return {
    prefix: matchedKey,
    fullName: `${matchedKey} ${prefixInfo.label}`,
    isVerified: isRegisteredInCompany,
  };
}

interface SubsidyYojnaModalProps {
  business: Business;
  onClose: () => void;
  onSuccess: (updatedBusiness: Business) => void;
}

export default function SubsidyYojnaModal({ business, onClose, onSuccess }: SubsidyYojnaModalProps) {
  const { state, dispatch } = useAppContext();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State - Page 1
  const [companyTradeRegister, setCompanyTradeRegister] = useState(
    business.companyInfo?.companyName || business.name || ""
  );
  const [ownership, setOwnership] = useState(
    business.companyInfo?.ownerName || business.ownerName || ""
  );
  const [bankDetails, setBankDetails] = useState({
    bankName: business.bankDetails?.bankName || "State Bank of India",
    accountNumber: business.bankDetails?.accountNumber || "382910482910",
    ifscCode: business.bankDetails?.ifscCode || "SBIN0001824",
  });

  // 10 Document Slots initialized with existing company legal records
  const initialDocs = useMemo(() => {
    const registered = [
      ...(business.companyInfo?.documents || []),
      ...(business.companyInfo?.governmentRegIdentifies || []),
    ];
    const slots: string[] = Array(10).fill("");
    registered.slice(0, 10).forEach((doc, idx) => {
      slots[idx] = doc;
    });
    return slots;
  }, [business]);

  const [documentInputs, setDocumentInputs] = useState<string[]>(initialDocs);
  const [businessPurpose, setBusinessPurpose] = useState<"PRIVATE LIMITED" | "GOVERNMENT AUTHORITIES">(
    business.authorityType === "Government Authorities" ? "GOVERNMENT AUTHORITIES" : "PRIVATE LIMITED"
  );

  // Step 2 State - Radhika Brokerage Security Form
  const [securityChecks, setSecurityChecks] = useState<SubsidySecurityChecks>({
    takeResponsibility: true,
    trustCompany: true,
    monthlyVisit: true,
    helpedInvestors: false,
    profitAppropriate: true,
  });
  const [applicantName, setApplicantName] = useState(
    state.currentUser?.name || business.ownerName || "Applicant Officer"
  );
  const [consenterName, setConsenterName] = useState("Radhika Marchant");
  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [feeAmount, setFeeAmount] = useState<number>(5000);

  // Step 3 State - Subsidy Sanction & Calculations
  const [subsidyPercentage, setSubsidyPercentage] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial Statistics for this business
  const financials = useMemo(() => {
    const bizInvestments = state.investments.filter((i) => i.businessId === business.id);
    const activeInvestments = bizInvestments.filter((i) => i.status !== "completed");
    const completedInvestments = bizInvestments.filter((i) => i.status === "completed");

    const totalInvestedLifetime = bizInvestments.reduce((sum, i) => sum + i.amount, 0);
    const currentInvestedAmount = activeInvestments.reduce((sum, i) => sum + i.amount, 0);

    const pastReturnsPaid = completedInvestments.reduce(
      (sum, i) => sum + i.amount * ((i.interestRate || business.interestRate || 10) / 100),
      0
    );
    const currentReturnsPending = activeInvestments.reduce(
      (sum, i) => sum + i.amount * ((business.interestRate || 10) / 100),
      0
    );

    const pastOwnerProfit = Math.round(pastReturnsPaid * 0.45);
    const currentOwnerProfit = Math.round(currentReturnsPending * 0.45);

    const pastBrokeragePaid = completedInvestments.reduce(
      (sum, i) =>
        sum +
        (i.adminCommissionInvestor || 0) +
        (i.adminCommissionBusiness || 0) +
        (i.payoutDetails?.rmasCommission || 0) +
        (i.payoutDetails?.happyIncomeTax || 0),
      0
    );
    const currentBrokeragePayable = activeInvestments.reduce(
      (sum, i) =>
        sum +
        (i.adminCommissionInvestor || Math.round(i.amount * 0.02)) +
        (i.adminCommissionBusiness || Math.round(i.amount * 0.02)),
      0
    );

    const totalPlatformInvestors = state.investors.length || 1;
    const uniqueBizInvestors = new Set(bizInvestments.map((i) => i.investorId)).size;
    const investorParticipationRatio = (uniqueBizInvestors / totalPlatformInvestors) * 100;
    const investorReturnRatio = totalInvestedLifetime > 0 
      ? (pastReturnsPaid / totalInvestedLifetime) * 100 
      : business.interestRate || 65;

    return {
      totalInvestedLifetime,
      currentInvestedAmount,
      pastReturnsPaid,
      currentReturnsPending,
      pastOwnerProfit,
      currentOwnerProfit,
      pastBrokeragePaid,
      currentBrokeragePayable,
      investorReturnRatio,
      investorParticipationRatio,
      uniqueBizInvestors,
      totalPlatformInvestors,
    };
  }, [state.investments, state.investors, business]);

  // Checked Security affirmations count (must be >= 3)
  const checkedAffirmationsCount = useMemo(() => {
    return Object.values(securityChecks).filter(Boolean).length;
  }, [securityChecks]);

  // Eligibility evaluation
  const eligibility = useMemo(() => {
    if (businessPurpose === "PRIVATE LIMITED") {
      const isEligible = financials.investorReturnRatio >= 60 || business.interestRate >= 60 || financials.pastReturnsPaid > 0;
      return {
        isEligible: true,
        criteriaMet: isEligible,
        ruleText: "Investor Returns Exceeds 60% Requirement",
      };
    } else {
      const isEligible = financials.investorParticipationRatio >= 60 || financials.uniqueBizInvestors >= 2;
      return {
        isEligible: true,
        criteriaMet: isEligible,
        ruleText: "Investor Participation Exceeds 60% Threshold",
      };
    }
  }, [businessPurpose, financials, business]);

  // Subsidy relief breakdown
  const subsidyCalculation = useMemo(() => {
    const grossPayable =
      financials.currentInvestedAmount +
      financials.currentReturnsPending +
      financials.currentBrokeragePayable;
    
    const baseLiabilities = Math.max(
      10000,
      financials.currentReturnsPending + financials.currentBrokeragePayable + (financials.currentInvestedAmount * 0.1)
    );

    const subsidyAmount = Math.round(baseLiabilities * (subsidyPercentage / 100));
    const netPayableAfterSubsidy = Math.max(0, grossPayable - subsidyAmount);
    const totalSaved = subsidyAmount;

    return {
      grossPayable,
      subsidyAmount,
      netPayableAfterSubsidy,
      totalSaved,
    };
  }, [financials, subsidyPercentage]);

  // Valid parsed documents list
  const parsedDocsList = useMemo(() => {
    return documentInputs.map((val, idx) => {
      const parsed = parseSubsidyDoc(val, business);
      return {
        boxIndex: idx + 1,
        value: val,
        prefix: parsed.prefix,
        fullName: parsed.fullName,
        isVerified: parsed.isVerified,
      };
    });
  }, [documentInputs, business]);

  // Handle final confirmation of subsidy
  const handleConfirmSubsidy = async () => {
    setIsSubmitting(true);
    try {
      const random12Digit = Math.floor(100000000000 + Math.random() * 900000000000).toString();

      const newSubsidyData: SubsidyYojnaData = {
        subsidyNumber: random12Digit,
        appliedDate: applicationDate,
        sanctionDate: new Date().toISOString().split("T")[0],
        status: "ACTIVE",

        companyTradeRegister,
        ownership,
        bankDetails,
        documents: parsedDocsList.filter((d) => d.value.trim().length > 0),
        businessPurpose,

        totalInvestedLifetime: financials.totalInvestedLifetime,
        currentInvestedAmount: financials.currentInvestedAmount,
        pastReturnsPaid: financials.pastReturnsPaid,
        currentReturnsPending: financials.currentReturnsPending,
        pastOwnerProfit: financials.pastOwnerProfit,
        currentOwnerProfit: financials.currentOwnerProfit,
        pastBrokeragePaid: financials.pastBrokeragePaid,
        currentBrokeragePayable: financials.currentBrokeragePayable,

        exchangeBroker: "RADHIKA BROKERAGE TRADING PRIVATE LIMITED",
        founderName: "RADHIKA MARCHANT",
        securityChecks,
        applicantName,
        consenterName,
        applicationDate,
        feeAmount,

        sanctionProviderName: "RAHIMBHAI MUSTUFA PATHAN",
        sanctionProviderTitle: "HPG PRIME MINISTER",
        subsidyPercentage,
        eligibleCategory: businessPurpose,
        isEligible: eligibility.isEligible,
        grossPayable: subsidyCalculation.grossPayable,
        subsidyAmount: subsidyCalculation.subsidyAmount,
        netPayableAfterSubsidy: subsidyCalculation.netPayableAfterSubsidy,
        totalSaved: subsidyCalculation.totalSaved,
      };

      const updatedBusiness: Business = {
        ...business,
        subsidyYojna: newSubsidyData,
      };

      await dispatch({
        type: "UPDATE_BUSINESS",
        payload: updatedBusiness,
      });

      onSuccess(updatedBusiness);
    } catch (err) {
      console.error("Failed to sanction subsidy:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Modal container strictly placed right of the desktop sidebar so it never enters the left watchlist */
    <div className="fixed inset-0 md:left-[320px] lg:left-[410px] z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 overflow-y-auto font-sans">
      <div className="w-full max-w-4xl bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#2b2b2b] rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#222222] bg-[#FAFBFC] dark:bg-[#000000] flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 dark:text-[#E7E9EA] tracking-tight">
              Subcidy Yojna
            </h1>
            <p className="text-[13px] font-semibold text-[#1D9BF0]">
              happy tax department sahay yojna
            </p>
            <p className="text-[11px] text-gray-500 dark:text-[#71767B]">
              radhika private limited of exchange compny
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Steps indicator */}
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className={`px-2 py-0.5 rounded font-medium ${currentStep === 1 ? 'bg-[#1D9BF0] text-white' : 'text-gray-400'}`}>1</span>
              <span className="text-gray-300 dark:text-[#333333]">/</span>
              <span className={`px-2 py-0.5 rounded font-medium ${currentStep === 2 ? 'bg-[#1D9BF0] text-white' : 'text-gray-400'}`}>2</span>
              <span className="text-gray-300 dark:text-[#333333]">/</span>
              <span className={`px-2 py-0.5 rounded font-medium ${currentStep === 3 ? 'bg-[#1D9BF0] text-white' : 'text-gray-400'}`}>3</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-[#71767B] dark:hover:text-[#E7E9EA] rounded-full hover:bg-gray-100 dark:hover:bg-[#161616] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-gray-800 dark:text-[#E7E9EA]">
          
          {/* ================= STEP 1 ================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-1">
                    compny Trade register
                  </label>
                  <input
                    type="text"
                    value={companyTradeRegister}
                    onChange={(e) => setCompanyTradeRegister(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-medium text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-1">
                    ownership
                  </label>
                  <input
                    type="text"
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-medium text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-1">
                    BUSSINESS PERPOSE
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBusinessPurpose("PRIVATE LIMITED")}
                      className={`px-2 py-2 text-[11px] font-bold rounded border transition-colors ${
                        businessPurpose === "PRIVATE LIMITED"
                          ? "bg-[#1D9BF0] text-white border-[#1D9BF0]"
                          : "bg-white dark:bg-[#000000] text-gray-600 dark:text-[#71767B] border-gray-200 dark:border-[#222222]"
                      }`}
                    >
                      PRIVATE LIMITED
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusinessPurpose("GOVERNMENT AUTHORITIES")}
                      className={`px-2 py-2 text-[11px] font-bold rounded border transition-colors ${
                        businessPurpose === "GOVERNMENT AUTHORITIES"
                          ? "bg-[#1D9BF0] text-white border-[#1D9BF0]"
                          : "bg-white dark:bg-[#000000] text-gray-600 dark:text-[#71767B] border-gray-200 dark:border-[#222222]"
                      }`}
                    >
                      GOVERMENT AUTHOERTIES
                    </button>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gray-50 dark:bg-[#050505] p-3.5 rounded border border-gray-200 dark:border-[#1a1a1a]">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-2">
                  bank details
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Bank Name"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-mono text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-mono uppercase text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 10 DOCUMENT SLOTS */}
              <div className="bg-gray-50 dark:bg-[#050505] p-3.5 rounded border border-gray-200 dark:border-[#1a1a1a]">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-2">
                  Documents (10 Slots)
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {documentInputs.map((val, idx) => {
                    const parsed = parseSubsidyDoc(val, business);
                    return (
                      <div
                        key={idx}
                        className="p-2 rounded border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#000000]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-[#71767B] w-5">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                              const updated = [...documentInputs];
                              updated[idx] = e.target.value;
                              setDocumentInputs(updated);
                            }}
                            placeholder="Enter permit / cert number"
                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-[#222222] text-[12px] font-mono text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none py-1"
                          />
                        </div>

                        {val.trim() && parsed.fullName ? (
                          <div className="mt-1 pl-7 text-[11px] flex items-center justify-between text-gray-600 dark:text-[#71767B]">
                            <span className="truncate pr-1 font-medium">{parsed.fullName}</span>
                            {parsed.isVerified && <BlueVerifiedBadge />}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FINANCIALS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* investing */}
                <div className="p-2.5 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] rounded">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-[#71767B] uppercase block">
                    investing
                  </span>
                  <span className="text-[14px] font-bold text-gray-900 dark:text-[#E7E9EA] block mt-0.5">
                    {formatINR(financials.currentInvestedAmount)}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-[#71767B] block">
                    Total: {formatINR(financials.totalInvestedLifetime)}
                  </span>
                </div>

                {/* retruns */}
                <div className="p-2.5 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] rounded">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase block">
                    retruns
                  </span>
                  <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {formatINR(financials.currentReturnsPending)}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-[#71767B] block">
                    Past: {formatINR(financials.pastReturnsPaid)}
                  </span>
                </div>

                {/* owner retruns */}
                <div className="p-2.5 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] rounded">
                  <span className="text-[10px] font-bold text-[#1D9BF0] uppercase block">
                    owner retruns
                  </span>
                  <span className="text-[14px] font-bold text-[#1D9BF0] block mt-0.5">
                    {formatINR(financials.currentOwnerProfit)}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-[#71767B] block">
                    Past: {formatINR(financials.pastOwnerProfit)}
                  </span>
                </div>

                {/* brokrage */}
                <div className="p-2.5 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] rounded">
                  <span className="text-[10px] font-bold text-amber-500 uppercase block">
                    brokrage
                  </span>
                  <span className="text-[14px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                    {formatINR(financials.currentBrokeragePayable)}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-[#71767B] block">
                    Past: {formatINR(financials.pastBrokeragePaid)}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 2: RADHIKA BROKERAGE SECURITY ================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              
              <div className="border-b border-gray-200 dark:border-[#222222] pb-2">
                <h2 className="text-[15px] font-bold text-gray-900 dark:text-[#E7E9EA] uppercase">
                  RADHIKA BROKRAGE SECURITY
                </h2>
              </div>

              {/* Broker & Founder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-[#71767B] uppercase mb-1">
                    EXCHANGE BROKER
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-bold text-gray-800 dark:text-[#E7E9EA]">
                    RADHIKA BROKRAGE TREDING PRIVATE LIMITED
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-[#71767B] uppercase mb-1">
                    FOUNDER NAME
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-bold text-gray-800 dark:text-[#E7E9EA] flex items-center justify-between">
                    <span>RADHIKA MARCHANT</span>
                    <BlueVerifiedBadge />
                  </div>
                </div>
              </div>

              {/* 5 Security Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2.5 rounded bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityChecks.takeResponsibility}
                    onChange={(e) =>
                      setSecurityChecks({ ...securityChecks, takeResponsibility: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1D9BF0] focus:ring-0"
                  />
                  <span className="text-[13px] text-gray-800 dark:text-[#E7E9EA]">
                    1. Are you agreed to take responsibility for this company?
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityChecks.trustCompany}
                    onChange={(e) =>
                      setSecurityChecks({ ...securityChecks, trustCompany: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1D9BF0] focus:ring-0"
                  />
                  <span className="text-[13px] text-gray-800 dark:text-[#E7E9EA]">
                    2. Do you trust this company?
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityChecks.monthlyVisit}
                    onChange={(e) =>
                      setSecurityChecks({ ...securityChecks, monthlyVisit: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1D9BF0] focus:ring-0"
                  />
                  <span className="text-[13px] text-gray-800 dark:text-[#E7E9EA]">
                    3. Have you personally visited this company monthly?
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityChecks.helpedInvestors}
                    onChange={(e) =>
                      setSecurityChecks({ ...securityChecks, helpedInvestors: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1D9BF0] focus:ring-0"
                  />
                  <span className="text-[13px] text-gray-800 dark:text-[#E7E9EA]">
                    4. Have you helped any investor to invest in this company through you?
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityChecks.profitAppropriate}
                    onChange={(e) =>
                      setSecurityChecks({ ...securityChecks, profitAppropriate: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1D9BF0] focus:ring-0"
                  />
                  <span className="text-[13px] text-gray-800 dark:text-[#E7E9EA]">
                    5. Do you find it appropriate that this company provides profit to investors?
                  </span>
                </label>
              </div>

              {/* Bottom Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-1">
                    Applicant Name
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-1">
                    Consenter Name
                  </label>
                  <input
                    type="text"
                    value={consenterName}
                    onChange={(e) => setConsenterName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-1">
                    Application Date
                  </label>
                  <input
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-mono text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-[#71767B] uppercase mb-1">
                    Fees Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-mono text-gray-900 dark:text-[#E7E9EA] focus:border-[#1D9BF0] outline-none"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 3: REVIEW & SANCTION ================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#222222]">
                <h2 className="text-[15px] font-bold text-gray-900 dark:text-[#E7E9EA]">
                  Application Review & Subsidy Calculation
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[12px] text-[#1D9BF0] hover:underline"
                  >
                    Re-Edit Step 1
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[12px] text-[#1D9BF0] hover:underline"
                  >
                    Re-Edit Step 2
                  </button>
                </div>
              </div>

              {/* Provider Info */}
              <div className="p-3 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-[#222222] rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-[#71767B]">
                    Subsidy Authority
                  </span>
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-[#E7E9EA] flex items-center gap-1">
                    RAHIMBHAI MUSTUFA PATHAN
                    <BlueVerifiedBadge />
                  </h3>
                  <p className="text-[12px] text-[#1D9BF0] font-medium">
                    HPG PRIME MINISTER
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-bold text-gray-600 dark:text-[#71767B]">
                    Subsidy Rate:
                  </label>
                  <select
                    value={subsidyPercentage}
                    onChange={(e) => setSubsidyPercentage(Number(e.target.value))}
                    className="px-2.5 py-1 bg-white dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded text-[13px] font-bold text-[#1D9BF0] outline-none"
                  >
                    <option value={20}>20%</option>
                    <option value={25}>25%</option>
                    <option value={30}>30%</option>
                    <option value={40}>40%</option>
                    <option value={50}>50%</option>
                  </select>
                </div>
              </div>

              {/* Calculations Table */}
              <div className="border border-gray-200 dark:border-[#222222] rounded overflow-hidden">
                <table className="w-full text-left text-[13px]">
                  <tbody className="divide-y divide-gray-100 dark:divide-[#1a1a1a]">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Current Invested Amount</td>
                      <td className="py-2.5 px-3 font-mono text-right">{formatINR(financials.currentInvestedAmount)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Current Investor Profit Payable</td>
                      <td className="py-2.5 px-3 font-mono text-right text-emerald-500">{formatINR(financials.currentReturnsPending)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Current Brokerage Payable</td>
                      <td className="py-2.5 px-3 font-mono text-right text-amber-500">{formatINR(financials.currentBrokeragePayable)}</td>
                    </tr>
                    <tr className="bg-emerald-500/5 font-bold">
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">Total Subsidy Sanctioned</td>
                      <td className="py-2.5 px-3 font-mono text-right text-emerald-600 dark:text-emerald-400">
                        {formatINR(subsidyCalculation.subsidyAmount)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-[#050505] font-bold">
                      <td className="py-2.5 px-3">Remaining Net Payable</td>
                      <td className="py-2.5 px-3 font-mono text-right">
                        {formatINR(subsidyCalculation.netPayableAfterSubsidy)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-[#222222] bg-[#FAFBFC] dark:bg-[#000000] flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-3.5 py-1.5 text-[13px] font-medium text-gray-700 dark:text-[#E7E9EA] hover:bg-gray-100 dark:hover:bg-[#161616] rounded transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 dark:text-[#71767B] dark:hover:text-[#E7E9EA] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 2 && checkedAffirmationsCount < 3) {
                    alert("Please select at least 3 checkboxes to proceed.");
                    return;
                  }
                  setCurrentStep((prev) => (prev + 1) as any);
                }}
                className="px-4 py-1.5 text-[13px] font-bold text-white bg-[#1D9BF0] hover:bg-[#1a8cd8] rounded transition-colors flex items-center gap-1 shadow-sm"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmSubsidy}
                disabled={isSubmitting}
                className="px-5 py-2 text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded transition-colors flex items-center gap-1.5 shadow"
              >
                <ShieldCheck className="w-4 h-4" />
                {isSubmitting ? "Confirming..." : "Confirm"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
