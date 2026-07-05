import React, { useState, useEffect } from "react";
import { ArrowLeft, MoreVertical, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../utils/AppContext";
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
  return (() => {
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
                className="p-2 -ml-2 text-kite-text hover:bg-gray-50 dark:hover:bg-[#202020] rounded-full transition-colors"
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
                    className="md:hidden p-2 -mr-2 text-kite-text hover:bg-gray-50 dark:hover:bg-[#202020] rounded-full transition-colors outline-none"
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
    if (onSellClick) {
      const activeInvs = selectedInvestment.groupedInvestmentsList.filter((i: any) => selectedInvestmentIds.includes(i.id));
      onSellClick(activeInvs);
    }
  }}
                      className="px-4 py-1.5 bg-[#D94B4B] hover:bg-[#C93B3B] text-white text-[13px] font-medium rounded transition-colors outline-none"
                    >
                      EXIT
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
                            className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-kite-blue hover:bg-kite-bg dark:hover:bg-[#202020] transition-colors"
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
                            className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-[#D94B4B] hover:bg-kite-bg dark:hover:bg-[#202020] transition-colors border-t border-kite-border"
                            onClick={() => {
    setShowTradeOptions(false);
    if (onSellClick) {
      const activeInvs = selectedInvestment.groupedInvestmentsList.filter((i: any) => selectedInvestmentIds.includes(i.id));
      onSellClick(activeInvs);
    }
  }}
>
  EXIT
</button>
</motion.div>
</>
)}
</AnimatePresence>
</div>
)}
</div>
</div>
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
                    <span className="text-[13px] md:text-[14px] font-medium text-kite-red">
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
                  <span className="text-[13px] md:text-[14px] font-medium text-kite-red">
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
                  className="w-full py-3 bg-[#D94B4B] hover:bg-[#C93B3B] text-white font-medium rounded transition-colors uppercase tracking-wider text-[13px] md:text-[14px]"
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
  })();
}
