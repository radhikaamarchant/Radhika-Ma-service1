const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

// The logic inside onClick of tr
content = content.replace(
  /const bizInvs = investorInvestments\.filter\([\s\S]*?\}\)/,
  `const bizInvs = investorInvestments.filter(
                            (i) => i.businessId === inv.businessId && i.status === inv.status,
                          );
                          setSelectedPortfolioInvestment({
                            businessId: inv.businessId,
                            investorId: investor.id,
                            status: inv.status,
                            timePeriodMonths: bizInvs[0].timePeriodMonths,
                            interestRate: bizInvs[0].interestRate,
                            startDate: bizInvs[0].startDate,
                            endDate: bizInvs[0].endDate,
                            amount: bizInvs.reduce(
                              (acc, i) => acc + i.amount,
                              0,
                            ),
                            groupedInvestmentsList: bizInvs,
                          })`
);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
console.log("Patched InvestorDetail.tsx");
