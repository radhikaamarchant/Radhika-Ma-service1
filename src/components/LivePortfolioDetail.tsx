import React, { useState, useEffect } from "react";
import { ArrowLeft, MoreVertical, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../utils/AppContext";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { calculateLiveProfit as globalCalculateLiveProfit } from "../utils/profitCalculator";
import { formatINR } from "../utils/mockData";
import { MobilePortfolioSummary } from "./MobilePortfolioSummary";
import { SwipeButton } from "./SwipeButton";

export function LivePortfolioDetail({
  selectedInvestment,
  onClose,
  onBuyClick,
  onSellClick,
}: any) {
  const { state, dispatch } = useAppContext();
  const { marketState } = useMarketSimulation();

  const [selectedInvestmentIds, setSelectedInvestmentIds] = useState<string[]>(
    selectedInvestment?.groupedInvestmentsList?.map((i: any) => i.id) || [],
  );
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [withdrawFormData, setWithdrawFormData] = useState({
    completedMonths: selectedInvestment?.timePeriodMonths?.toString() || "12",
    rmasCommission: "0.00",
    happyIncomeTax: "0.00",
  });
  const [showTradeOptions, setShowTradeOptions] = useState(false);

  const setSelectedInvestment = (val: any) => {
    if (!val) onClose();
  };

  useEffect(() => {
    if (selectedInvestment) {
      setSelectedInvestmentIds(
        selectedInvestment.groupedInvestmentsList.map((i: any) => i.id),
      );
      setWithdrawStep(0);
    }
  }, [selectedInvestment]);

  // Inject modalCode
  if (!selectedInvestment) return null;

    const business = state.businesses.find(
      (b) => b.id === selectedInvestment.businessId,
    );
    const investor = state.investors.find(
      (i) => i.id === selectedInvestment.investorId,
    );
    const overallTrend = marketState.trends[selectedInvestment.businessId] || 0;
    const isCompleted = selectedInvestment.status === "completed";
    const activeGroupedInvestments =
      selectedInvestment.groupedInvestmentsList.filter((i: any) =>
        selectedInvestmentIds.includes(i.id),
      );
    const totalAmount = activeGroupedInvestments.reduce(
      (sum: number, i: any) => sum + i.amount,
      0,
    );
    const calculateLiveProfit = () => {
      const { liveProfit } = globalCalculateLiveProfit(
        activeGroupedInvestments,
        selectedInvestment.businessId,
        marketState.trends,
        state.settings,
      );
      const completed = Number(withdrawFormData.completedMonths) || 12;
      const scaledProfit = liveProfit * (completed / 12);
      return {
        totalProfit: scaledProfit,
        fullLiveProfit: liveProfit,
        rmasMarketCover: 0,
      };
    };
    useKeyboardShortcuts({
    'enter': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    },
    'shift+enter': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    },
    'shift': (e) => {
      if (withdrawStep === 1) {
        e.preventDefault();
        handleConfirmWithdraw();
      }
    }
  }, withdrawStep === 1);

  const handleConfirmWithdraw = () => {
      const profitDetails = calculateLiveProfit();
      const prematurePenalty = Math.max(
        0,
        profitDetails.fullLiveProfit - profitDetails.totalProfit,
      );
      const rmasFee = Number(withdrawFormData.rmasCommission) || 0;
      const happyTax = Number(withdrawFormData.happyIncomeTax) || 0;
      const totalCredited = Math.max(
        0,
        totalAmount + profitDetails.totalProfit - rmasFee - happyTax,
      );
      let rmasSubsidyPays = 0;
      if (business && business.rmasSubsidy && business.rmasSubsidy > 0) {
        rmasSubsidyPays =
          totalAmount *
          (business.rmasSubsidy / 100) *
          ((Number(withdrawFormData.completedMonths) || 12) / 12);
      }
      const numSelected = activeGroupedInvestments.length;
      if (numSelected === 0) return;
      activeGroupedInvestments.forEach((invToUpdate: any) => {
        const ratio = invToUpdate.amount / totalAmount;
        dispatch({
          type: "UPDATE_INVESTMENT",
          payload: {
            ...invToUpdate,
            status: "completed",
            payoutDetails: {
              rmasCommission: rmasFee * ratio,
              happyIncomeTax: happyTax * ratio,
              rmasPrematurePenalty: prematurePenalty * ratio,
              totalCredited: totalCredited * ratio,
              payoutDate: new Date().toISOString().split("T")[0],
              rmasMarketCover: profitDetails.rmasMarketCover * ratio,
              rmasSubsidyPays: rmasSubsidyPays * ratio,
            },
          },
        });
      });
      setSelectedInvestment(null);
      setWithdrawStep(0);
    };
    const expectedFixedProfit = activeGroupedInvestments.reduce(
      (sum: number, i: any) => sum + (i.amount * i.interestRate) / 100,
      0,
    );
    const actualDetailProfit = activeGroupedInvestments.reduce(
      (sum: number, i: any) => {
        const tr = marketState.trends[i.businessId] || 0;
        return sum + (i.amount * tr) / 100;
      },
      0,
    );
    const isDetailTotalProfit = actualDetailProfit >= 0;
    let groupLiveProf = 0;
    let groupCurrentVal = totalAmount;
    if (!isCompleted) {
      const { liveProfit, currentValue } = globalCalculateLiveProfit(
        activeGroupedInvestments,
        selectedInvestment.businessId,
        marketState.trends,
        state.settings,
      );
      groupLiveProf = liveProfit;
      groupCurrentVal = currentValue;
    }
    const holdingProfit = isCompleted ? actualDetailProfit : groupLiveProf;
    const curValue = isCompleted
      ? totalAmount + holdingProfit
      : groupCurrentVal;
    const isProfit = holdingProfit >= 0;
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4">
        <div className="absolute inset-0 max-md:bg-white max-md:dark:bg-kite-bg md:bg-black/40 dark:md:bg-black/70" onClick={() => setSelectedInvestment(null)}></div>
        {""}
        <div className="bg-white dark:bg-kite-surface md:rounded w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl flex flex-col overflow-hidden relative md:shadow-xl dark:md:shadow-none md:border md:border-gray-200 dark:md:border-[#383838]">
          {""}
          <div className="shrink-0 bg-white dark:bg-kite-surface border-b border-kite-border px-3 py-2 md:px-4 md:py-3 flex justify-between items-center z-10 mobile-modal-safe">
            {""}
            <div className="flex items-center space-x-2">
              {""}
              <button
                onClick={() => setSelectedInvestment(null)}
                className="p-2 -ml-2 text-kite-text hover:bg-gray-50 dark:md:hover:bg-[#131415] rounded-full transition-colors"
              >
                {""}
                <ArrowLeft className="w-[24px] h-[24px]" />
                {""}
              </button>
              {""}
              <h3 className="font-medium text-[15px] md:text-[16px] ] text-kite-text">
                {""}
                Portfolio Details{""}
              </h3>
              {""}
            </div>
            {""}
            <div className="flex items-center relative">
              {""}
              {selectedInvestment.status === "active" && (
                <div className="relative">
                  {""}
                  <button
                    onClick={() => setShowTradeOptions(!showTradeOptions)}
                    className="md:hidden p-2 -mr-2 text-kite-text hover:bg-gray-50 dark:md:hover:bg-[#131415] rounded-full transition-colors outline-none"
                  >
                    {""}
                    <MoreVertical className="w-[24px] h-[24px]" />
                    {""}
                  </button>
                  {""}
                  <div className="hidden md:flex items-center space-x-3 mr-2">
                    <button
                      onClick={() => {
                        setShowTradeOptions(false);
                        if (onBuyClick) onBuyClick(selectedInvestment);
                      }}
                      className="px-4 py-1.5 bg-[#4184F3] hover:bg-[#387ED1] text-white text-[13px] font-medium rounded transition-colors outline-none"
                    >
                      ADD
                    </button>
                    <button
                      onClick={() => {
    setShowTradeOptions(false);
    let defaultComm = 0;
    let defaultTax = 0;
    const prof = globalCalculateLiveProfit(
      selectedInvestment.groupedInvestmentsList.filter(
        (i: any) => selectedInvestmentIds.includes(i.id),
      ),
      selectedInvestment.businessId,
      marketState.trends,
      state.settings,
    ).liveProfit;
    if (state.settings) {
      if (state.settings.rmasCommission?.enabled) {
        defaultComm =
          state.settings.rmasCommission.type === "percentage"
            ? (prof * state.settings.rmasCommission.value) / 100
            : state.settings.rmasCommission.value;
      }
      if (state.settings.tax?.enabled) {
        defaultTax =
          state.settings.tax.type === "percentage"
            ? (prof * state.settings.tax.value) / 100
            : state.settings.tax.value;
      }
    }
    setWithdrawFormData({
      ...withdrawFormData,
      completedMonths: String(selectedInvestment.timePeriodMonths),
      rmasCommission: Math.max(0, defaultComm).toFixed(2),
      happyIncomeTax: Math.max(0, defaultTax).toFixed(2),
    });
    setWithdrawStep(1);
  }}
                      className="px-4 py-1.5 bg-[#DF514C] dark:bg-[#E25F5B] hover:bg-[#C93B3B] text-white text-[13px] font-medium rounded transition-colors outline-none"
                    >
                      SELL
                    </button>
                  </div>
                  {""}
                  <AnimatePresence>
                    {""}
                    {showTradeOptions && (
                      <>
                        {""}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowTradeOptions(false)}
                        ></div>
                        {""}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute top-full right-0 mt-1 w-[100px] bg-white dark:bg-kite-surface shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-kite-border rounded-[12px] overflow-hidden z-50 py-0.5"
                        >
                          {""}
                          <button
                            className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-kite-blue hover:bg-kite-bg dark:md:hover:bg-[#131415] transition-colors"
                            onClick={() => {
                              setShowTradeOptions(false);
                              if (onBuyClick) onBuyClick(selectedInvestment);
                            }}
                          >
                            {""}
                            BUY{""}
                          </button>
                          {""}
                          <button
                            className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-[#DF514C] dark:text-[#E25F5B] hover:bg-kite-bg dark:md:hover:bg-[#131415] transition-colors border-t border-kite-border"
                            onClick={() => {
    setShowTradeOptions(false);
    let defaultComm = 0;
    let defaultTax = 0;
    const prof = globalCalculateLiveProfit(
      selectedInvestment.groupedInvestmentsList.filter(
        (i: any) => selectedInvestmentIds.includes(i.id),
      ),
      selectedInvestment.businessId,
      marketState.trends,
      state.settings,
    ).liveProfit;
    if (state.settings) {
      if (state.settings.rmasCommission?.enabled) {
        defaultComm =
          state.settings.rmasCommission.type === "percentage"
            ? (prof * state.settings.rmasCommission.value) / 100
            : state.settings.rmasCommission.value;
      }
      if (state.settings.tax?.enabled) {
        defaultTax =
          state.settings.tax.type === "percentage"
            ? (prof * state.settings.tax.value) / 100
            : state.settings.tax.value;
      }
    }
    setWithdrawFormData({
      ...withdrawFormData,
      completedMonths: String(selectedInvestment.timePeriodMonths),
      rmasCommission: Math.max(0, defaultComm).toFixed(2),
      happyIncomeTax: Math.max(0, defaultTax).toFixed(2),
    });
    setWithdrawStep(1);
  }}
>
                      SELL
                    </button>
</motion.div>
</>
)}
</AnimatePresence>
                  </div>
                )}
              </div>
            </div>
                <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg">
                  {""}
                  <>
                    {""}
                    <div className="flex justify-between items-start mb-4">
                      {""}
                      <div>
                        {""}
                        <h4 className="text-[15px] md:text-[16px] leading-[20px] font-normal text-kite-blue uppercase">
                          {""}
                          {business?.shortName ? business.shortName.toUpperCase() : business?.name?.toUpperCase()}{""}
                        </h4>{""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mt-0.5">
                          {""}
                          Investment ID: #{selectedInvestment.id} •{""}
                          {selectedInvestment.status.toUpperCase()}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <span
                          className={"inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] md:text-[11px] font-medium" +
                            (overallTrend >= 0
                              ?"bg-[#E6F6ED] dark:bg-[#5B9A5D]/$1 text-[#4CAF50] dark:text-[#5B9A5D]"
                              :"bg-[#FCEBEB] dark:bg-[#E25F5B]/$1 text-[#DF514C] dark:text-[#E25F5B]")
                          }
                        >
                          {""}
                          {overallTrend >= 0 ?"+" :""}{""}
                          {overallTrend.toFixed(2)}%{""}
                        </span>{""}
                      </div>{""}
                    </div>{""}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 pb-4 border-b border-kite-border">
                      {""}
                      <div>
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Capital Invested{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] ] font-medium text-kite-text">
                          {""}
                          {formatINR(totalAmount)}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Current Value{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] ] font-medium text-kite-text">
                          {""}
                          {formatINR(curValue)}{""}
                        </p>{""}
                      </div>{""}
                      <div>
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Live P&L{""}
                        </p>{""}
                        <p
                          className={"text-[13px] md:text-[14px] ] font-medium" +
                            (isProfit
                              ? selectedInvestment.status ==="completed"
                                ?"text-kite-blue"
                                :"text-[#4CAF50] dark:text-[#5B9A5D]"
                              :"text-[#DF514C] dark:text-[#E25F5B]")
                          }
                        >
                          {""}
                          {isProfit ?"+" :""} {formatINR(holdingProfit)}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Investor{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                          {""}
                          {investor?.name?.toUpperCase()}{""}
                        </p>{""}
                      </div>{""}
                      <div>
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Start Date{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                          {""}
                          {activeGroupedInvestments.length > 1
                            ?"Multiple Dates"
                            : new Date(
                                selectedInvestment.startDate,
                              ).toLocaleDateString("en-IN")}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Expected Maturity{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                          {""}
                          {activeGroupedInvestments.length > 1
                            ?"Multiple Dates"
                            : new Date(
                                selectedInvestment.endDate,
                              ).toLocaleDateString("en-IN")}{""}
                        </p>{""}
                      </div>{""}
                    </div>{""}
                    {selectedInvestment.groupedInvestmentsList.length > 1 &&
                      withdrawStep === 0 && (
                        <div className="pt-5 mb-2">
                          {""}
                          <p className="text-[11px] md:text-[12px] font-medium text-kite-text-light uppercase tracking-[0.5px] mb-3">
                            {""}
                            {selectedInvestment.status ==="active"
                              ?"SELECT QUANTITIES TO BOOK PROFIT"
                              :"SELECT QUANTITIES TO VIEW"}{""}
                          </p>{""}
                          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mt-2">
                            {""}
                            <label className="flex items-center justify-between cursor-pointer pb-3 border-b border-kite-border">
                              {""}
                              <span className="text-[13px] md:text-[14px] text-kite-text">
                                {""}
                                {selectedInvestment.status ==="active"
                                  ?"Withdraw All Quantities"
                                  :"View All Quantities"}{""}
                              </span>{""}
                              <div className="relative">
                                {""}
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={
                                    selectedInvestmentIds.length ===
                                    selectedInvestment.groupedInvestmentsList
                                      .length
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedInvestmentIds(
                                        selectedInvestment.groupedInvestmentsList.map(
                                          (i: any) => i.id,
                                        ),
                                      );
                                    } else {
                                      setSelectedInvestmentIds([]);
                                    }
                                  }}
                                />{""}
                                <div
                                  className={`block w-9 h-5 rounded-full transition-colors ${selectedInvestmentIds.length === selectedInvestment.groupedInvestmentsList.length ?"bg-kite-blue" :"bg-kite-border"}`}
                                ></div>{""}
                                <div
                                  className={`absolute left-0.5 top-0.5 bg-white dark:bg-kite-surface w-4 h-4 rounded-full transition-transform ${selectedInvestmentIds.length === selectedInvestment.groupedInvestmentsList.length ?"transform translate-x-4" :""}`}
                                ></div>{""}
                              </div>{""}
                            </label>{""}
                            {selectedInvestment.groupedInvestmentsList.map(
                              (invUnit: any, idx: number) => {
                                const unitProf = globalCalculateLiveProfit(
                                  [invUnit],
                                  selectedInvestment.businessId,
                                  marketState.trends,
                                  state.settings,
                                ).liveProfit;
                                const unitCurVal = invUnit.amount + unitProf;
                                const unitIsProfit = unitProf >= 0;
                                return (
                                  <label
                                    key={`invUnit_${invUnit.id}_${idx}`}
                                    className="flex items-start space-x-3 cursor-pointer py-1 border-b border-kite-bg last:border-0"
                                  >
                                    {""}
                                    <div className="pt-2">
                                      {""}
                                      <input
                                        type="checkbox"
                                        checked={selectedInvestmentIds.includes(
                                          invUnit.id,
                                        )}
                                        onChange={(e) => {
                                          if (e.target.checked)
                                            setSelectedInvestmentIds([
                                              ...selectedInvestmentIds,
                                              invUnit.id,
                                            ]);
                                          else
                                            setSelectedInvestmentIds(
                                              selectedInvestmentIds.filter(
                                                (id) => id !== invUnit.id,
                                              ),
                                            );
                                        }}
                                        className="rounded text-kite-blue focus:ring-[#387ED1] cursor-pointer w-[16px] h-[16px] border-kite-border"
                                      />{""}
                                    </div>{""}
                                    <div className="hidden md:flex flex-1 items-center justify-between pt-1.5">
                                      {""}
                                      <span className="text-kite-text-light text-[13px] md:text-[14px] truncate max-w-[120px]">
                                        {""}
                                        #{invUnit.id}{""}
                                      </span>{""}
                                      <span className="font-medium text-kite-text text-[13px] md:text-[14px]">
                                        {""}
                                        {formatINR(invUnit.amount)}{""}
                                      </span>{""}
                                    </div>{""}
                                    <div className="md:hidden flex-1 flex justify-between items-center">
                                      {""}
                                      <div className="flex flex-col">
                                        {""}
                                        <span className="text-[11px] md:text-[12px] text-kite-text-light">
                                          Invested
                                        </span>{""}
                                        <span className="text-[13px] md:text-[14px] font-medium text-kite-text">
                                          {formatINR(invUnit.amount)}
                                        </span>{""}
                                      </div>{""}
                                      <div className="flex flex-col items-end">
                                        {""}
                                        <div className="flex items-center gap-1.5">
                                          {""}
                                          <span className="text-[11px] md:text-[12px] text-kite-text-light">
                                            Current
                                          </span>{""}
                                          <span className="text-[13px] md:text-[14px] font-medium text-kite-text">
                                            {formatINR(unitCurVal)}
                                          </span>{""}
                                        </div>{""}
                                        <span
                                          className={`text-[11px] md:text-[12px] font-normal ${unitIsProfit ? (selectedInvestment.status ==="completed" ?"text-kite-blue" :"text-[#4CAF50] dark:text-[#5B9A5D]") :"text-[#DF514C] dark:text-[#E25F5B]"}`}
                                        >
                                          {""}
                                          {unitIsProfit ?"+" :""}
                                          {formatINR(unitProf)}{""}
                                        </span>{""}
                                      </div>{""}
                                    </div>{""}
                                  </label>
                                );
                              },
                            )}{""}
                          </div>{""}
                        </div>
                      )}{""}
                    {selectedInvestment.status ==="active" &&
                      withdrawStep === 1 && (
                        <div className="mt-4 pt-4 border-t border-kite-border/50">
                          {""}
                          <h4 className="text-[#DF514C] dark:text-[#E25F5B] font-medium text-[11px] md:text-[12px] tracking-wider mb-4">
                            {""}
                            SELL DETAILS{""}
                          </h4>{""}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {""}
                            <div>
                              {""}
                              <label className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-widest block mb-1">
                                {""}
                                Completed Months{""}
                              </label>{""}
                              <input
                                type="number"
                                className="w-full border-b border-kite-blue/30 py-1.5 text-[13px] md:text-[14px] outline-none font-medium bg-transparent focus:border-kite-blue"
                                value={withdrawFormData.completedMonths}
                                onChange={(e) =>
                                  setWithdrawFormData({
                                    ...withdrawFormData,
                                    completedMonths: e.target.value,
                                  })
                                }
                              />{""}
                            </div>{""}
                            <div>
                              {""}
                              <label className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-widest block mb-1">
                                {""}
                                RMAS Comm (₹){""}
                              </label>{""}
                              <input
                                type="number"
                                className="w-full border-b border-kite-border py-1.5 text-[13px] md:text-[14px] outline-none font-medium bg-transparent focus:border-kite-blue"
                                value={withdrawFormData.rmasCommission}
                                onChange={(e) =>
                                  setWithdrawFormData({
                                    ...withdrawFormData,
                                    rmasCommission: e.target.value,
                                  })
                                }
                              />{""}
                            </div>{""}
                            <div>
                              {""}
                              <label className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-widest block mb-1">
                                {""}
                                Income Tax (₹){""}
                              </label>{""}
                              <input
                                type="number"
                                className="w-full border-b border-kite-border py-1.5 text-[13px] md:text-[14px] outline-none font-medium bg-transparent focus:border-kite-red text-[#DF514C] dark:text-[#E25F5B]"
                                value={withdrawFormData.happyIncomeTax}
                                onChange={(e) =>
                                  setWithdrawFormData({
                                    ...withdrawFormData,
                                    happyIncomeTax: e.target.value,
                                  })
                                }
                              />{""}
                            </div>{""}
                          </div>{""}
                          <div className="flex flex-col gap-1.5 mb-6 text-[11px] md:text-[12px]">
                            {""}
                            <div className="flex justify-between items-center text-kite-text-light">
                              {""}
                              <span>P&L Current Trend:</span>{""}
                              <span
                                className={
                                  calculateLiveProfit().totalProfit >= 0
                                    ?"text-[#4CAF50] dark:text-[#5B9A5D] font-medium"
                                    :"text-[#DF514C] dark:text-[#E25F5B] font-medium"
                                }
                              >
                                {""}
                                {calculateLiveProfit().totalProfit > 0
                                  ?"+"
                                  :""}{""}
                                {(
                                  (calculateLiveProfit().totalProfit /
                                    totalAmount) *
                                  100
                                ).toFixed(2)}{""}
                                %{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between items-center text-kite-text-light">
                              {""}
                              <span>Net Yield:</span>{""}
                              <span
                                className={
                                  calculateLiveProfit().totalProfit < 0
                                    ?"text-[#DF514C] dark:text-[#E25F5B] font-medium"
                                    :"text-[#4CAF50] dark:text-[#5B9A5D] font-medium"
                                }
                              >
                                {""}
                                {calculateLiveProfit().totalProfit < 0
                                  ?"-"
                                  :"+"}{""}
                                {formatINR(
                                  Math.abs(calculateLiveProfit().totalProfit),
                                )}{""}
                              </span>{""}
                            </div>{""}
                          </div>{""}
                        </div>
                      )}{""}
                    {selectedInvestment.status ==="completed" &&
                      activeGroupedInvestments.some(
                        (i: any) => i.payoutDetails,
                      ) && (
                        <div className="p-4 bg-kite-green/5 border border-kite-green/20 rounded-sm">
                          {""}
                          <h4 className="font-medium text-[#4CAF50] dark:text-[#5B9A5D] flex items-center space-x-2 mb-4">
                            {""}
                            <CheckCircle className="w-4 h-4" />{""}
                            <span>Completed Settlement Breakdown</span>{""}
                          </h4>{""}
                          <div className="space-y-2 text-[13px] md:text-[14px] text-[#4CAF50] dark:text-[#5B9A5D]">
                            {""}
                            <div className="flex justify-between">
                              {""}
                              <span>Gross Payout (Capital + Profit)</span>{""}
                              <span className="font-medium">
                                {""}
                                {formatINR(
                                  activeGroupedInvestments.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.payoutDetails?.totalCredited || 0) +
                                      (i.payoutDetails?.rmasCommission || 0) +
                                      (i.payoutDetails?.happyIncomeTax || 0),
                                    0,
                                  ),
                                )}{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between text-[11px] md:text-[12px]">
                              {""}
                              <span>RMAS Commission Deducted</span>{""}
                              <span className="text-[#DF514C] dark:text-[#E25F5B]">
                                {""}
                                -{""}
                                {formatINR(
                                  activeGroupedInvestments.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.payoutDetails?.rmasCommission || 0),
                                    0,
                                  ),
                                )}{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between text-[11px] md:text-[12px]">
                              {""}
                              <span>Income Tax Deducted</span>{""}
                              <span className="text-[#DF514C] dark:text-[#E25F5B]">
                                {""}
                                -{""}
                                {formatINR(
                                  activeGroupedInvestments.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.payoutDetails?.happyIncomeTax || 0),
                                    0,
                                  ),
                                )}{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between pt-2 border-t border-kite-green/20 mt-2 font-medium">
                              {""}
                              <span>Net Amount Credited</span>{""}
                              <span>
                                {""}
                                {formatINR(
                                  activeGroupedInvestments.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.payoutDetails?.totalCredited || 0),
                                    0,
                                  ),
                                )}{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between text-[11px] md:text-[12px] mt-1 text-kite-text-light">
                              {""}
                              <span>Payout Date</span>{""}
                              <span className="font-mono">
                                {""}
                                {activeGroupedInvestments.length > 1
                                  ?"Multiple Dates"
                                  : new Date(
                                      activeGroupedInvestments[0]?.payoutDetails
                                        ?.payoutDate ||
                                        selectedInvestment.payoutDetails
                                          .payoutDate,
                                    ).toLocaleDateString("en-IN")}{""}
                              </span>{""}
                            </div>{""}
                          </div>{""}
                        </div>
                      )}{""}
                                </>
                </div>
                {withdrawStep === 0 &&
                  selectedInvestment.status === "active" && (
                    <div className="md:hidden">
                    <MobilePortfolioSummary
                      invested={formatINR(totalAmount)}
                      currentValue={formatINR(curValue)}
                      profit={`${isProfit ? "+" : ""}${formatINR(holdingProfit)}`}
                      isProfit={isProfit}
                      onSwipeSuccess={() => {
                        let defaultComm = 0;
                        let defaultTax = 0;
                        const prof = globalCalculateLiveProfit(
                          selectedInvestment.groupedInvestmentsList.filter(
                            (i: any) => selectedInvestmentIds.includes(i.id),
                          ),
                          selectedInvestment.businessId,
                          marketState.trends,
                          state.settings,
                        ).liveProfit;
                        if (state.settings) {
                          if (state.settings.rmasCommission?.enabled) {
                            defaultComm =
                              state.settings.rmasCommission.type === "percentage"
                                ? (prof * state.settings.rmasCommission.value) /
                                  100
                                : state.settings.rmasCommission.value;
                          }
                          if (state.settings.tax?.enabled) {
                            defaultTax =
                              state.settings.tax.type === "percentage"
                                ? (prof * state.settings.tax.value) / 100
                                : state.settings.tax.value;
                          }
                        }
                        setWithdrawFormData({
                          ...withdrawFormData,
                          completedMonths: String(
                            selectedInvestment.timePeriodMonths,
                          ),
                          rmasCommission: Math.max(0, defaultComm).toFixed(2),
                          happyIncomeTax: Math.max(0, defaultTax).toFixed(2),
                        });
                        setWithdrawStep(1);
                      }}
                    />
                  </div>
                )}
{withdrawStep === 1 && (
            <div className="shrink-0 p-3 md:p-4 z-20">
              {""}
              <div className="md:hidden">
                {""}
                <div className="flex justify-between items-center mb-3 px-1">
                  {""}
                  <div className="flex items-baseline space-x-2">
                    {""}
                    <span className="text-[11px] md:text-[12px] font-normal text-kite-text-muted uppercase tracking-wide">
                      {""}
                      Sell{""}
                    </span>
                    {""}
                    <span className="text-[13px] md:text-[14px] font-medium text-[#DF514C] dark:text-[#E25F5B]">
                      {""}
                      {formatINR(
                        Math.max(
                          0,
                          totalAmount +
                            calculateLiveProfit().totalProfit -
                            (Number(withdrawFormData.rmasCommission) || 0) -
                            (Number(withdrawFormData.happyIncomeTax) || 0),
                        ),
                      )}
                      {""}
                    </span>
                    {""}
                  </div>
                  {""}
                </div>
                {""}
                <div className="flex flex-col items-center">
                  {""}
                  <SwipeButton
                    text="SWIPE TO SELL"
                    successText="SETTLING..."
                    actionType="SELL"
                    onSuccess={handleConfirmWithdraw}
                  />
                  {""}
                </div>
                {""}
              </div>
              {""}
              <div className="hidden md:flex flex-col items-center">
                {""}
                <div className="flex justify-between items-center w-full mb-3 px-1">
                  {""}
                  <span className="text-[11px] md:text-[12px] font-normal text-kite-text-muted uppercase tracking-wide">
                    {""}
                    Sell Final Amt:{""}
                  </span>
                  {""}
                  <span className="text-[13px] md:text-[14px] font-medium text-[#DF514C] dark:text-[#E25F5B]">
                    {""}
                    {formatINR(
                      Math.max(
                        0,
                        totalAmount +
                          calculateLiveProfit().totalProfit -
                          (Number(withdrawFormData.rmasCommission) || 0) -
                          (Number(withdrawFormData.happyIncomeTax) || 0),
                      ),
                    )}
                    {""}
                  </span>
                  {""}
                </div>
                {""}
                <button
                  onClick={handleConfirmWithdraw}
                  className="w-full py-3 bg-[#DF514C] dark:bg-[#E25F5B] hover:bg-[#C93B3B] text-white font-medium rounded transition-colors uppercase tracking-wider text-[13px] md:text-[14px]"
                >
                  {""}
                  CONFIRM SELL{""}
                </button>
                {""}
              </div>
              {""}
            </div>
          )}
          {""}
        </div>
        {""}
      </div>
    );
}
