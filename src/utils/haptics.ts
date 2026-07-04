export const triggerSelectionHaptic = () => {
  if (typeof window === "undefined") return;

  // Only trigger on mobile devices (width < 768px or userAgent match)
  const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
  if (!isMobile) return;

  try {
    // Check for Telegram Mini App HapticFeedback
    if (
      (window as any).Telegram &&
      (window as any).Telegram.WebApp &&
      (window as any).Telegram.WebApp.HapticFeedback
    ) {
      (window as any).Telegram.WebApp.HapticFeedback.selectionChanged();
      return;
    }

    // Fallback to standard Vibration API for Android (15ms)
    if (navigator && navigator.vibrate) {
      navigator.vibrate(15);
    }
  } catch (error) {
    console.error("Haptic feedback error:", error);
  }
};
