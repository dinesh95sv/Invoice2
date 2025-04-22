/**
 * Formatting utility functions for the app
 */

// Format currency amount (e.g., "$1,234.56")
export const formatCurrency = (amount, currencyCode = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format number with commas (e.g., "1,234")
export const formatNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) return '';
  
  return new Intl.NumberFormat('en-US').format(number);
};

// Format decimal number with specified precision (e.g., "1,234.56")
export const formatDecimal = (number, decimals = 2) => {
  if (number === undefined || number === null || isNaN(number)) return '';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

// Format percentage (e.g., "12.34%")
export const formatPercentage = (value, decimals = 2) => {
  if (value === undefined || value === null || isNaN(value)) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// Format phone number (e.g., "(123) 456-7890")
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format according to length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }
  
  // If not a standard format, return the cleaned number
  return cleaned;
};

// Format address into a single line
export const formatAddressOneLine = (address) => {
  if (!address) return '';
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);
  
  return parts.filter(Boolean).join(', ');
};

// Generate invoice number with prefix and padding (e.g., "INV-0001")
export const generateInvoiceNumber = (lastNumber = 0, prefix = 'INV-', padding = 4) => {
  const nextNumber = lastNumber + 1;
  const paddedNumber = String(nextNumber).padStart(padding, '0');
  return `${prefix}${paddedNumber}`;
};

// Truncate text with ellipsis if it exceeds max length
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Convert number to words (useful for invoice amounts)
export const numberToWords = (num) => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  const numString = num.toString();
  
  if (num < 0) return 'minus ' + numberToWords(Math.abs(num));
  if (num === 0) return 'zero';
  
  if (num < 20) {
    return ones[num];
  }
  
  if (numString.length === 2) {
    return tens[numString[0]] + (numString[1] !== '0' ? '-' + ones[numString[1]] : '');
  }
  
  if (numString.length === 3) {
    if (numString[1] === '0' && numString[2] === '0')
      return ones[numString[0]] + ' hundred';
    else
      return ones[numString[0]] + ' hundred and ' + numberToWords(+(numString[1] + numString[2]));
  }
  
  if (numString.length <= 6) {
    const thousands = +(numString.substring(0, numString.length - 3));
    const remainder = +(numString.substring(numString.length - 3));
    
    if (remainder === 0)
      return numberToWords(thousands) + ' thousand';
    else
      return numberToWords(thousands) + ' thousand ' + (remainder < 100 ? 'and ' : '') + numberToWords(remainder);
  }
  
  return 'number too large';
};

// Format file size (e.g., "1.23 MB")
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};