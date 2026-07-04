import React, { useState } from "react";
import { useAppContext } from "../utils/AppContext";
import { Investor, Investment } from "../types";
import { formatINR } from "../utils/mockData";
import { LivePortfolioDetail } from "./LivePortfolioDetail";
import {
  getUnifiedBankBalance,
  getUnifiedTransactions,
} from "../utils/bankBalance";
import {
  ArrowLeft,
  User,
  Save,
  X,
  Edit2,
  Wallet,
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { calculateLiveProfit } from "../utils/profitCalculator";
import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
interface InvestorDetailProps {
  investorId: string;
  onBack: () => void;
  onWithdraw?: () => void;
}
export default function InvestorDetail({
  investorId,
  onBack,
  onWithdraw,
}: InvestorDetailProps) {
  const { state, dispatch } = useAppContext();
  const { marketState } = useMarketSimulation();
  const investor = state.investors.find((i) => i.id === investorId);
  if (!investor) return null;
  const investorInvestments = state.investments
    .filter((inv) => inv.investorId === investorId)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
  const activeInvestments = investorInvestments.filter(
    (inv) => inv.status === "active",
  );
  const totalAmountInvested = activeInvestments.reduce(
    (acc, inv) => acc + inv.amount,
    0,
  );
  let totalLiveProfit = 0;
  const grouped = activeInvestments.reduce(
    (acc, inv) => {
      if (!acc[inv.businessId]) acc[inv.businessId] = [];
      acc[inv.businessId].push(inv);
      return acc;
    },
    {} as Record<string, Investment[]>,
  );
  Object.entries(grouped).forEach(([bizId, invs]) => {
    const res = calculateLiveProfit(
      invs as Investment[],
      bizId,
      marketState.trends,
      state.settings,
    );
    totalLiveProfit += res.liveProfit;
  });
  const returnsEarned = investorInvestments
    .filter((inv) => inv.status === "completed")
    .reduce((acc, inv) => acc + (inv.interestEarned || 0), 0);
  const unifiedBalance = investor
    ? getUnifiedBankBalance(
        investor.name,
        state.businesses,
        state.investors,
        state.investments,
        state.settings,
      )
    : 0;
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);



  const [selectedPortfolioInvestment, setSelectedPortfolioInvestment] =
    useState<any>(null);
  useMobileBackNavigation(isEditingDetails, () => setIsEditingDetails(false));
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));

  const [formData, setFormData] = useState({
    name: investor?.name || "",
    mobile: investor?.mobile || "",
    email: investor?.email || "",
    address: investor?.address || "",
    bankName: investor?.bankDetails?.bankName || "",
    accountNumber: investor?.bankDetails?.accountNumber || "",
    ifscCode: investor?.bankDetails?.ifscCode || "",
    accountHolderName: investor?.bankDetails?.accountHolderName || "",
  });
  const handleSaveDetails = () => {
    dispatch({
      type: "UPDATE_INVESTOR",
      payload: {
        ...investor,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
        },
      },
    });
    setIsEditingDetails(false);
  };
  const handleDeleteInvestor = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteInvestor = () => {
    dispatch({ type: "DELETE_INVESTOR", payload: investorId });
    setShowDeleteConfirm(false);
    onBack();
  };
  return (
    <div className="space-y-4 md:space-y-6 animate-slide-in-mobile pb-20 pt-8 md:pt-0 px-3 md:px-0 max-w-4xl mx-auto">
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white dark:bg-kite-bg p-6 rounded-md max-w-sm w-full">
            <h3 className="text-[16px] font-medium text-kite-text mb-2">Delete Investor</h3>
            <p className="text-[14px] text-kite-text-light mb-6">Are you sure you want to permanently delete this investor and all of their investments? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[13px] font-medium text-kite-text border border-kite-border rounded-sm hover:bg-kite-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteInvestor}
                className="px-4 py-2 text-[13px] font-medium text-white bg-kite-red rounded-sm hover:bg-opacity-90 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {""}
      {/* Header */}
      {""}
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-500 hover:text-kite-text transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          {" "}
          <ArrowLeft className="w-5 h-5" />{" "}
        </button>
        <div className="flex flex-col">
          <h2 className="text-[15px] md:text-[16px] md:text-[16px] font-medium text-kite-text">
            {investor.name?.toUpperCase()}
          </h2>
          <span
            className="text-[11px] md:text-[12px] text-kite-text-light tracking-wide"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            #{investor.investorId}
          </span>
        </div>
      </div>
      {""}
      {isEditingDetails ? (
        <div className="bg-white dark:bg-kite-surface border border-kite-border rounded-sm p-4 md:p-6 animate-fade-in">
          <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text mb-4 pb-2 border-b border-kite-border">
            Edit Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Investor Name
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Address
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2 pt-4 pb-2">
              <h4 className="text-[11px] md:text-[12px] font-medium text-kite-text uppercase tracking-wider">
                Bank Details
              </h4>
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Bank Name
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Account Number
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                IFSC Code
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.ifscCode}
                onChange={(e) =>
                  setFormData({ ...formData, ifscCode: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Account Holder Name
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.accountHolderName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountHolderName: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mt-8 border-t border-kite-border pt-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <button
              onClick={handleDeleteInvestor}
              className="w-full sm:w-auto bg-white dark:bg-kite-surface text-kite-red border border-red-200 hover:bg-red-50 hover:border-red-300 font-medium text-[13px] md:text-[14px] px-4 py-2 rounded-sm transition-colors text-center"
            >
              {""}
              Delete Investor{""}
            </button>
            <div className="flex space-x-2 w-full sm:w-auto justify-end flex-1">
              <button
                onClick={() => setIsEditingDetails(false)}
                className="flex-1 sm:flex-none text-center bg-white dark:bg-kite-surface text-kite-text border border-kite-border hover:bg-kite-bg font-medium text-[13px] md:text-[14px] px-4 py-2 rounded-sm transition-colors"
              >
                {""}
                Cancel{""}
              </button>
              <button
                onClick={handleSaveDetails}
                className="flex-1 sm:flex-none text-center bg-kite-blue hover:bg-opacity-90 text-white font-medium text-[13px] md:text-[14px] px-4 py-2 rounded-sm transition-colors shadow-sm"
              >
                {""}
                Save Changes{""}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {""}
          {/* Action Buttons */}
          {""}
          <div className="flex flex-col sm:flex-row gap-3">
            {""}
            {onWithdraw && activeInvestments.length > 0 && (
              <button
                onClick={onWithdraw}
                className="flex-1 bg-kite-blue text-white hover:bg-opacity-90 font-medium text-[13px] md:text-[14px] px-4 py-3 sm:py-2.5 rounded-sm shadow-sm transition-all flex items-center justify-center"
              >
                {""}
                BIDS{""}
              </button>
            )}
            {""}
            <button
              onClick={() => setIsEditingDetails(true)}
              className="flex-1 bg-white dark:bg-kite-surface text-kite-text border border-kite-border hover:bg-kite-bg font-medium text-[13px] md:text-[14px] px-4 py-3 sm:py-2.5 rounded-sm shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <Edit2 className="w-4 h-4" /> <span>Edit Details</span>
            </button>
          </div>
          {""}
          {/* Stats Grid */}
          {""}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white dark:bg-kite-surface border border-kite-border rounded-sm p-3 md:p-4">
              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mb-1">
                Total Invested
              </p>
              <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                {formatINR(totalAmountInvested)}
              </p>
            </div>
            <div className="bg-white dark:bg-kite-surface border border-kite-border rounded p-3 md:p-4">
              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mb-1">
                Active Investments
              </p>
              <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                {activeInvestments.length}
              </p>
            </div>
            <div className="bg-white dark:bg-kite-surface border border-kite-border rounded p-3 md:p-4">
              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mb-1">
                Returns Earned
              </p>
              <p className="text-[13px] md:text-[14px] font-medium text-kite-green">
                +{formatINR(returnsEarned)}
              </p>
            </div>
            <div className="bg-white dark:bg-kite-surface border border-kite-border rounded p-3 md:p-4">
              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mb-1">
                Available Balance
              </p>
              <p
                className={`text-[13px] md:text-[14px] font-medium ${unifiedBalance >= 0 ? "text-kite-blue" : "text-kite-red"}`}
              >
                {""}
                {unifiedBalance >= 0 ? "" : "-"}
                {formatINR(Math.abs(unifiedBalance))}
                {""}
              </p>
            </div>
          </div>
          {""}
          {/* Bank Profile */}
          {""}
          <div className="bg-white dark:bg-kite-surface border border-kite-border rounded p-4">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-kite-border">
              <Building2 className="w-4 h-4 text-kite-text-light" />
              <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text">
                Bank Profile
              </h3>
            </div>
            {""}
            {investor.bankDetails ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                    Bank Name
                  </p>
                  <p className="text-[13px] md:text-[14px] font-medium text-kite-text mt-0.5">
                    {investor.bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                    Account No.
                  </p>
                  <p className="text-[13px] md:text-[14px] font-medium font-mono text-kite-text mt-0.5">
                    {investor.bankDetails.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                    IFSC Code
                  </p>
                  <p className="text-[13px] md:text-[14px] font-medium font-mono text-kite-text mt-0.5">
                    {investor.bankDetails.ifscCode}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                    Holder Name
                  </p>
                  <p className="text-[13px] md:text-[14px] font-medium text-kite-text mt-0.5">
                    {investor.bankDetails.accountHolderName}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] md:text-[14px] text-kite-text-light py-2">
                No bank details added.
              </p>
            )}
            {""}
          </div>
          {""}
          {/* Investment History */}
          {""}
          <div className="bg-white dark:bg-kite-surface border border-kite-border rounded overflow-hidden">
            <div className="p-4 border-b border-kite-border">
              <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text">
                Investment History
              </h3>
            </div>
            {""}
            {/* Desktop Table */}
            {""}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-[13px] md:text-[14px]">
                <thead className="bg-kite-bg/50">
                  <tr className="text-[11px] md:text-[12px] uppercase tracking-wider text-kite-text-light">
                    <th className="p-3 font-medium border-b border-kite-border">
                      Business
                    </th>
                    <th className="p-3 font-medium text-right border-b border-kite-border">
                      Amount
                    </th>
                    <th className="p-3 font-medium text-center border-b border-kite-border">
                      Duration
                    </th>
                    <th className="p-3 font-medium text-right border-b border-kite-border">
                      ROI %
                    </th>
                    <th className="p-3 font-medium text-center border-b border-kite-border">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kite-border">
                  {""}
                  {investorInvestments.map((inv, idx) => {
                    const business = state.businesses.find(
                      (b) => b.id === inv.businessId,
                    );
                    const duration = Math.ceil(
                      (new Date().getTime() -
                        new Date(inv.startDate).getTime()) /
                        (1000 * 3600 * 24),
                    );
                    return (
                      <tr
                        key={`desk_inv_det_${inv.id}_${idx}`}
                        className="hover:bg-kite-bg transition-colors cursor-pointer"
                        onClick={() => {
                          const bizInvs = investorInvestments.filter(
                            (i) => i.businessId === inv.businessId,
                          );
                          setSelectedPortfolioInvestment({
                            businessId: inv.businessId,
                            investorId: investor.id,
                            status: "active",
                            timePeriodMonths: bizInvs[0].timePeriodMonths,
                            interestRate: bizInvs[0].interestRate,
                            startDate: bizInvs[0].startDate,
                            endDate: bizInvs[0].endDate,
                            amount: bizInvs.reduce(
                              (acc, i) => acc + i.amount,
                              0,
                            ),
                            groupedInvestmentsList: bizInvs,
                          });
                        }}
                      >
                        <td className="p-3 font-medium text-kite-text">
                          {business?.name?.toUpperCase() || "UNKNOWN"}
                        </td>
                        <td className="p-3 font-medium text-right">
                          {formatINR(inv.amount)}
                        </td>
                        <td className="p-3 text-kite-text-light text-center">
                          {duration} Days
                        </td>
                        <td className="p-3 font-medium text-kite-green text-right">
                          {inv.interestRate}%
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] md:text-[11px] font-medium uppercase tracking-wider ${inv.status === "active" ? "bg-kite-green/10 text-kite-green" : inv.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-kite-border text-kite-text-light"}`}
                          >
                            {""}
                            {inv.status}
                            {""}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {""}
                  {investorInvestments.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-kite-text-light text-[11px] md:text-[12px]"
                      >
                        No investment history.
                      </td>
                    </tr>
                  )}
                  {""}
                </tbody>
              </table>
            </div>
            {""}
            {/* Mobile Rows */}
            {""}
            <div className="block md:hidden divide-y divide-kite-border">
              {""}
              {investorInvestments.map((inv, idx) => {
                const business = state.businesses.find(
                  (b) => b.id === inv.businessId,
                );
                const duration = Math.ceil(
                  (new Date().getTime() - new Date(inv.startDate).getTime()) /
                    (1000 * 3600 * 24),
                );
                return (
                  <div
                    key={`mob_inv_det_${inv.id}_${idx}`}
                    className="p-3 hover:bg-kite-bg cursor-pointer"
                    onClick={() => {
                      const bizInvs = investorInvestments.filter(
                        (i) => i.businessId === inv.businessId,
                      );
                      setSelectedPortfolioInvestment({
                        businessId: inv.businessId,
                        investorId: investor.id,
                        status: "active",
                        timePeriodMonths: bizInvs[0].timePeriodMonths,
                        interestRate: bizInvs[0].interestRate,
                        startDate: bizInvs[0].startDate,
                        endDate: bizInvs[0].endDate,
                        amount: bizInvs.reduce((acc, i) => acc + i.amount, 0),
                        groupedInvestmentsList: bizInvs,
                      });
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-[13px] md:text-[14px] text-kite-text">
                        {business?.name?.toUpperCase() || "UNKNOWN"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] md:text-[11px] font-medium uppercase tracking-wider ${inv.status === "active" ? "bg-kite-green/10 text-kite-green" : inv.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-kite-border text-kite-text-light"}`}
                      >
                        {""}
                        {inv.status}
                        {""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] md:text-[12px]">
                      <div className="flex flex-col">
                        <span className="text-kite-text-light">Amount</span>
                        <span className="font-medium text-kite-text">
                          {formatINR(inv.amount)}
                        </span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-kite-text-light">Duration</span>
                        <span className="font-medium text-kite-text">
                          {duration} Days
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-kite-text-light">ROI</span>
                        <span className="font-medium text-kite-green">
                          {inv.interestRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {""}
              {investorInvestments.length === 0 && (
                <div className="p-6 text-center text-kite-text-light text-[13px] md:text-[14px]">
                  No investment history.
                </div>
              )}
              {""}
            </div>
          </div>
        </>
      )}
      {""}
      {selectedPortfolioInvestment && (
        <LivePortfolioDetail
          selectedInvestment={selectedPortfolioInvestment}
          onClose={() => setSelectedPortfolioInvestment(null)}
        />
      )}
    </div>
  );
}
