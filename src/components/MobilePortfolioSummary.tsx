import React from"react";
import { SwipeButton } from"./SwipeButton";
interface MobilePortfolioSummaryProps {
  invested: string;
  currentValue: string;
  profit: string;
  isProfit: boolean;
  onSwipeSuccess: () => void;
}
export function MobilePortfolioSummary({
  invested,
  currentValue,
  profit,
  isProfit,
  onSwipeSuccess,
}: MobilePortfolioSummaryProps) {
  return (
    <div
      className="md:hidden shrink-0 z-20 px-4 py-4"
    >
      <div
        className="flex justify-between items-center mb-4"
      >
        <div style={{ display:"flex", alignItems:"baseline", gap:"2px" }}>
          <span
            style={{
              fontSize:"10px",
              fontWeight: 400,
              color:"#8B939F",
              whiteSpace:"nowrap",
            }}
          >
            Inv.
          </span>
          <span
            style={{
              fontSize:"11px",
              fontWeight: 500,
              color:"var(--text-color)",
              whiteSpace:"nowrap",
            }}
          >
            {invested}
          </span>
        </div>
        <span style={{ fontSize:"10px", color:"#ECECEC" }}>|</span>
        <div style={{ display:"flex", alignItems:"baseline", gap:"2px" }}>
          <span
            style={{
              fontSize:"10px",
              fontWeight: 400,
              color:"#8B939F",
              whiteSpace:"nowrap",
            }}
          >
            Current
          </span>
          <span
            style={{
              fontSize:"11px",
              fontWeight: 500,
              color:"var(--text-color)",
              whiteSpace:"nowrap",
            }}
          >
            {currentValue}
          </span>
        </div>
        <span style={{ fontSize:"10px", color:"#ECECEC" }}>|</span>
        <div style={{ display:"flex", alignItems:"baseline", gap:"2px" }}>
          <span
            style={{
              fontSize:"10px",
              fontWeight: 400,
              color:"#8B939F",
              whiteSpace:"nowrap",
            }}
          >
            P&L
          </span>
          <span
            style={{
              fontSize:"11px",
              fontWeight: 500,
              color: isProfit ?"#00A86B" :"#D94B4B",
              whiteSpace:"nowrap",
            }}
          >
            {profit}
          </span>
        </div>
      </div>
      <SwipeButton
        text="SWIPE TO SELL"
        successText="SETTLING..."
        actionType="SELL"
        onSuccess={onSwipeSuccess}
      />
    </div>
  );
}
