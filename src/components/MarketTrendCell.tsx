import React from"react";
import { TrendingUp, TrendingDown } from"lucide-react";
import { useAppContext } from"../utils/AppContext";
import { useMarketSimulation } from"../utils/MarketSimulationContext";
interface MarketTrendCellProps {
  businessId: string;
  showIcon?: boolean;
  align?:"left" |"right" |"center";
}
export function MarketTrendCell({
  businessId,
  showIcon = false,
  align ="left",
}: MarketTrendCellProps) {
  const { state } = useAppContext();
  const { marketState } = useMarketSimulation();
  const business = state.businesses.find((b) => b.id === businessId);
  const trend =
    marketState.trends[businessId] ?? (business ? business.interestRate : 0);
  if (!business) return null;
  const isPositive = trend >= business.interestRate;
  return (
    <div
      className={`flex items-center space-x-2 font-medium flex-nowrap ${isPositive ?"text-[#4CAF50] dark:text-[#5B9A5D]" :"text-[#DF514C] dark:text-[#E25F5B]"} ${align ==="right" ?"justify-end" : align ==="center" ?"justify-center" :"justify-start"}`}
    >
      {""}
      {showIcon &&
        (isPositive ? (
          <TrendingUp className="w-3 md:w-3.5 h-3 md:h-3.5 flex-shrink-0" />
        ) : (
          <TrendingDown className="w-3 md:w-3.5 h-3 md:h-3.5 flex-shrink-0" />
        ))}{""}
      <span className="whitespace-nowrap">{trend.toFixed(2)}%</span>
    </div>
  );
}
