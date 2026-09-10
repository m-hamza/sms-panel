// ===== Utility Functions =====

export function toPersianNumber(num: any): string {
  if (num === undefined || num === null || isNaN(Number(num))) return '۰';
  return Number(num).toLocaleString('fa-IR');
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('98')) cleaned = cleaned.substring(2);
  return `+98${cleaned}`;
}

export function parsePhoneNumbers(text: string): string[] {
  return text.split(/[\n,،\s]/).map(r => r.trim()).filter(r => r.length > 0).map(r => formatPhoneNumber(r));
}

export function toPersianDateTime(timestamp: any): string {
  try {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  } catch { return String(timestamp); }
}

export function formatCost(cost: number): string {
  return Number(cost).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + ' ریال';
}
