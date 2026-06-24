import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const sanitizeDatabase = async () => {
  try {
    let sanitizedCount = 0;

    // 1. Sanitize Investments first
    const invSnap = await getDocs(collection(db, 'investments'));
    const validInvestments: any[] = [];
    
    for (const d of invSnap.docs) {
      const data = d.data();
      let updated = false;

      // Ensure amount is a sane number
      if (typeof data.amount !== 'number' || isNaN(data.amount) || data.amount > 50000000 || data.amount < 0) {
        data.amount = Math.min(Math.max(Number(data.amount) || 0, 0), 5000000); 
        if (isNaN(data.amount)) data.amount = 0;
        updated = true;
      }

      // Ensure interestRate is sane
      if (typeof data.interestRate !== 'number' || isNaN(data.interestRate) || data.interestRate > 100 || data.interestRate < -100) {
        data.interestRate = 5;
        updated = true;
      }

      // Ensure payout details are sane
      if (data.status === 'completed' && data.payoutDetails) {
        if (typeof data.payoutDetails.totalCredited !== 'number' || isNaN(data.payoutDetails.totalCredited) || data.payoutDetails.totalCredited > 100000000) {
          data.payoutDetails.totalCredited = data.amount + (data.amount * 0.05); 
          updated = true;
        }
        if (typeof data.payoutDetails.rmasCommission !== 'number' || isNaN(data.payoutDetails.rmasCommission) || data.payoutDetails.rmasCommission > 10000000) {
          data.payoutDetails.rmasCommission = 0;
          updated = true;
        }
      }

      if (updated) {
        await setDoc(doc(db, 'investments', d.id), data);
        sanitizedCount++;
      }
      
      validInvestments.push(data);
    }

    // Pre-calculate sums for Investors
    const totalInvestedByInvestor = new Map<string, number>();
    for (const inv of validInvestments) {
      if (inv.status === 'active') {
        totalInvestedByInvestor.set(inv.investorId, (totalInvestedByInvestor.get(inv.investorId) || 0) + inv.amount);
      }
    }

    // 2. Sanitize Businesses
    const bizSnap = await getDocs(collection(db, 'businesses'));
    for (const d of bizSnap.docs) {
      const data = d.data();
      let updated = false;

      if (typeof data.fundingRequired !== 'number' || isNaN(data.fundingRequired) || data.fundingRequired > 1000000000 || data.fundingRequired < 0) {
        data.fundingRequired = 500000;
        updated = true;
      }

      if (typeof data.interestRate !== 'number' || isNaN(data.interestRate) || data.interestRate > 100 || data.interestRate < -100) {
        data.interestRate = 5;
        updated = true;
      }

      if (updated) {
        await setDoc(doc(db, 'businesses', d.id), data);
        sanitizedCount++;
      }
    }

    // 3. Sanitize Investors and set correctly calculated totalInvested
    const invsSnap = await getDocs(collection(db, 'investors'));
    for (const d of invsSnap.docs) {
      const data = d.data();
      let updated = false;

      const calculatedTotal = totalInvestedByInvestor.get(data.id) || 0;
      
      if (data.totalInvested !== calculatedTotal || typeof data.totalInvested !== 'number' || isNaN(data.totalInvested)) {
        data.totalInvested = calculatedTotal;
        updated = true;
      }

      if (updated) {
        await setDoc(doc(db, 'investors', d.id), data);
        sanitizedCount++;
      }
    }

    return { success: true, message: `Sanitized and recalculated ${sanitizedCount} records in the database successfully.` };
  } catch (error) {
    console.error("Error sanitizing database:", error);
    return { success: false, message: "Failed to sanitize database." };
  }
};
