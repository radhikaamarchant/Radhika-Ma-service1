import { GlobalSettings, DailyMarketTiming } from "../types";

function getDayConfig(settings: GlobalSettings, dayName: string) {
  if (settings.marketTiming?.days && settings.marketTiming.days[dayName]) {
    return settings.marketTiming.days[dayName] as DailyMarketTiming;
  }
  // Fallback to global
  return {
    isOpen: true, 
    openTime: settings.marketTiming?.openTime || "09:15",
    closeTime: settings.marketTiming?.closeTime || "15:30",
  };
}

export function getMarketTimeContext(
  settings: GlobalSettings | undefined,
  currentTimestamp: number = Date.now()
): { isOpen: boolean; effectiveTimestamp: number } {
  if (!settings?.marketTiming?.openTime || !settings?.marketTiming?.closeTime) {
    return { isOpen: true, effectiveTimestamp: currentTimestamp };
  }

  // Create Date object for IST timezone explicitly
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'long',
    hour12: false
  });
  
  const parts = formatter.formatToParts(new Date(currentTimestamp));
  const dateMap: any = {};
  parts.forEach(({ type, value }) => { dateMap[type] = value; });
  
  const currentMinutes = parseInt(dateMap.hour) * 60 + parseInt(dateMap.minute);
  const currentDayName = dateMap.weekday.toLowerCase();

  const todayConfig = getDayConfig(settings, currentDayName);

  let isOpen = false;
  if (todayConfig.isOpen) {
    const openTimeParts = todayConfig.openTime.split(":");
    const closeTimeParts = todayConfig.closeTime.split(":");
    const openHour = parseInt(openTimeParts[0], 10);
    const openMin = parseInt(openTimeParts[1], 10);
    const closeHour = parseInt(closeTimeParts[0], 10);
    const closeMin = parseInt(closeTimeParts[1], 10);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (openMinutes <= closeMinutes) {
      isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } else {
      isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }
    
    if (isOpen) {
        return { isOpen: true, effectiveTimestamp: currentTimestamp };
    }
  }

  let checkTimestamp = currentTimestamp;
  
  for (let i = 0; i < 7; i++) {
    const checkParts = formatter.formatToParts(new Date(checkTimestamp));
    const checkDateMap: any = {};
    checkParts.forEach(({ type, value }) => { checkDateMap[type] = value; });
    const checkDayName = checkDateMap.weekday.toLowerCase();
    
    const checkConfig = getDayConfig(settings, checkDayName);
    
    if (checkConfig.isOpen) {
        const closeTimeParts = checkConfig.closeTime.split(":");
        let year = parseInt(checkDateMap.year);
        let month = parseInt(checkDateMap.month);
        let day = parseInt(checkDateMap.day);
        
        let closeDateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${closeTimeParts[0]}:${closeTimeParts[1]}:00.000+05:30`;
        let closeTimestamp = new Date(closeDateStr).getTime();
        
        const openTimeParts = checkConfig.openTime.split(":");
        const openMinutes = parseInt(openTimeParts[0]) * 60 + parseInt(openTimeParts[1]);
        const closeMinutes = parseInt(closeTimeParts[0]) * 60 + parseInt(closeTimeParts[1]);
        
        if (openMinutes > closeMinutes) {
             // crossed midnight, close is technically next day
             closeTimestamp += 24 * 60 * 60 * 1000;
        }

        if (closeTimestamp <= currentTimestamp) {
            return { isOpen: false, effectiveTimestamp: closeTimestamp };
        }
    }
    
    checkTimestamp -= 24 * 60 * 60 * 1000;
  }

  return { isOpen: false, effectiveTimestamp: currentTimestamp };
}

export function isMarketOpen(settings: GlobalSettings | undefined): boolean {
    return getMarketTimeContext(settings).isOpen;
}
