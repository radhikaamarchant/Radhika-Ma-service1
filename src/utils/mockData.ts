export const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style:"currency",
    currency:"INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
export const MOCK_BUSINESSES: any[] = [];
export const MOCK_INVESTORS: any[] = [];
export const MOCK_INVESTMENTS: any[] = [];
