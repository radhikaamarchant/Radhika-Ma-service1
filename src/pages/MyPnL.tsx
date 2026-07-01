import React, { useState } from"react";
import { useAppContext } from"../utils/AppContext";
import { formatINR } from"../utils/mockData";
import {
  List,
  ArrowLeft,
  Percent,
  Landmark,
  Download,
  Calendar,
  X,
  FileText,
} from"lucide-react";
import { downloadElementAsPDF } from"../utils/pdfGenerator";
import { getUnifiedBankBalance } from"../utils/bankBalance";
interface StatementEntry {
  id: string;
  date: string;
  type:"commission" |"tax";
  title: string;
  source: string;
  amount: number;
  details: { label: string; value: string | number }[];
}
export default function MyPnL() {
  const { state } = useAppContext();
  const [showStatement, setShowStatement] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedBill, setSelectedBill] = useState<StatementEntry | null>(null);
  const rmasAvailableBalance = getUnifiedBankBalance("Radhika M",
    state.businesses,
    state.investors,
    state.investments,
    state.settings,
  );
  let totalCommission = 0;
  let totalTax = 0;
  const statement: StatementEntry[] = [];
  // Calculate totals and build statement
  state.investments.forEach((inv) => {
    const business = state.businesses.find((b) => b.id === inv.businessId);
    const investor = state.investors.find((i) => i.id === inv.investorId);
    const bName = business ? business.name :"Unknown";
    const iName = investor ? investor.name :"Unknown";
    // Upfront Commissions
    if (inv.adminCommissionBusiness > 0) {
      totalCommission += inv.adminCommissionBusiness;
      statement.push({
        id: `comm_bus_${inv.id}`,
        date: inv.startDate,
        type:"commission",
        title: `Upfront Commission (Business)`,
        source: bName,
        amount: inv.adminCommissionBusiness,
        details: [
          { label:"Business Name", value: bName },
          { label:"Investor Name", value: iName },
          { label:"Investment Principal", value: formatINR(inv.amount) },
          {
            label:"Commission Rate",
            value: `${inv.adminCommissionBusinessPct}%`,
          },
        ],
      });
    }
    if (inv.adminCommissionInvestor > 0) {
      totalCommission += inv.adminCommissionInvestor;
      statement.push({
        id: `comm_inv_${inv.id}`,
        date: inv.startDate,
        type:"commission",
        title: `Upfront Commission (Investor)`,
        source: iName,
        amount: inv.adminCommissionInvestor,
        details: [
          { label:"Investor Name", value: iName },
          { label:"Business Name", value: bName },
          { label:"Investment Principal", value: formatINR(inv.amount) },
          {
            label:"Commission Rate",
            value: `${inv.adminCommissionInvestorPct}%`,
          },
        ],
      });
    }
    // Settlement/Completion details
    if (inv.status ==="completed" && inv.payoutDetails) {
      if (inv.payoutDetails.rmasCommission > 0) {
        totalCommission += inv.payoutDetails.rmasCommission;
        statement.push({
          id: `comm_set_${inv.id}`,
          date: inv.payoutDetails.payoutDate,
          type:"commission",
          title: `Settlement RMAS Commission`,
          source: iName,
          amount: inv.payoutDetails.rmasCommission,
          details: [
            { label:"Investor Name", value: iName },
            { label:"Business Name", value: bName },
            {
              label:"Completion Date",
              value: new Date(inv.payoutDetails.payoutDate).toLocaleDateString("en-IN",
              ),
            },
            {
              label:"Gross Profit Earned",
              value: formatINR(inv.payoutDetails.totalCredited - inv.amount),
            },
          ],
        });
      }
      if (
        inv.payoutDetails.rmasMarketCover &&
        inv.payoutDetails.rmasMarketCover > 0
      ) {
        totalCommission -= inv.payoutDetails.rmasMarketCover;
        statement.push({
          id: `loss_cover_${inv.id}`,
          date: inv.payoutDetails.payoutDate,
          type:"commission",
          title: `RMAS Market Loss Cover`,
          source: bName,
          amount: -inv.payoutDetails.rmasMarketCover,
          details: [
            { label:"Business Name", value: bName },
            {
              label:"Completion Date",
              value: new Date(inv.payoutDetails.payoutDate).toLocaleDateString("en-IN",
              ),
            },
            {
              label:"Cover Amount",
              value: formatINR(inv.payoutDetails.rmasMarketCover),
            },
            {
              label:"Reason",
              value:"Deducted from RMAS Profit to cover market loss",
            },
          ],
        });
      }
      if (
        inv.payoutDetails.rmasSubsidyPays &&
        inv.payoutDetails.rmasSubsidyPays > 0
      ) {
        totalCommission -= inv.payoutDetails.rmasSubsidyPays;
        statement.push({
          id: `subsidy_${inv.id}`,
          date: inv.payoutDetails.payoutDate,
          type:"commission",
          title: `RMAS Government/Trust Subsidy`,
          source: bName,
          amount: -inv.payoutDetails.rmasSubsidyPays,
          details: [
            { label:"Business Name", value: bName },
            {
              label:"Completion Date",
              value: new Date(inv.payoutDetails.payoutDate).toLocaleDateString("en-IN",
              ),
            },
            {
              label:"Subsidy Amount",
              value: formatINR(inv.payoutDetails.rmasSubsidyPays),
            },
            {
              label:"Reason",
              value:"Deducted from RMAS Profit for subsidy payout",
            },
          ],
        });
      }
      if (inv.payoutDetails.happyIncomeTax > 0) {
        totalTax += inv.payoutDetails.happyIncomeTax;
        statement.push({
          id: `tax_set_${inv.id}`,
          date: inv.payoutDetails.payoutDate,
          type:"tax",
          title: `Settlement Tax Deduction`,
          source: iName,
          amount: inv.payoutDetails.happyIncomeTax,
          details: [
            { label:"Investor Name", value: iName },
            { label:"Business Name", value: bName },
            {
              label:"Completion Date",
              value: new Date(inv.payoutDetails.payoutDate).toLocaleDateString("en-IN",
              ),
            },
            {
              label:"Tax Deducted",
              value: formatINR(inv.payoutDetails.happyIncomeTax),
            },
          ],
        });
      }
    }
  });
  // Add Business Registration Charges
  state.businesses.forEach((b) => {
    if (b.registrationCommissionPaid && b.registrationCommissionPaid > 0) {
      totalCommission += b.registrationCommissionPaid;
      statement.push({
        id: `reg_bus_comm_${b.id}`,
        date: b.registrationDate,
        type:"commission",
        title: `Business Registration Fees`,
        source: b.name,
        amount: b.registrationCommissionPaid,
        details: [
          { label:"Business Name", value: b.name },
          { label:"Owner Name", value: b.ownerName },
          {
            label:"Registration Date",
            value: new Date(b.registrationDate).toLocaleDateString("en-IN"),
          },
          {
            label:"Required Funding Target",
            value: formatINR(b.fundingRequired),
          },
        ],
      });
    }
    if (b.taxPaid && b.taxPaid > 0) {
      totalTax += b.taxPaid;
      statement.push({
        id: `reg_bus_tax_${b.id}`,
        date: b.registrationDate,
        type:"tax",
        title: `Business Registration Tax`,
        source: b.name,
        amount: b.taxPaid,
        details: [
          { label:"Business Name", value: b.name },
          { label:"Owner Name", value: b.ownerName },
          {
            label:"Registration Date",
            value: new Date(b.registrationDate).toLocaleDateString("en-IN"),
          },
          { label:"GST / Tax Value", value:"18%" },
        ],
      });
    }
  });
  // Add Investor Registration Charges
  state.investors.forEach((i) => {
    if (i.rmasServiceCharge && i.rmasServiceCharge > 0) {
      totalCommission += i.rmasServiceCharge;
      statement.push({
        id: `reg_inv_comm_${i.id}`,
        date: i.joinDate,
        type:"commission",
        title: `Investor Registration Service Charge`,
        source: i.name,
        amount: i.rmasServiceCharge,
        details: [
          { label:"Investor Name", value: i.name },
          { label:"Investor ID", value: `#${i.investorId}` },
          {
            label:"Registration Date",
            value: new Date(i.joinDate).toLocaleDateString("en-IN"),
          },
        ],
      });
    }
  });
  // Sort statement by date
  statement.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  // Filter Statement
  const filteredStatement = statement.filter((s) => {
    if (fromDate && new Date(s.date) < new Date(fromDate)) return false;
    if (toDate && new Date(s.date) > new Date(toDate)) return false;
    return true;
  });
  const handlePrint = () => {
    downloadElementAsPDF("pnl-statement-table","RMAS_PnL_Statement");
  };
  const handlePrintBill = () => {
    downloadElementAsPDF("pnl-bill-receipt","RMAS_Receipt");
  };
  if (showStatement) {
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:p-4 pb-6 border-b border-kite-border print:hidden">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowStatement(false)}
              className="p-2 rounded-full hover:bg-kite-bg text-kite-text-light transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>
            <div>
              <h2 className="text-[11px] md:text-[12px] font-medium text-kite-text tracking-tight">
                P&L Detailed Statement
              </h2>
              <p className="text-[13px] md:text-[14px] text-kite-text-light mt-1">
                Transaction history of commissions and taxes collected.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-transparent border-b border-kite-border px-3 py-2">
              <Calendar className="w-3 md:w-4 h-3 md:h-4 text-kite-text-light" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-[13px] md:text-[14px] outline-none bg-transparent"
              />
            </div>
            <span className="text-kite-text-light">to</span>
            <div className="flex items-center space-x-2 bg-transparent border-b border-kite-border px-3 py-2">
              <Calendar className="w-3 md:w-4 h-3 md:h-4 text-kite-text-light" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-[13px] md:text-[14px] outline-none bg-transparent"
              />
            </div>
            <button className="font-medium "
            >
              <Download className="w-3 md:w-4 h-3 md:h-4" />
              <span>Download / Print</span>
            </button>
          </div>
        </div>
        <div
          id="pnl-statement-table"
          className="bg-white dark:bg-kite-surface border-t border-kite-border overflow-hidden"
        >
          <div className="hidden print:block p-2 md:p-4 mb-4 md:mb-8">
            <h2 className="text-[11px] md:text-[12px] font-medium text-kite-text tracking-tight border-b-2 border-black pb-2 mb-4">
              RMAS P&L Statement
            </h2>
            <p className="text-[13px] md:text-[14px] text-kite-text-light mb-2">
              Generated on: {new Date().toLocaleDateString("en-IN")}{""}
              {new Date().toLocaleTimeString("en-IN")}
            </p>
            {(fromDate || toDate) && (
              <p className="text-[13px] md:text-[14px] text-kite-text-light mb-4 whitespace-nowrap">
                Period:{""}
                {fromDate
                  ? new Date(fromDate).toLocaleDateString("en-IN")
                  :"Start"}{""}
                to{""}
                {toDate
                  ? new Date(toDate).toLocaleDateString("en-IN")
                  :"Present"}
              </p>
            )}
          </div>
          <div className="hidden md:block overflow-x-auto w-full max-w-full">
            <table className="w-full text-left text-[13px] md:text-[14px] min-w-[800px]">
              <thead className="bg-kite-bg border-b border-kite-border uppercase text-[10px] md:text-[11px] tracking-wider text-kite-text-light">
                <tr>
                  <th className="py-4 px-6 w-32">Date</th>
                  <th className="py-4 px-6 text-center w-32">Type</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Source Party</th>
                  <th className="py-4 px-6 text-right">Credit Amount</th>
                  <th
                    data-html2canvas-ignore="true"
                    className="py-4 px-6 text-center print:hidden"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kite-border-soft text-[13px] md:text-[14px]">
                {filteredStatement.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-kite-text-light uppercase tracking-widest text-[11px] md:text-[12px]"
                    >
                      No Records Found for the selected dates.
                    </td>
                  </tr>
                ) : (
                  filteredStatement.map((row) => (
                    <tr
                      key={`pnl_desk_${row.id}`}
                      className="hover:bg-kite-bg transition-colors group"
                    >
                      <td className="py-4 px-6 text-kite-text-light whitespace-nowrap">
                        {new Date(row.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-2 py-1 text-[10px] md:text-[11px] uppercase tracking-widest rounded-sm ${row.type ==="commission" ?"bg-kite-blue/20 text-blue-800" :"bg-blue-100 text-blue-800"}`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-kite-text font-medium">
                        {row.title}
                      </td>
                      <td className="py-4 px-6 text-kite-text-light">
                        {row.source}
                      </td>
                      <td className="py-4 px-6 text-right text-kite-text font-medium">
                        {formatINR(row.amount)}
                      </td>
                      <td
                        data-html2canvas-ignore="true"
                        className="py-4 px-6 text-center print:hidden"
                      >
                        <button
                          onClick={() => setSelectedBill(row)}
                          className="px-3 py-1 bg-white dark:bg-kite-surface border border-kite-border text-[11px] md:text-[12px] rounded-sm hover:bg-kite-bg transition-colors text-kite-text inline-flex items-center space-x-1"
                        >
                          <FileText className="w-3 md:w-3.5 h-3 md:h-3.5" />
                          <span>View Bill</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile View */}{""}
          <div className="block md:hidden divide-y divide-kite-border-soft">
            {filteredStatement.length === 0 ? (
              <div className="py-12 text-center text-kite-text-light uppercase tracking-widest text-[11px] md:text-[12px]">
                No Records Found.
              </div>
            ) : (
              filteredStatement.map((row) => (
                <div key={`pnl_mob_${row.id}`} className="p-2 md:p-4 bg-white dark:bg-kite-surface">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-kite-text">
                      {row.title}
                    </span>
                    <span
                      className={`px-2 py-1 text-[10px] md:text-[11px] uppercase tracking-widest rounded-sm ${row.type ==="commission" ?"bg-kite-blue/20 text-blue-800" :"bg-blue-100 text-blue-800"}`}
                    >
                      {row.type}
                    </span>
                  </div>
                  <div className="text-[11px] md:text-[12px] text-kite-text-light mb-3 flex items-center justify-between">
                    <span>
                      {new Date(row.date).toLocaleDateString("en-IN")}
                    </span>
                    <span className="font-medium text-kite-text-light">
                      From: {row.source}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-kite-border">
                    <div className="font-medium text-kite-text text-[11px] md:text-[12px]">
                      {formatINR(row.amount)}
                    </div>
                    <button
                      onClick={() => setSelectedBill(row)}
                      className="px-3 py-1.5 bg-kite-bg border border-kite-border text-[11px] md:text-[12px] font-medium rounded-sm hover:bg-kite-bg transition-colors text-kite-text inline-flex items-center space-x-1"
                    >
                      <FileText className="w-3 md:w-3.5 h-3 md:h-3.5" />
                      <span>View Bill</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {selectedBill && (
          <div className="fixed inset-0 z-[60] bg-black/60 dark:bg-black/70 flex flex-col items-center justify-center p-2 md:p-4 print:hidden">
            <div className="bg-white dark:bg-kite-surface max-w-lg w-full rounded-sm relative flex flex-col">
              <div className="flex justify-between items-center p-2 md:p-4 border-b border-kite-border">
                <h3 className="text-[11px] md:text-[12px] tracking-tight text-kite-text flex items-center">
                  RADHIKA MA
                  <span className="text-kite-blue ml-1">SERVICE</span>
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePrintBill}
                    className="px-3 py-1.5 text-[13px] md:text-[14px] bg-black text-white hover:bg-gray-800 rounded-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Download className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span>Download Bill</span>
                  </button>
                  <button
                    onClick={() => setSelectedBill(null)}
                    className="text-kite-text-light hover:text-kite-text transition-colors"
                  >
                    <X className="w-4 h-4 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
              <div id="pnl-bill-receipt" className="bg-white dark:bg-kite-surface">
                <div className="p-2 md:p-4 space-y-6">
                  <div className="text-center pb-6 border-b border-dashed border-kite-border relative">
                    <p className="text-[11px] md:text-[12px] uppercase tracking-widest text-kite-text-light mb-1">
                      Receipt for
                    </p>
                    <p className="text-[11px] md:text-[12px] font-medium text-kite-text">
                      {selectedBill.title}
                    </p>
                    <div className="absolute top-0 right-0 opacity-10">
                      <FileText className="w-10 h-10 md:w-16 md:h-16" />
                    </div>
                  </div>
                  <div className="space-y-4 text-[13px] md:text-[14px] border-b border-dashed border-kite-border pb-6">
                    {selectedBill.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start"
                      >
                        <span className="text-kite-text-light">
                          {detail.label}
                        </span>
                        <span className="text-kite-text text-right font-medium max-w-[60%] break-words leading-tight">
                          {detail.value}
                        </span>
                      </div>
                    ))}{""}
                    <div className="flex justify-between items-start pt-2 border-t border-kite-border">
                      <span className="text-kite-text-light">Date</span>
                      <span className="text-kite-text text-right font-medium">
                        {new Date(selectedBill.date).toLocaleDateString("en-IN",
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-kite-text-light">
                        Transaction ID
                      </span>
                      <span className="text-kite-text text-right text-[11px] md:text-[12px] bg-kite-bg font-mono px-2 py-0.5 rounded">
                        {selectedBill.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] md:text-[12px] text-kite-text font-medium">
                      Total Billed
                    </span>
                    <span className="text-[11px] md:text-[12px] text-kite-text font-medium">
                      {formatINR(selectedBill.amount)}
                    </span>
                  </div>
                </div>
                <div className="bg-kite-bg p-2 md:p-4 text-center border-t border-kite-border">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light">
                    This is an auto-generated system receipt. All taxes and
                    commissions are properly recorded according to RMAS
                    policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-[11px] md:text-[12px] font-medium text-kite-text tracking-tight">
          MY P&L Overview
        </h2>
        <p className="text-[13px] md:text-[14px] text-kite-text-light mt-2">
          Track total administrative commissions and tax deductions collected
          across all investments.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <div className="bg-transparent border-y md:border-t border-kite-border p-2 md:p-4">
          <div className="flex items-center justify-between gap-2 md:p-4 mb-3 md:mb-6">
            <span className="uppercase tracking-widest text-[11px] md:text-[12px] text-kite-blue">
              RMAS Profit Balance
            </span>
            <Percent className="w-4 h-4 md:w-6 md:h-6 text-blue-200" />
          </div>
          <div>
            <p className="text-[11px] md:text-[12px] tracking-tight text-kite-text mb-2">
              {formatINR(rmasAvailableBalance)}
            </p>
            <p className="text-[10px] md:text-[11px] text-kite-text-light font-medium uppercase tracking-widest">
              Revenue from RMAS Admin Deductions
            </p>
          </div>
        </div>
        <div className="bg-transparent border-y md:border-t border-kite-border p-2 md:p-4">
          <div className="flex items-center justify-between gap-2 md:p-4 mb-3 md:mb-6">
            <span className="uppercase tracking-widest text-[11px] md:text-[12px] text-blue-600">
              HPG ITC TAX
            </span>
            <Landmark className="w-4 h-4 md:w-6 md:h-6 text-blue-200" />
          </div>
          <div>
            <p className="text-[11px] md:text-[12px] tracking-tight text-kite-text mb-2">
              {formatINR(totalTax)}
            </p>
            <p className="text-[10px] md:text-[11px] text-kite-text-light font-medium uppercase tracking-widest">
              Revenue from Tax Deductions
            </p>
          </div>
        </div>
      </div>
      <div className="pt-8 w-full md:w-auto">
        <button
          onClick={() => setShowStatement(true)}
          className="w-full md:w-auto bg-black text-white py-3 md:py-3.5 px-8 md:px-10 rounded-sm flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors text-[13px] md:text-[14px]"
        >
          <List className="w-4 h-4 md:w-5 md:h-5" />
          <span>View Detailed P&L Statement</span>
        </button>
      </div>
    </div>
  );
}
