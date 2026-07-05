import re

with open('src/pages/Investors.tsx', 'r') as f:
    content = f.read()

# Replace mobile PnL view
old_pnl_mobile = '''                                   <div className={`text-[13px] md:text-[14px] font-normal ${p.investedAmount === 0 ? "text-[#4CAF50]" : (totalProfit >= 0 ? "text-[#4CAF50]" : "text-[#FF5722]")}`}>
                                     {totalProfit >= 0 ? "+" : ""}
                                     {formatINR(Math.abs(totalProfit)).replace("₹", "")}
                                   </div>'''

new_pnl_mobile = '''                                   <div className="flex flex-col items-end">
                                     <div className={`text-[13px] md:text-[14px] font-normal ${p.investedAmount === 0 ? "text-[#4CAF50]" : (totalProfit >= 0 ? "text-[#4CAF50]" : "text-[#FF5722]")}`}>
                                       {totalProfit >= 0 ? "+" : ""}
                                       {formatINR(Math.abs(totalProfit)).replace("₹", "")}
                                     </div>
                                     {((p.invs as any)[0]?.id?.startsWith('inv_ipo_') && totalProfit > 0) && (
                                       <span className="text-[10px] text-kite-green font-medium uppercase tracking-widest mt-0.5">IPO Profit</span>
                                     )}
                                   </div>'''

content = content.replace(old_pnl_mobile, new_pnl_mobile)

with open('src/pages/Investors.tsx', 'w') as f:
    f.write(content)

