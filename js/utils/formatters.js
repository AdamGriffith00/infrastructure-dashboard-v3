/**
 * Formatting Utilities
 */

/**
 * Format a number as currency (GBP)
 * @param {number} value - The value in pounds
 * @param {boolean} compact - Use compact notation (e.g., £1.2B)
 */
export function formatCurrency(value, compact = true) {
  if (value === null || value === undefined) return '-';

  if (compact) {
    if (value >= 1e12) {
      return `£${(value / 1e12).toFixed(1)}T`;
    }
    if (value >= 1e9) {
      return `£${(value / 1e9).toFixed(1)}B`;
    }
    if (value >= 1e6) {
      return `£${(value / 1e6).toFixed(0)}M`;
    }
    if (value >= 1e3) {
      return `£${(value / 1e3).toFixed(0)}K`;
    }
    return `£${value.toFixed(0)}`;
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format a date string
 * @param {string} dateString - ISO date string
 * @param {string} format - 'short', 'long', or 'relative'
 */
export function formatDate(dateString, format = 'short') {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    if (format === 'relative') {
      return formatRelativeDate(date);
    }

    const options = format === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' };

    return date.toLocaleDateString('en-GB', options);
  } catch (e) {
    return dateString;
  }
}

/**
 * Format a relative date (e.g., "in 3 days", "2 weeks ago")
 */
function formatRelativeDate(date) {
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 7 && diffDays <= 30) return `In ${Math.round(diffDays / 7)} weeks`;
  if (diffDays < -7 && diffDays >= -30) return `${Math.round(Math.abs(diffDays) / 7)} weeks ago`;

  return formatDate(date.toISOString(), 'short');
}

/**
 * Format a number with commas
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-GB').format(value);
}

/**
 * Format a percentage
 * @param {number} value - The percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 */
export function formatPercentage(value, decimals = 0) {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse a currency string to number
 */
export function parseCurrency(currencyString) {
  if (!currencyString) return 0;
  if (typeof currencyString === 'number') return currencyString;

  const cleaned = currencyString.replace(/[£,\s]/g, '');

  if (cleaned.endsWith('T') || cleaned.endsWith('t')) {
    return parseFloat(cleaned) * 1e12;
  }
  if (cleaned.endsWith('B') || cleaned.endsWith('b')) {
    return parseFloat(cleaned) * 1e9;
  }
  if (cleaned.endsWith('M') || cleaned.endsWith('m')) {
    return parseFloat(cleaned) * 1e6;
  }
  if (cleaned.endsWith('K') || cleaned.endsWith('k')) {
    return parseFloat(cleaned) * 1e3;
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Get rating badge class
 */
export function getRatingClass(rating) {
  const r = (rating || '').toLowerCase();
  if (r === 'high') return 'badge-high';
  if (r === 'medium') return 'badge-medium';
  if (r === 'low') return 'badge-low';
  return '';
}

/**
 * Get sector color
 */
export function getSectorColor(sectorId) {
  const colors = {
    'rail': '#4CAF50',
    'highways': '#2196F3',
    'aviation': '#9C27B0',
    'maritime': '#00BCD4',
    'utilities': '#FF9800'
  };
  return colors[sectorId] || '#888888';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
