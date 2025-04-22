/**
 * Date utility functions for the app
 */

// Format date to display format (e.g., "Jan 15, 2023")
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format date with time (e.g., "Jan 15, 2023, 2:30 PM")
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

// Get current date as ISO string
export const getCurrentDate = () => {
  return new Date().toISOString();
};

// Get current date formatted
export const getCurrentDateFormatted = () => {
  return formatDate(new Date());
};

// Calculate date difference in days
export const getDaysDifference = (date1, date2) => {
  const firstDate = typeof date1 === 'string' ? new Date(date1) : date1;
  const secondDate = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = Math.abs(secondDate - firstDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Add days to a date
export const addDays = (date, days) => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

// Format date for invoice (e.g., "15/01/2023")
export const formatInvoiceDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Generate invoice due date (default: 30 days from creation)
export const generateDueDate = (creationDate, daysUntilDue = 30) => {
  const dateObj = typeof creationDate === 'string' ? new Date(creationDate) : new Date(creationDate);
  dateObj.setDate(dateObj.getDate() + daysUntilDue);
  return dateObj.toISOString();
};

// Check if a date is in the past
export const isPastDue = (dueDate) => {
  const today = new Date();
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return dueDateObj < today;
};

// Format a date range (e.g., "Jan 15 - Jan 30, 2023")
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // If same year
  if (start.getFullYear() === end.getFullYear()) {
    // If same month
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
    }
    // Different months, same year
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  
  // Different years
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};