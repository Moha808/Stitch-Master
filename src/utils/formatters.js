import { format } from 'date-fns';

/**
 * Format a number as Nigerian Naira currency.
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency string, e.g. '₦25,000.00'
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₦0.00';
  }
  return '₦' + Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a date as 'MMM dd, yyyy', e.g. 'Jan 15, 2025'.
 * @param {string|Date} date - The date to format.
 * @returns {string} Formatted date string.
 */
export function formatDate(date) {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return '';
  }
}

/**
 * Format a date with time as 'MMM dd, yyyy HH:mm'.
 * @param {string|Date} date - The date to format.
 * @returns {string} Formatted date-time string.
 */
export function formatDateTime(date) {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return '';
  }
}

/**
 * Generate a unique ID with a prefix.
 * @param {string} prefix - The prefix for the ID, e.g. 'CUS', 'ORD'.
 * @returns {string} Generated ID, e.g. 'CUS-1718000000-a3f2'
 */
export function generateId(prefix = 'ID') {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Format a phone number for display.
 * @param {string} phone - The raw phone number.
 * @returns {string} Formatted phone number.
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+234') && cleaned.length === 14) {
    return `+234 ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Get the initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} Initials (up to 2 characters), e.g. 'AO'.
 */
export function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Truncate text to a max length, appending ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length.
 * @returns {string} Truncated text.
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
