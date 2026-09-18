export function normalizeContact(value) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFKC').trim()
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u0660-\u0669]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, digit => String(digit.charCodeAt(0) - 0x06F0));
}

export function isValidContact(value) {
  const contact = normalizeContact(value);
  if (!contact || contact.length > 254) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return true;
  const digits = contact.replace(/\D/g, '');
  return /^\+?[\d\s().-]+$/.test(contact) && digits.length >= 7 && digits.length <= 15;
}
