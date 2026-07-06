const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

const replacement = `                </>
                </div>
                {withdrawStep === 0 &&
                  selectedInvestment.status === "active" && (
                    <div className="md:hidden">
                    <MobilePortfolioSummary
                      invested={formatINR(totalAmount)}
                      currentValue={formatINR(curValue)}
                      profit={\`\${isProfit ? "+" : ""}\${formatINR(holdingProfit)}\`}
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
{withdrawStep === 1 && (`;

content = content.replace(/<\/>\s*<\/div>\s*\{withdrawStep === 1 && \(/, replacement);

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
