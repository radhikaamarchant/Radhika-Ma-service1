export function formatCompactINR(number: number): string {
  if (number >= 10000000) {
    return '₹' + (number / 10000000).toFixed(1).replace(/\.0$/, '') + 'CR';
  }
  if (number >= 100000) {
    return '₹' + (number / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
  }
  if (number >= 1000) {
    return '₹' + (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return '₹' + number.toString();
}
