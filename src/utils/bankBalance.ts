import { Investment, Business, Investor, GlobalSettings } from"../types";

export function calculateFinancials(
  investments: Investment[],
  businessId: string | null,
  marketTrends: Record<string, number>,
  settings: GlobalSettings | null,
) {
  const activeInvestments = investments.filter(
    (inv) =>
      inv.status ==="active" &&
      (businessId ? inv.businessId === businessId : true),
  );

  const capitalInvested = activeInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0,
  );

  let profitBooked = 0;
  activeInvestments.forEach((inv) => {
    const trend = marketTrends[inv.businessId] || 0;
    profitBooked += inv.amount * (trend / 100);
  });

  let commissionTax = 0;
  let rmasCommissionBusiness = 0;
  let rmasCommissionInvestor = 0;

  const bCommPercentage = settings?.profitCommission?.value ?? 5;
  const iCommPercentage = settings?.investmentCommission?.value ?? 1;

  if (profitBooked > 0) {
    rmasCommissionBusiness = profitBooked * (bCommPercentage / 100);
    rmasCommissionInvestor = profitBooked * (iCommPercentage / 100);
    commissionTax = rmasCommissionBusiness + rmasCommissionInvestor;
  }

  const currentValue = capitalInvested + profitBooked - commissionTax;

  return {
    capitalInvested,
    profitBooked,
    commissionTax,
    rmasCommissionBusiness,
    rmasCommissionInvestor,
    currentValue,
    activeInvestments,
  };
}

export function getUnifiedBankBalance(
  entityName: string,
  businesses: Business[],
  investors: Investor[],
  investments: Investment[],
  settings?: GlobalSettings | null,
) {
  let balance = 0;
  const isAdmin =
    entityName ==="Radhika M" ||
    entityName.includes("Admin") ||
    entityName ==="Radhika Merchant" ||
    entityName ==="Radhika Marchant";

  if (isAdmin) {
    balance = 300000000; // 30 Crore base balance

    businesses.forEach((b) => {
      if (b.id !=="admin_business" && b.registrationFee) {
        balance += b.registrationFee;
      }
    });

    investors.forEach((i) => {
      if (i.id !=="admin_investor" && i.rmasServiceCharge) {
        balance += i.rmasServiceCharge;
      }
    });
  } else {
    // Normal entities initial deductions
    const biz = businesses.find(
      (b) => b.ownerName === entityName || b.name === entityName,
    );
    const invt = investors.find((i) => i.name === entityName);

    if (biz && biz.id !== "admin_business" && biz.registrationFee)
      balance -= biz.registrationFee;
    if (invt && invt.id !== "admin_investor" && invt.rmasServiceCharge)
      balance -= invt.rmasServiceCharge;
  }

  investments.forEach((inv) => {
    if (isAdmin) {
      if (inv.adminCommissionBusiness) balance += inv.adminCommissionBusiness;
      if (inv.adminCommissionInvestor) balance += inv.adminCommissionInvestor;
      if (inv.status === "completed" && inv.payoutDetails) {
        balance += inv.payoutDetails.rmasCommission || 0;
        balance += inv.payoutDetails.happyIncomeTax || 0;
        balance += inv.payoutDetails.rmasPrematurePenalty || 0;
        if (inv.payoutDetails.rmasSubsidyPays) {
          balance -= inv.payoutDetails.rmasSubsidyPays;
        }
      }

      // Admin Business: receives investment
      if (inv.businessId === "admin_business") {
        balance += inv.amount;
        if (inv.status === "completed" && inv.payoutDetails) {
          balance -= inv.payoutDetails.totalCredited;
          if (inv.payoutDetails.happyIncomeTax)
            balance -= inv.payoutDetails.happyIncomeTax;
        }
      }

      // Admin Investor: makes investment
      if (inv.investorId === "admin_investor") {
        balance -= inv.amount;
        if (inv.status === "completed" && inv.payoutDetails) {
          balance += inv.payoutDetails.totalCredited;
        }
      }
    } else {
      // Normal entities
      const biz = businesses.find(
        (b) => b.ownerName === entityName || b.name === entityName,
      );
      const invt = investors.find((i) => i.name === entityName);

      if (biz && inv.businessId === biz.id) {
        balance += inv.amount;
        if (inv.status === "completed" && inv.payoutDetails) {
          const businessBurden =
            inv.payoutDetails.totalCredited +
            (inv.payoutDetails.rmasCommission || 0) +
            (inv.payoutDetails.happyIncomeTax || 0) +
            (inv.payoutDetails.rmasPrematurePenalty || 0) -
            (inv.payoutDetails.rmasSubsidyPays || 0);
          balance -= businessBurden;
        }
      } else if (invt && inv.investorId === invt.id) {
        balance -= inv.amount;
        if (inv.status === "completed" && inv.payoutDetails) {
          balance += inv.payoutDetails.totalCredited;
        }
      }
    }
  });

  return balance;
}

export function getUnifiedTransactions(
  entityName: string,
  businesses: Business[],
  investors: Investor[],
  investments: Investment[],
  settings?: GlobalSettings | null,
) {
  const transactions: any[] = [];
  const isAdmin =
    entityName ==="Radhika M" ||
    entityName.includes("Admin") ||
    entityName ==="Radhika Merchant" ||
    entityName ==="Radhika Marchant";

  if (isAdmin) {
    // Initial balance entry for Admin
    transactions.push({
      id:"tx_initial_admin_balance",
      date:"2020-01-01T00:00:00.000Z",
      title:"Initial RMAS Bank Balance",
      description:"Starting Capital",
      amount: 300000000,
      type:"CREDIT",
      category:"capital",
    });

    businesses.forEach((b) => {
      if (b.id !=="admin_business" && b.registrationFee) {
        transactions.push({
          id: `tx_biz_reg_${b.id}`,
          date: b.registrationDate || new Date().toISOString(),
          title: `Business Registration Fee`,
          description: `From ${b.name}`,
          amount: b.registrationFee,
          type:"CREDIT",
          category:"commission",
        });
      }
    });

    investors.forEach((i) => {
      if (i.id !=="admin_investor" && i.rmasServiceCharge) {
        transactions.push({
          id: `tx_inv_reg_${i.id}`,
          date: i.joinDate || new Date().toISOString(),
          title: `Investor Registration Fee`,
          description: `From ${i.name}`,
          amount: i.rmasServiceCharge,
          type:"CREDIT",
          category:"commission",
        });
      }
    });

    investments.forEach((inv) => {
      const b = businesses.find((b) => b.id === inv.businessId);
      const i = investors.find((i) => i.id === inv.investorId);

      if (inv.status ==="completed" && inv.payoutDetails) {
        transactions.push({
          id: `tx_${inv.id}_comm`,
          date: inv.payoutDetails.payoutDate || new Date().toISOString(),
          title: `RMAS Commission Booked`,
          description: `From settlement of ${b?.name} and ${i?.name}`,
          amount: inv.payoutDetails.rmasCommission,
          type:"CREDIT",
          category:"commission",
        });
      }

      if (inv.businessId ==="admin_business") {
        transactions.push({
          id: `tx_${inv.id}_admin_recv`,
          date: inv.startDate,
          title: `Capital Received (My Business)`,
          description: `From ${i?.name}`,
          amount: inv.amount,
          type:"CREDIT",
          category:"capital",
        });
        if (inv.status ==="completed" && inv.payoutDetails) {
          transactions.push({
            id: `tx_${inv.id}_admin_payout`,
            date: inv.payoutDetails.payoutDate || new Date().toISOString(),
            title: `Settlement Paid (My Business)`,
            description: `To ${i?.name}`,
            amount:
              inv.payoutDetails.totalCredited +
              (inv.payoutDetails.happyIncomeTax || 0),
            type:"DEBIT",
            category:"settlement",
          });
        }
      }

      if (inv.investorId ==="admin_investor") {
        transactions.push({
          id: `tx_${inv.id}_admin_inv`,
          date: inv.startDate,
          title: `Investment Made (My Account)`,
          description: `In ${b?.name}`,
          amount: inv.amount,
          type:"DEBIT",
          category:"investment",
        });
        if (inv.status ==="completed" && inv.payoutDetails) {
          transactions.push({
            id: `tx_${inv.id}_admin_ret`,
            date: inv.payoutDetails.payoutDate || new Date().toISOString(),
            title: `Settlement Received (My Account)`,
            description: `From ${b?.name} (Net)`,
            amount: inv.payoutDetails.totalCredited,
            type:"CREDIT",
            category:"settlement",
          });
        }
      }
    });
    
    try {
      const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
      bidsComms.forEach((c: any) => {
         transactions.push({
           id: c.id || `tx_bids_${Math.random()}`,
           date: c.date || new Date().toISOString(),
           title: c.type === 'IPO Listing' ? 'IPO Listing Fee' : (c.type === 'Exit' ? 'Exit Commission' : 'Platform Commission'),
           description: 'From Bids Platform',
           amount: c.amount || 0,
           type: 'CREDIT',
           category: 'commission'
         });
      });
    } catch(e) {}
    
    try {
      const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
      bidsComms.forEach((c: any) => {
         transactions.push({
           id: c.id || `tx_bids_${Math.random()}`,
           date: c.date || new Date().toISOString(),
           title: c.type === 'IPO Listing' ? 'IPO Listing Fee' : (c.type === 'Exit' ? 'Exit Commission' : 'Application Commission'),
           description: 'From Bids Platform',
           amount: c.amount || 0,
           type: 'CREDIT',
           category: 'commission'
         });
      });
    } catch(e) {}
  } else {
    // For specific business or investor
    const isBusiness = businesses.some(
      (b) => b.ownerName === entityName || b.name === entityName,
    );
    const biz = businesses.find(
      (b) => b.ownerName === entityName || b.name === entityName,
    );
    const inv = investors.find((i) => i.name === entityName);

    if (biz) {
      if (biz.id !=="admin_business" && biz.registrationFee) {
        transactions.push({
          id: `tx_biz_reg_${biz.id}`,
          date: biz.registrationDate || new Date().toISOString(),
          title: `Business Registration Fee`,
          description: `Paid to RMAS`,
          amount: biz.registrationFee,
          type:"DEBIT",
          category:"fee",
        });
      }

      const bizInvs = investments.filter((i) => i.businessId === biz.id);
      bizInvs.forEach((i) => {
        const investor = investors.find((inv) => inv.id === i.investorId);
        transactions.push({
          id: `tx_${i.id}_recv`,
          date: i.startDate,
          title: `Capital Received`,
          description: `From ${investor?.name}`,
          amount: i.amount,
          type:"CREDIT",
          category:"capital",
        });
        if (i.status ==="completed" && i.payoutDetails) {
          transactions.push({
            id: `tx_${i.id}_payout`,
            date: i.payoutDetails.payoutDate,
            title: `Settlement Paid`,
            description: `To ${investor?.name}`,
            amount:
              i.payoutDetails.totalCredited +
              (i.payoutDetails.rmasCommission || 0) +
              (i.payoutDetails.happyIncomeTax || 0),
            type:"DEBIT",
            category:"settlement",
          });
        }
      });
      try {
        const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
        bidsComms.forEach((c: any) => {
          if (c.type === 'IPO Listing' && c.investorId === biz.id) {
            transactions.push({
              id: c.id || `tx_bids_ipo_${Math.random()}`,
              date: c.date || new Date().toISOString(),
              title: `IPO Listing Charge`,
              description: `Paid to RMAS`,
              amount: c.amount || 0,
              type: "DEBIT",
              category: "fee",
            });
          }
        });
      } catch(e) {}
      
      try {
        const bidsApps = JSON.parse(localStorage.getItem("bids_applications") || "[]");
        const ipos = JSON.parse(localStorage.getItem("bids_ipos") || "[]");
        bidsApps.forEach((app: any) => {
          const ipo = ipos.find((i: any) => i.id === app.ipoId);
          if (!ipo) return;
          const ipoBizId = businesses.find(b => b.shortName?.toUpperCase() === ipo.companyName || b.name.toUpperCase() === ipo.companyName)?.id;
          if (biz.id === ipoBizId) {
            // Business only gets money if Allotted, but NOT if Listed (because Investment takes over)
            if (app.allotmentStatus === 'Allotted' && app.listingStatus !== 'Listed') {
                transactions.push({
                  id: app.id + "_recv" || `tx_bids_app_recv_${Math.random()}`,
                  date: app.applicationDate || new Date().toISOString(),
                  title: `IPO Capital Received`,
                  description: `From Investor ID: ${app.investorId}`,
                  amount: app.appliedAmount,
                  type: "CREDIT",
                  category: "capital",
                });
            }
          }
        });
      } catch(e) {}
    } else if (inv) {
      if (inv.id !=="admin_investor" && inv.rmasServiceCharge) {
        transactions.push({
          id: `tx_inv_reg_${inv.id}`,
          date: inv.joinDate || new Date().toISOString(),
          title: `Investor Registration Fee`,
          description: `Paid to RMAS`,
          amount: inv.rmasServiceCharge,
          type:"DEBIT",
          category:"fee",
        });
      }

      const invInvs = investments.filter((i) => i.investorId === inv.id);
      invInvs.forEach((i) => {
        const business = businesses.find((b) => b.id === i.businessId);
        transactions.push({
          id: `tx_${i.id}_inv`,
          date: i.startDate,
          title: `Investment Made`,
          description: `In ${business?.name}`,
          amount: i.amount,
          type:"DEBIT",
          category:"investment",
        });
        if (i.status ==="completed" && i.payoutDetails) {
          transactions.push({
            id: `tx_${i.id}_ret`,
            date: i.payoutDetails.payoutDate,
            title: `Settlement Received`,
            description: `From ${business?.name} (Net)`,
            amount: i.payoutDetails.totalCredited,
            type:"CREDIT",
            category:"settlement",
          });
        }
      });
      
      try {
        const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
        bidsComms.forEach((c: any) => {
          if (c.investorId === inv.id && c.type !== 'IPO Listing') {
            transactions.push({
              id: c.id || `tx_bids_comm_${Math.random()}`,
              date: c.date || new Date().toISOString(),
              title: c.type === 'Exit' ? `Exit Commission` : `Application Commission`,
              description: `Paid to RMAS`,
              amount: c.amount || 0,
              type: "DEBIT",
              category: "fee",
            });
          }
        });
        const bidsApps = JSON.parse(localStorage.getItem("bids_applications") || "[]");
        const ipos = JSON.parse(localStorage.getItem("bids_ipos") || "[]");
        bidsApps.forEach((app: any) => {
          if (app.investorId === inv.id) {
            const ipo = ipos.find((i: any) => i.id === app.ipoId);
            // Always deduct when applied, unless Listed
            if (app.listingStatus !== 'Listed') {
                transactions.push({
                  id: app.id || `tx_bids_app_inv_${Math.random()}`,
                  date: app.applicationDate || new Date().toISOString(),
                  title: `Locked IPO Balance`,
                  description: `For ${ipo?.companyName || 'Unknown IPO'}`,
                  amount: app.appliedAmount,
                  type: "DEBIT",
                  category: "investment",
                });
            }
            
            // If Refunded, credit it back
            if (app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted') {
              transactions.push({
                id: app.id + "_refund" || `tx_bids_app_ret_${Math.random()}`,
                date: new Date().toISOString(),
                title: `IPO Refund`,
                description: `From ${ipo?.companyName || 'Unknown IPO'}`,
                amount: app.appliedAmount,
                type: "CREDIT",
                category: "settlement",
              });
            }
            // If Exited (we only show it in Investents page but here as well for sync)
            else if (app.listingStatus === 'Exited') {
              // Not sure if Exited applies to IPO apps in Bids, but let's keep it safe.
              // We removed Exit in favor of standard holding selling, but leaving it if it's there.
            }
          }
        });
      } catch(e) {}
    }
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getUnifiedData(
  businesses: Business[],
  investors: Investor[],
  investments: Investment[],
  settings: GlobalSettings | null,
  marketTrends: Record<string, number>,
) {
  // Master logic
  return {
    businesses,
    investors,
    investments,
  };
}
