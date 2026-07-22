export function generateAppCode(userId: string): string {
  if (!userId) return "000000";
  const timeSlice = Math.floor(Date.now() / 30000);
  let hash = 0;
  const str = userId + timeSlice.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const code = Math.abs(hash) % 1000000;
  return code.toString().padStart(6, '0');
}

export function getAppCodeRemainingSeconds(): number {
  return 30 - Math.floor((Date.now() / 1000) % 30);
}
