export function getYesterdayDateTime(hourStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
  
    const [hours, minutes, seconds] = hourStr.split(':').map(Number);
    yesterday.setHours(hours);
    yesterday.setMinutes(minutes);
    yesterday.setSeconds(seconds);
    yesterday.setMilliseconds(0);
  
    return yesterday.toISOString(); // ← 💡 ISO valide pour new Date()
  }
  