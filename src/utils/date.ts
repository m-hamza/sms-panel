// Persian (Jalali) date converter
export function toPersianDate(timestamp: string | number): string {
  try {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('fa-IR');
  } catch {
    return String(timestamp);
  }
}

export function toPersianDateTime(timestamp: string | number): string {
  try {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('fa-IR') + ' ' + 
           date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(timestamp);
  }
}

export function toPersianNumber(num: number | string): string {
  return Number(num).toLocaleString('fa-IR');
}

export function formatCost(cost: number): string {
  return Number(cost).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + ' ریال';
}
