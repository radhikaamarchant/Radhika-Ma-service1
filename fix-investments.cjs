const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

if (!code.includes('useDeferredValue')) {
    code = code.replace('useMemo } from "react";', 'useMemo, useDeferredValue } from "react";');
}

const targetSearch = `const groupedInvestments = useMemo(() => allGroupedInvestments`;
const replacement = `const deferredSearchTerm = useDeferredValue(searchTerm);
  const investmentsWithRefs = useMemo(() => {
    return allGroupedInvestments.map(inv => {
      const business = state.businesses.find((b) => b.id === inv.businessId);
      const investor = state.investors.find((i) => i.id === inv.investorId);
      return { ...inv, business, investor };
    });
  }, [allGroupedInvestments, state.businesses, state.investors]);

  const groupedInvestments = useMemo(() => investmentsWithRefs`;

code = code.replace(targetSearch, replacement);

const filterSearch = `    .filter((inv) => {
      const business = state.businesses.find((b) => b.id === inv.businessId);
      const investor = state.investors.find((i) => i.id === inv.investorId);
      const match = searchTerm.toLowerCase();`;
const filterReplace = `    .filter((inv) => {
      const { business, investor } = inv;
      const match = deferredSearchTerm.toLowerCase();`;

code = code.replace(filterSearch, filterReplace);

// Also add useDeferredValue for businessSearch and investorSearch in modals if needed?
// Let's just fix the main list for now.

fs.writeFileSync('src/pages/Investments.tsx', code);
