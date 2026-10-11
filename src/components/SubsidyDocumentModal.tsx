import React, { useRef, useState, useMemo } from "react";
import { 
  X, 
  Download, 
  Printer, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Info,
  Percent,
  Paperclip,
  Eye,
  Check,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Business, SubsidyInvestorSlipRecord, SubsidyYojnaData } from "../types";
import { formatINR } from "../utils/mockData";
import { useAppContext } from "../utils/AppContext";
import { BlueVerifiedBadge } from "./SubsidyYojnaModal";

interface SubsidyDocumentModalProps {
  business: Business;
  onClose: () => void;
  onRemoved: () => void;
}

export function generateInvestorSlipRecords(
  business: Business,
  investments: any[],
  investors: any[]
): SubsidyInvestorSlipRecord[] {
  const bizInvestments = investments.filter((i) => i.businessId === business.id);

  if (bizInvestments.length > 0) {
    const totalInvested = bizInvestments.reduce((sum, i) => sum + (i.amount || 0), 0) || 1;
    return bizInvestments.map((inv) => {
      const investorObj = investors.find((invs) => invs.id === inv.investorId);
      const investorName = investorObj?.name || `Investor ${inv.investorId.slice(0, 6)}`;
      const investAmount = inv.amount || 0;
      
      const profitAmount = inv.payoutDetails?.totalCredited
        ? Math.max(0, inv.payoutDetails.totalCredited - inv.amount)
        : Math.round(investAmount * ((inv.interestRate || 12) / 100));

      const capitalPercentage = Number(((investAmount / totalInvested) * 100).toFixed(1));
      const profitBookPercentage = Number(((profitAmount / (investAmount || 1)) * 100).toFixed(1));
      
      const taxPaid = inv.payoutDetails?.happyIncomeTax || Math.round(profitAmount * 0.1);
      const brokeragePaid = inv.payoutDetails?.rmasCommission || inv.adminCommissionInvestor || Math.round(investAmount * 0.015);
      const totalTaxBrokerage = taxPaid + brokeragePaid;

      return {
        id: inv.id,
        investorName,
        investAmount,
        profitAmount,
        capitalPercentage,
        profitBookPercentage,
        taxPaid,
        brokeragePaid,
        totalTaxBrokerage,
        settlementDate: inv.payoutDetails?.payoutDate || inv.endDate || inv.startDate || new Date().toISOString().split("T")[0],
      };
    });
  }

  // Realistic historical audit records if no active investments exist yet
  const defaultNames = [
    investors[0]?.name || "Ahmed Mustufa Pathan",
    investors[1]?.name || "Mohammad Faruk Dalal",
    investors[2]?.name || "Rashid Khan Merchant",
    investors[3]?.name || "Zubair Merchant",
  ];

  const baseInvest = business.subsidyYojna?.currentInvestedAmount || 150000;
  const weights = [0.40, 0.30, 0.20, 0.10];
  const returnRate = 0.15; // 15% profit return

  return defaultNames.map((name, idx) => {
    const investAmount = Math.round(baseInvest * weights[idx]);
    const profitAmount = Math.round(investAmount * returnRate);
    const capitalPercentage = Number((weights[idx] * 100).toFixed(1));
    const profitBookPercentage = 15.0;
    const taxPaid = Math.round(profitAmount * 0.10); // 10% Happy Income Tax
    const brokeragePaid = Math.round(investAmount * 0.015); // 1.5% Radhika Brokerage
    const totalTaxBrokerage = taxPaid + brokeragePaid;

    return {
      id: `hist-slip-${idx + 1}`,
      investorName: name,
      investAmount,
      profitAmount,
      capitalPercentage,
      profitBookPercentage,
      taxPaid,
      brokeragePaid,
      totalTaxBrokerage,
      settlementDate: new Date(Date.now() - (idx + 1) * 7 * 86400000).toISOString().split("T")[0],
    };
  });
}

export default function SubsidyDocumentModal({ business, onClose, onRemoved }: SubsidyDocumentModalProps) {
  const { state, dispatch } = useAppContext();
  const docRef = useRef<HTMLDivElement>(null);
  const slipDocRef = useRef<HTMLDivElement>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingSlip, setIsDownloadingSlip] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Rate Editing State
  const subsidy = business.subsidyYojna;
  const [customPercentage, setCustomPercentage] = useState<number>(subsidy?.subsidyPercentage || 35);
  const [isSavingRate, setIsSavingRate] = useState(false);
  const [rateSaveSuccess, setRateSaveSuccess] = useState(false);
  
  // Slip Modal State
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [isAttachingSlip, setIsAttachingSlip] = useState(false);
  const [attachSuccess, setAttachSuccess] = useState(false);

  if (!subsidy) return null;

  const formattedSubsidyNo = subsidy.subsidyNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");

  // Gross and Calculated Amounts
  const grossOutflow = subsidy.grossPayable || (subsidy.currentInvestedAmount + subsidy.pastReturnsPaid + subsidy.pastBrokeragePaid);
  const currentSubsidyAmount = Math.round(grossOutflow * (customPercentage / 100));

  // Calculated tier potentials based on active percentage
  const tier2Rate = Math.min(45, customPercentage + 10);
  const tier2Amount = Math.round(currentSubsidyAmount * 1.35);
  const tier3Rate = 50;
  const tier3Amount = Math.round(currentSubsidyAmount * 1.75);

  // Active records: either attached or ready to attach
  const attachedRecords = subsidy.attachedPreviousRecords && subsidy.attachedPreviousRecords.length > 0
    ? subsidy.attachedPreviousRecords
    : generateInvestorSlipRecords(business, state.investments, state.investors);

  // Totals for the slip
  const totalSlipInvested = attachedRecords.reduce((sum, r) => sum + r.investAmount, 0);
  const totalSlipProfit = attachedRecords.reduce((sum, r) => sum + r.profitAmount, 0);
  const totalSlipTax = attachedRecords.reduce((sum, r) => sum + r.taxPaid, 0);
  const totalSlipBrokerage = attachedRecords.reduce((sum, r) => sum + r.brokeragePaid, 0);
  const totalSlipDeduction = attachedRecords.reduce((sum, r) => sum + r.totalTaxBrokerage, 0);

  // Handle Manual Percentage Change & Save
  const handleSavePercentage = async (newPct: number) => {
    setIsSavingRate(true);
    try {
      const newAmount = Math.round(grossOutflow * (newPct / 100));
      const newNet = Math.max(0, grossOutflow - newAmount);

      const updatedSubsidy: SubsidyYojnaData = {
        ...subsidy,
        subsidyPercentage: newPct,
        subsidyAmount: newAmount,
        netPayableAfterSubsidy: newNet,
        totalSaved: newAmount,
      };

      const updatedBusiness: Business = {
        ...business,
        subsidyYojna: updatedSubsidy,
      };

      await dispatch({
        type: "UPDATE_BUSINESS",
        payload: updatedBusiness,
      });

      setRateSaveSuccess(true);
      setTimeout(() => setRateSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update subsidy percentage:", err);
    } finally {
      setIsSavingRate(false);
    }
  };

  // Handle Attach Previous Records Slip
  const handleAttachPreviousRecords = async () => {
    setIsAttachingSlip(true);
    try {
      const records = generateInvestorSlipRecords(business, state.investments, state.investors);
      
      const newAmount = Math.round(grossOutflow * (customPercentage / 100));
      const newNet = Math.max(0, grossOutflow - newAmount);

      const updatedSubsidy: SubsidyYojnaData = {
        ...subsidy,
        subsidyPercentage: customPercentage,
        subsidyAmount: newAmount,
        netPayableAfterSubsidy: newNet,
        totalSaved: newAmount,
        attachedPreviousRecords: records,
        isPreviousRecordAttached: true,
      };

      const updatedBusiness: Business = {
        ...business,
        subsidyYojna: updatedSubsidy,
      };

      await dispatch({
        type: "UPDATE_BUSINESS",
        payload: updatedBusiness,
      });

      setAttachSuccess(true);
      setTimeout(() => setAttachSuccess(false), 3000);
      setShowSlipModal(true); // Automatically show previous record slip as requested!
    } catch (err) {
      console.error("Failed to attach previous records slip:", err);
    } finally {
      setIsAttachingSlip(false);
    }
  };

  // Handle Remove Subsidy without window.confirm (works 100% in all environments)
  const handleExecuteRemoveSubsidy = async () => {
    setIsRemoving(true);
    try {
      const updatedBusiness: Business = {
        ...business,
        subsidyYojna: null as any,
      };

      await dispatch({
        type: "UPDATE_BUSINESS",
        payload: updatedBusiness,
      });

      onRemoved();
      onClose();
    } catch (err) {
      console.error("Failed to remove subsidy:", err);
    } finally {
      setIsRemoving(false);
      setShowDeleteConfirm(false);
    }
  };

  // Robust PDF Generation with oklch sanitizer
  const handleDownloadPdf = async () => {
    if (!docRef.current) return;
    setIsDownloading(true);
    try {
      const element = docRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        logging: false,
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          if (clonedDoc.documentElement) clonedDoc.documentElement.classList.remove("dark");
          if (clonedDoc.body) clonedDoc.body.classList.remove("dark");

          if (clonedDoc.defaultView) {
            const origGetComputedStyle = clonedDoc.defaultView.getComputedStyle;
            const dummyCanvas = clonedDoc.createElement("canvas");
            const ctx = dummyCanvas.getContext("2d");

            const sanitizeColor = (val: string): string => {
              if (!val || typeof val !== "string" || !val.includes("oklch")) return val;
              return val.replace(/oklch\([^)]+\)/g, (match) => {
                if (ctx) {
                  try {
                    ctx.fillStyle = match;
                    return ctx.fillStyle;
                  } catch {
                    return "rgb(17, 24, 39)";
                  }
                }
                return "rgb(17, 24, 39)";
              });
            };

            clonedDoc.defaultView.getComputedStyle = function(el: Element, pseudo?: string | null) {
              const style = origGetComputedStyle.call(this, el, pseudo);
              return new Proxy(style, {
                get(target, prop) {
                  if (prop === "getPropertyValue") {
                    return (name: string) => sanitizeColor(target.getPropertyValue(name));
                  }
                  const val = (target as any)[prop];
                  if (typeof val === "function") {
                    return val.bind(target);
                  }
                  if (typeof val === "string") {
                    return sanitizeColor(val);
                  }
                  return val;
                }
              });
            };
          }

          const sheet = clonedDoc.getElementById("printable-subsidy-order");
          if (sheet) {
            sheet.style.backgroundColor = "#ffffff";
            sheet.style.color = "#111827";
            sheet.style.boxShadow = "none";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = position - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(`HPG-Subsidy-Order-${subsidy.subsidyNumber}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF via canvas, using native print:", err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 md:left-[320px] lg:left-[410px] z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 overflow-y-auto font-sans">
      
      {/* Native Print Stylesheet to guarantee pure white print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 8mm;
            size: A4 portrait;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-subsidy-order,
          #printable-subsidy-order * {
            visibility: visible !important;
          }
          #printable-subsidy-order {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 8mm !important;
            box-shadow: none !important;
            border: none !important;
            background-color: #ffffff !important;
            color: #111827 !important;
          }
        }
      `}} />

      <div className="w-full max-w-4xl bg-[#F0F2F5] dark:bg-[#000000] border border-gray-200 dark:border-[#222222] rounded-lg shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* GOOGLE DOCS STYLE TOP TOOLBAR */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-[#222222] bg-white dark:bg-[#000000] flex items-center justify-between shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1D9BF0] flex items-center justify-center text-white font-bold text-[14px]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-gray-900 dark:text-[#E7E9EA] truncate max-w-[280px]">
                  Subsidy_Sanction_Order_{subsidy.subsidyNumber}.docx
                </span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-mono font-medium border border-emerald-500/20">
                  OFFICIAL DOCS
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-[#71767B]">
                <span>Happy Tax Department Sahay Yojna</span>
                <span>•</span>
                <span>Sanctioned on {subsidy.sanctionDate}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white rounded text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloading ? "Generating PDF..." : "Download PDF"}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-gray-100 dark:bg-[#151515] hover:bg-gray-200 dark:hover:bg-[#202020] text-gray-700 dark:text-[#E7E9EA] rounded text-[12px] font-medium flex items-center gap-1.5 border border-gray-200 dark:border-[#2b2b2b] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isRemoving}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded text-[12px] font-bold flex items-center gap-1.5 border border-red-500/20 transition-colors"
              title="Delete and cancel active Subsidy"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Subsidy
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-[#71767B] dark:hover:text-[#E7E9EA] rounded-full hover:bg-gray-100 dark:hover:bg-[#151515] transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUBSIDY RATE ADJUSTMENT & PREVIOUS RECORD SLIP ATTACHMENT STRIP */}
        <div className="px-5 py-2.5 bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-[#222222] flex items-center justify-between flex-wrap gap-3">
          
          {/* Rate Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-700 dark:text-gray-300">
              <Percent className="w-4 h-4 text-emerald-500" />
              <span>Subsidy Rate:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[25, 30, 35, 40, 45, 50].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    setCustomPercentage(pct);
                    handleSavePercentage(pct);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    customPercentage === pct
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white dark:bg-[#1f1f1f] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-[#333333] hover:bg-gray-100"
                  }`}
                >
                  {pct}%
                </button>
              ))}

              <div className="flex items-center gap-1 ml-1.5">
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={customPercentage}
                  onChange={(e) => setCustomPercentage(Number(e.target.value) || 0)}
                  className="w-14 px-1.5 py-0.5 text-[11px] font-mono font-bold rounded bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#333333] text-gray-900 dark:text-white outline-none text-center"
                />
                <span className="text-[11px] font-bold text-gray-500">%</span>
                {customPercentage !== subsidy.subsidyPercentage && (
                  <button
                    onClick={() => handleSavePercentage(customPercentage)}
                    disabled={isSavingRate}
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors ml-1"
                  >
                    {isSavingRate ? "Saving..." : "Save Rate"}
                  </button>
                )}
              </div>
            </div>

            {rateSaveSuccess && (
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Rate Updated
              </span>
            )}
          </div>

          {/* Attach Previous Record Slip Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAttachPreviousRecords}
              disabled={isAttachingSlip}
              className="px-3 py-1 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Click to automatically attach previous investor settlement records slip"
            >
              <Paperclip className="w-3.5 h-3.5" />
              {isAttachingSlip ? "Attaching Slip..." : "Attach Previous Records Slip"}
            </button>

            <button
              onClick={() => setShowSlipModal(true)}
              className="px-2.5 py-1 bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#252525] text-gray-800 dark:text-gray-200 rounded text-[11px] font-semibold flex items-center gap-1 border border-gray-300 dark:border-[#333333] transition-colors"
              title="View the Previous Records Slip"
            >
              <Eye className="w-3.5 h-3.5" />
              View Slip
            </button>

            {subsidy.isPreviousRecordAttached && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Slip Attached
              </span>
            )}
          </div>
        </div>

        {/* INLINE DELETE CONFIRMATION BAR */}
        {showDeleteConfirm && (
          <div className="px-5 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 text-[12px] text-red-700 dark:text-red-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>Are you sure you want to delete and cancel this Subsidy Yojna? The company will be reset and restored to &quot;Apply&quot;.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-[11px] font-semibold rounded bg-white dark:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-[#333333]"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRemoveSubsidy}
                disabled={isRemoving}
                className="px-3 py-1 text-[11px] font-bold rounded bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50"
              >
                {isRemoving ? "Deleting..." : "Yes, Delete Subsidy"}
              </button>
            </div>
          </div>
        )}

        {/* GOOGLE DOCS CANVAS CONTAINER (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-[#ECEFF1] dark:bg-[#000000]">
          
          {/* WHITE A4 DOCUMENT SHEET (Pure white background with explicit hex colors for 100% legibility in PDF and Print) */}
          <div 
            ref={docRef}
            id="printable-subsidy-order"
            style={{ 
              backgroundColor: "#FFFFFF", 
              color: "#111827",
              minHeight: "1150px",
              border: "1px solid #D1D5DB",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
            }}
            className="w-full max-w-[840px] p-8 sm:p-12 rounded-sm font-serif leading-relaxed"
          >
            {/* OFFICIAL HEADER BANNER */}
            <div style={{ borderBottom: "2px solid #111827", paddingBottom: "16px", marginBottom: "24px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", fontFamily: "sans-serif", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4B5563" }}>
                  GOVERNMENT OF HPG • MINISTRY OF REVENUE & EXCHANGE
                </span>
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#111827", margin: "4px 0" }}>
                HAPPY TAX DEPARTMENT SAHAY YOJNA
              </h1>
              <p style={{ fontSize: "13px", fontFamily: "sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284C7", margin: "2px 0" }}>
                RADHIKA PRIVATE LIMITED OF EXCHANGE COMPANY
              </p>
              <p style={{ fontSize: "11px", fontFamily: "sans-serif", fontStyle: "italic", color: "#4B5563", margin: "4px 0 0 0" }}>
                Statutory Financial Subsidy Sanction Order & Performance Grant Certificate
              </p>
            </div>

            {/* DOCUMENT METADATA STRIP */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", padding: "12px", marginBottom: "24px", fontFamily: "sans-serif", fontSize: "11px", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
              <div>
                <span style={{ fontWeight: 700, textTransform: "uppercase", display: "block", color: "#6B7280" }}>12-Digit Subsidy No.</span>
                <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "13px", color: "#047857" }}>
                  {formattedSubsidyNo}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 700, textTransform: "uppercase", display: "block", color: "#6B7280" }}>Sanction Date</span>
                <span style={{ fontWeight: 700, color: "#111827" }}>{subsidy.sanctionDate}</span>
              </div>
              <div>
                <span style={{ fontWeight: 700, textTransform: "uppercase", display: "block", color: "#6B7280" }}>Entity Purpose</span>
                <span style={{ fontWeight: 700, textTransform: "uppercase", color: "#111827" }}>{subsidy.businessPurpose}</span>
              </div>
              <div>
                <span style={{ fontWeight: 700, textTransform: "uppercase", display: "block", color: "#6B7280" }}>Release Status</span>
                <span style={{ fontWeight: 700, textTransform: "uppercase", color: "#047857" }}>
                  ● ACTIVE SANCTION
                </span>
              </div>
            </div>

            {/* RECIPIENT PARTICULARS */}
            <div style={{ marginBottom: "24px", fontFamily: "sans-serif" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", color: "#4B5563" }}>
                1. Grant Beneficiary Particulars
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", fontSize: "13px" }}>
                <div>
                  <span style={{ fontSize: "11px", display: "block", textTransform: "uppercase", color: "#6B7280" }}>Company Trade Register:</span>
                  <span style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>{subsidy.companyTradeRegister}</span>
                  <span style={{ fontSize: "11px", display: "block", marginTop: "8px", textTransform: "uppercase", color: "#6B7280" }}>Official Ownership:</span>
                  <span style={{ fontWeight: 600, color: "#1F2937" }}>{subsidy.ownership}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", display: "block", textTransform: "uppercase", color: "#6B7280" }}>Settlement Bank Account:</span>
                  <span style={{ fontWeight: 500, color: "#1F2937" }}>{subsidy.bankDetails.bankName}</span>
                  <div style={{ fontSize: "12px", fontFamily: "monospace", marginTop: "2px", color: "#4B5563" }}>
                    A/C: {subsidy.bankDetails.accountNumber} • IFSC: {subsidy.bankDetails.ifscCode}
                  </div>
                </div>
              </div>
            </div>

            {/* VERIFIED LEGAL DOCUMENTS & PERMITS (WITH BLUE TICKS) */}
            <div style={{ marginBottom: "24px", fontFamily: "sans-serif" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", marginBottom: "8px" }}>
                <h2 style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase", color: "#4B5563" }}>
                  2. Verified Statutory Permits & Identifiers
                </h2>
                <span style={{ fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", color: "#047857" }}>
                  <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                  Legal Verification Confirmed
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "8px", fontSize: "12px" }}>
                {subsidy.documents.map((doc, idx) => (
                  <div key={idx} style={{ padding: "8px", border: "1px solid #E5E7EB", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F9FAFB" }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, display: "block", color: "#111827" }}>{doc.value}</span>
                      <span style={{ fontSize: "10px", display: "block", color: "#4B5563" }}>{doc.fullName}</span>
                    </div>
                    {doc.isVerified && <BlueVerifiedBadge />}
                  </div>
                ))}
              </div>
            </div>

            {/* FINANCIAL SANCTION STATEMENT & PERFORMANCE-LINKED GRANT ALLOCATION */}
            <div style={{ marginBottom: "24px", fontFamily: "sans-serif" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", color: "#4B5563" }}>
                3. Financial Sanction Statement & Grant Allocation
              </h2>

              {/* Policy Explanation in English */}
              <div style={{ padding: "14px", borderRadius: "4px", border: "1px solid #D1D5DB", fontSize: "11px", lineHeight: "1.6", marginBottom: "16px", backgroundColor: "#F9FAFB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", color: "#111827" }}>
                  <Info style={{ width: "16px", height: "16px", color: "#0284C7" }} />
                  <span>Government Subsidy Performance & Dynamic Scale Policy</span>
                </div>
                <p style={{ color: "#374151", margin: "4px 0" }}>
                  Based on historical and current investment volumes, investor profit payouts, and loss-mitigation performance, 
                  the Government of HPG evaluates and sanctions subsidy grants on a dynamic percentage tier. This grant is officially 
                  approved after comprehensive audit of your past and active capital movements.
                </p>
                <div style={{ marginTop: "8px", color: "#1F2937", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <p style={{ margin: 0 }}>
                    • <strong>Upward Tier Potential:</strong> If your enterprise demonstrates significant trading volume movement, maintains high liquidity, 
                    and delivers consistent profit payouts to investors, the Yojna Authority will upgrade your subsidy grant percentage in subsequent disbursement phases.
                  </p>
                  <p style={{ margin: 0 }}>
                    • <strong>Downward Adjustment:</strong> Conversely, if capital movement decelerates or trading activity becomes stagnant with inadequate investor engagement, 
                    the subsidy percentage will be scaled down proportionally.
                  </p>
                  <p style={{ margin: 0 }}>
                    • <strong>Disbursement & Bank Trigger:</strong> Sanctioned subsidy funds are credited directly to the business owner&apos;s bank account under the official statement 
                    reference <strong>&quot;Rahimdullah HPG Subcidy Yojna Goverment&quot;</strong>. Payouts are triggered strictly upon investor sell / profit-booking events, 
                    including qualifying settlements executed within a 1-week window of subsidy application.
                  </p>
                </div>
              </div>

              {/* Comprehensive Financial Sanction & Multi-Tier Allocation Table */}
              <table style={{ width: "100%", textAlign: "left", fontSize: "12px", border: "1px solid #D1D5DB", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid #D1D5DB", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", color: "#374151" }}>
                    <th style={{ padding: "8px 12px", borderRight: "1px solid #E5E7EB" }}>Grant Allocation Tier</th>
                    <th style={{ padding: "8px 12px", borderRight: "1px solid #E5E7EB" }}>Performance & Movement Criteria</th>
                    <th style={{ padding: "8px 12px", borderRight: "1px solid #E5E7EB" }}>Subsidy Rate</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Subsidy Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Tier 1: Current Sanctioned Allocation */}
                  <tr style={{ backgroundColor: "#ECFDF5", borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#047857", borderRight: "1px solid #E5E7EB" }}>
                      Phase 1: Current Approved Grant
                    </td>
                    <td style={{ padding: "10px 12px", color: "#1F2937", borderRight: "1px solid #E5E7EB" }}>
                      Active Capital: {formatINR(subsidy.currentInvestedAmount)} • Past Profit Settled: {formatINR(subsidy.pastReturnsPaid)}
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#047857", borderRight: "1px solid #E5E7EB" }}>
                      {customPercentage}% Sanctioned
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 700, textAlign: "right", color: "#047857" }}>
                      {formatINR(currentSubsidyAmount)}
                    </td>
                  </tr>

                  {/* Tier 2: Next Growth Tranche */}
                  <tr style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111827", borderRight: "1px solid #E5E7EB" }}>
                      Phase 2: High-Volume Expansion Tier
                    </td>
                    <td style={{ padding: "10px 12px", color: "#4B5563", borderRight: "1px solid #E5E7EB" }}>
                      +25% Growth in Investor Turnover & Continued Profit Delivery
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0284C7", borderRight: "1px solid #E5E7EB" }}>
                      {tier2Rate}% Target Rate
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", textAlign: "right", color: "#0284C7" }}>
                      {formatINR(tier2Amount)}
                    </td>
                  </tr>

                  {/* Tier 3: Prime Market Turnover Tranche */}
                  <tr style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111827", borderRight: "1px solid #E5E7EB" }}>
                      Phase 3: Prime Exchange Scale Tier
                    </td>
                    <td style={{ padding: "10px 12px", color: "#4B5563", borderRight: "1px solid #E5E7EB" }}>
                      Major Sustained Market Movement & Zero Investor Default
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#B45309", borderRight: "1px solid #E5E7EB" }}>
                      {tier3Rate}% Maximum Tier
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", textAlign: "right", color: "#B45309" }}>
                      {formatINR(tier3Amount)}
                    </td>
                  </tr>

                  {/* Release Trigger Notice */}
                  <tr style={{ backgroundColor: "#F9FAFB" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: "#111827", borderRight: "1px solid #E5E7EB" }}>
                      Bank Credit Description:
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 700, color: "#047857", borderRight: "1px solid #E5E7EB" }} colSpan={2}>
                      Rahimdullah HPG Subcidy Yojna Goverment
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", textAlign: "right", fontSize: "11px", color: "#6B7280" }}>
                      Trigger: On Investor Sell / 1-Week Window
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Clear Summary Card for Business Owner */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "12px", textAlign: "center" }}>
                <div style={{ padding: "10px", border: "1px solid #A7F3D0", borderRadius: "4px", backgroundColor: "#ECFDF5" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", display: "block", color: "#047857" }}>
                    Immediately Approved Grant
                  </span>
                  <span style={{ fontSize: "16px", fontFamily: "monospace", fontWeight: 900, display: "block", marginTop: "2px", color: "#047857" }}>
                    {formatINR(currentSubsidyAmount)}
                  </span>
                  <span style={{ fontSize: "10px", display: "block", color: "#065F46" }}>
                    {customPercentage}% Sanction Rate
                  </span>
                </div>

                <div style={{ padding: "10px", border: "1px solid #BAE6FD", borderRadius: "4px", backgroundColor: "#F0F9FF" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", display: "block", color: "#0284C7" }}>
                    Upcoming Phase 2 Grant
                  </span>
                  <span style={{ fontSize: "16px", fontFamily: "monospace", fontWeight: 900, display: "block", marginTop: "2px", color: "#0284C7" }}>
                    {formatINR(tier2Amount)}
                  </span>
                  <span style={{ fontSize: "10px", display: "block", color: "#0369A1" }}>
                    {tier2Rate}% Target Potential
                  </span>
                </div>

                <div style={{ padding: "10px", border: "1px solid #FDE68A", borderRadius: "4px", backgroundColor: "#FFFBEB" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", display: "block", color: "#B45309" }}>
                    Maximum Program Potential
                  </span>
                  <span style={{ fontSize: "16px", fontFamily: "monospace", fontWeight: 900, display: "block", marginTop: "2px", color: "#B45309" }}>
                    {formatINR(tier3Amount)}
                  </span>
                  <span style={{ fontSize: "10px", display: "block", color: "#92400E" }}>
                    {tier3Rate}% Peak Capacity
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 4: PREVIOUS HISTORICAL PERFORMANCE & SETTLEMENT SLIP (અગાવ ના રેકોર્ડ ની સ્લીપ) */}
            {/* Exactly as requested: Single line text per record, top and bottom horizontal line borders */}
            <div style={{ marginBottom: "24px", fontFamily: "sans-serif" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <h2 style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase", color: "#4B5563", margin: 0 }}>
                  4. Historical Performance & Investor Settlement Audit Slip (અગાવ ના રેકોર્ડ ની સ્લીપ)
                </h2>
                <span style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 700, color: "#047857", backgroundColor: "#ECFDF5", padding: "2px 6px", border: "1px solid #A7F3D0", borderRadius: "3px" }}>
                  ATTACHED AUDIT SLIP
                </span>
              </div>

              {/* SINGLE LINE TABLE WITH TOP AND BOTTOM HORIZONTAL LINE BORDER */}
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse", 
                  fontSize: "11px",
                  borderTop: "2px solid #111827", 
                  borderBottom: "2px solid #111827",
                  whiteSpace: "nowrap"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F3F4F6", borderBottom: "1.5px solid #111827", textTransform: "uppercase", fontSize: "10px", color: "#374151" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Investor Name</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>Invest Amount</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>Profit Amount</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700 }}>Capital %</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700 }}>Profit Book %</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>Tax Paid</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>Brokerage Paid</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>Total Deduction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachedRecords.map((rec, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: idx === attachedRecords.length - 1 ? "none" : "1px solid #E5E7EB",
                          backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {/* 1. Investor Name */}
                        <td style={{ padding: "7px 8px", fontWeight: 600, color: "#111827" }}>
                          {rec.investorName}
                        </td>
                        {/* 2. Invest Amount */}
                        <td style={{ padding: "7px 8px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: "#1F2937" }}>
                          {formatINR(rec.investAmount)}
                        </td>
                        {/* 3. Profit Amount */}
                        <td style={{ padding: "7px 8px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#047857" }}>
                          {formatINR(rec.profitAmount)}
                        </td>
                        {/* 4. Capital Amount Percentage */}
                        <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 600, color: "#0284C7" }}>
                          {rec.capitalPercentage}%
                        </td>
                        {/* 5. Profit Book Percentage */}
                        <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 600, color: "#047857" }}>
                          {rec.profitBookPercentage}%
                        </td>
                        {/* 6. Tax Paid */}
                        <td style={{ padding: "7px 8px", textAlign: "right", fontFamily: "monospace", color: "#4B5563" }}>
                          {formatINR(rec.taxPaid)}
                        </td>
                        {/* 7. Brokerage Paid */}
                        <td style={{ padding: "7px 8px", textAlign: "right", fontFamily: "monospace", color: "#4B5563" }}>
                          {formatINR(rec.brokeragePaid)}
                        </td>
                        {/* 8. Total Tax & Brokerage */}
                        <td style={{ padding: "7px 8px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#991B1B" }}>
                          {formatINR(rec.totalTaxBrokerage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {/* Summary row with top and bottom horizontal line borders */}
                    <tr style={{ 
                      borderTop: "2px solid #111827", 
                      backgroundColor: "#F9FAFB", 
                      fontWeight: 700, 
                      fontSize: "10.5px",
                      whiteSpace: "nowrap"
                    }}>
                      <td style={{ padding: "8px 8px", color: "#111827", textTransform: "uppercase" }}>
                        Total Historical Audit
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "right", fontFamily: "monospace", color: "#111827" }}>
                        {formatINR(totalSlipInvested)}
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "right", fontFamily: "monospace", color: "#047857" }}>
                        {formatINR(totalSlipProfit)}
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "center", color: "#0284C7" }}>
                        100.0%
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "center", color: "#047857" }}>
                        {((totalSlipProfit / (totalSlipInvested || 1)) * 100).toFixed(1)}%
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "right", fontFamily: "monospace", color: "#4B5563" }}>
                        {formatINR(totalSlipTax)}
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "right", fontFamily: "monospace", color: "#4B5563" }}>
                        {formatINR(totalSlipBrokerage)}
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "right", fontFamily: "monospace", color: "#991B1B" }}>
                        {formatINR(totalSlipDeduction)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* RADHIKA BROKERAGE SECURITY GUARANTEE CLAUSE */}
            <div style={{ marginBottom: "24px", fontFamily: "sans-serif", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "4px", fontSize: "11px", lineHeight: "1.6", backgroundColor: "#F9FAFB" }}>
              <span style={{ fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px", color: "#374151" }}>
                5. Exchange Security Endorsement (Radhika Brokerage Trading Private Limited)
              </span>
              <p style={{ color: "#4B5563", margin: 0 }}>
                This sanction order is issued under the statutory oversight of <strong>RADHIKA BROKERAGE TRADING PRIVATE LIMITED</strong>.
                The Founder & Chairperson <strong>RADHIKA MARCHANT</strong> has verified and certified that the beneficiary company
                has complied with all exchange safety standards and investor return guarantees.
              </p>
            </div>

            {/* DUAL OFFICIAL SIGNATURES & SEALS */}
            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "2px solid #111827", fontFamily: "sans-serif", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              
              {/* Left Signatory: Rahimbhai Mustufa Pathan */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: "2px dashed #9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", color: "#6B7280" }}>
                  Official Seal
                </div>
                <span style={{ fontFamily: "serif", fontStyle: "italic", fontSize: "15px", fontWeight: 700, letterSpacing: "0.02em", color: "#111827" }}>
                  Rahimbhai M. Pathan
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px", color: "#111827" }}>
                  RAHIMBHAI MUSTUFA PATHAN
                  <BlueVerifiedBadge />
                </span>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#0284C7" }}>
                  HPG PRIME MINISTER
                </span>
                <span style={{ fontSize: "9.5px", color: "#6B7280" }}>
                  Government of HPG & Happy Tax Department
                </span>
              </div>

              {/* Right Signatory: Radhika Marchant */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: "2px dashed #0284C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px", color: "#0284C7" }}>
                  Exchange Seal
                </div>
                <span style={{ fontFamily: "serif", fontStyle: "italic", fontSize: "15px", fontWeight: 700, letterSpacing: "0.02em", color: "#111827" }}>
                  Radhika Marchant
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px", color: "#111827" }}>
                  RADHIKA MARCHANT
                  <BlueVerifiedBadge />
                </span>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#0284C7" }}>
                  FOUNDER & CHAIRPERSON
                </span>
                <span style={{ fontSize: "9.5px", color: "#6B7280" }}>
                  Radhika Brokerage Trading Private Limited
                </span>
              </div>

            </div>

            {/* FOOTER BAR */}
            <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #E5E7EB", textAlign: "center", fontFamily: "sans-serif", fontSize: "10px", color: "#9CA3AF" }}>
              Generated via Happy Tax Department Subsidy Protocol • Reference No: HPG-SUB-{subsidy.subsidyNumber}
            </div>

          </div>

        </div>

      </div>

      {/* DEDICATED PREVIOUS RECORD SLIP PREVIEW MODAL */}
      {showSlipModal && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-lg shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gray-50 dark:bg-[#181818] border-b border-gray-200 dark:border-[#2b2b2b] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
                    Historical Investor Performance & Settlement Slip
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {business.companyInfo?.companyName || business.name} • Subsidy No: {subsidy.subsidyNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 dark:bg-[#252525] hover:bg-gray-200 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-200 rounded flex items-center gap-1 border border-gray-300 dark:border-[#333333]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </button>
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slip Printable Container */}
            <div className="p-6 overflow-x-auto bg-white dark:bg-[#111111]" ref={slipDocRef}>
              
              {/* Slip Header */}
              <div className="text-center pb-4 mb-4 border-b border-gray-300 dark:border-[#333333]">
                <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 block">
                  GOVERNMENT OF HPG • HAPPY TAX DEPARTMENT
                </span>
                <h4 className="text-[18px] font-black text-gray-900 dark:text-white uppercase tracking-tight mt-0.5">
                  PREVIOUS INVESTOR RECORD SLIP
                </h4>
                <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-gray-600 dark:text-gray-300 mt-1">
                  <span>COMPANY: <strong>{subsidy.companyTradeRegister}</strong></span>
                  <span>•</span>
                  <span>SUBSIDY RATE: <strong className="text-emerald-600">{customPercentage}%</strong></span>
                  <span>•</span>
                  <span>DATE: {new Date().toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              {/* SINGLE LINE SLIP TABLE WITH TOP AND BOTTOM HORIZONTAL BORDER */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12px] whitespace-nowrap" style={{ borderTop: "2px solid #111827", borderBottom: "2px solid #111827" }}>
                  <thead>
                    <tr className="bg-gray-100 dark:bg-[#1f1f1f] text-[10.5px] uppercase font-bold text-gray-700 dark:text-gray-200" style={{ borderBottom: "1.5px solid #111827" }}>
                      <th className="py-2.5 px-3">Investor Name</th>
                      <th className="py-2.5 px-3 text-right">Invest Amount</th>
                      <th className="py-2.5 px-3 text-right">Profit Amount</th>
                      <th className="py-2.5 px-3 text-center">Capital %</th>
                      <th className="py-2.5 px-3 text-center">Profit Book %</th>
                      <th className="py-2.5 px-3 text-right">Tax Paid</th>
                      <th className="py-2.5 px-3 text-right">Brokerage Paid</th>
                      <th className="py-2.5 px-3 text-right">Total Deduction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachedRecords.map((r, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors whitespace-nowrap"
                        style={{ borderBottom: idx === attachedRecords.length - 1 ? "none" : "1px solid #e5e7eb" }}
                      >
                        <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                          {r.investorName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-800 dark:text-gray-200">
                          {formatINR(r.investAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatINR(r.profitAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-600 dark:text-blue-400">
                          {r.capitalPercentage}%
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {r.profitBookPercentage}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                          {formatINR(r.taxPaid)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                          {formatINR(r.brokeragePaid)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600 dark:text-red-400">
                          {formatINR(r.totalTaxBrokerage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {/* Bottom Summary Row with Top and Bottom Horizontal Lines */}
                    <tr className="bg-gray-50 dark:bg-[#1a1a1a] font-bold text-[11px] whitespace-nowrap" style={{ borderTop: "2px solid #111827" }}>
                      <td className="py-2.5 px-3 uppercase text-gray-900 dark:text-white">
                        Total Audit Summary
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-900 dark:text-white">
                        {formatINR(totalSlipInvested)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {formatINR(totalSlipProfit)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-blue-600 dark:text-blue-400">
                        100.0%
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400">
                        {((totalSlipProfit / (totalSlipInvested || 1)) * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-700 dark:text-gray-300">
                        {formatINR(totalSlipTax)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-700 dark:text-gray-300">
                        {formatINR(totalSlipBrokerage)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-red-600 dark:text-red-400">
                        {formatINR(totalSlipDeduction)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Verified Slip Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-[#2b2b2b]">
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified & Attached into Official Subsidy Sanction Order</span>
                </div>
                <div className="font-mono">
                  Ref: HPG-SLIP-{subsidy.subsidyNumber.slice(0, 8)}
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-[#181818] border-t border-gray-200 dark:border-[#2b2b2b] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-1.5 text-[12px] font-semibold rounded bg-[#0284C7] hover:bg-[#0369A1] text-white transition-colors"
              >
                Close Slip
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
