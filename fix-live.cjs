const fs = require('fs');
let code = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

const target = `      let rmasSubsidyPays = 0;
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
      });`;

const injection = `      let rmasSubsidyPays = 0;
      if (business && business.rmasSubsidy && business.rmasSubsidy > 0) {
        rmasSubsidyPays =
          totalAmount *
          (business.rmasSubsidy / 100) *
          ((Number(withdrawFormData.completedMonths) || 12) / 12);
      }
      
      let hpgSahayPays = 0;
      if (business && business.hpgSahay && business.hpgSahay.enabled && profitDetails.totalProfit > 0) {
        const businessInvestments = state.investments.filter((inv: any) => inv.businessId === business.id);
        const uniqueInvestorsCount = new Set(businessInvestments.map((inv: any) => inv.investorId)).size;
        if (uniqueInvestorsCount >= (business.hpgSahay.minInvestors || 0)) {
          hpgSahayPays = profitDetails.totalProfit * (business.hpgSahay.percentage / 100);
        }
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
              hpgSahayPays: hpgSahayPays * ratio,
            },
          },
        });
      });`;

code = code.replace(target, injection);
fs.writeFileSync('src/components/LivePortfolioDetail.tsx', code);
