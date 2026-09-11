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

export function toPersianNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || isNaN(Number(num))) {
    return '۰';
  }
  return Number(num).toLocaleString('fa-IR');
}

export function formatCost(cost: number): string {
  return Number(cost).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + ' ریال';
}

// Phone number formatter - converts to E.164 format
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already has +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Remove leading 98 if present
  if (cleaned.startsWith('98')) {
    cleaned = cleaned.substring(2);
  }
  
  // Add +98 prefix
  return `+98${cleaned}`;
}

// Parse multiple phone numbers from text
export function parsePhoneNumbers(text: string): string[] {
  return text
    .split(/[\n,،\s]/)
    .map(r => r.trim())
    .filter(r => r.length > 0)
    .map(r => formatPhoneNumber(r));
}
