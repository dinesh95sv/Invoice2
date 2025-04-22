/**
 * Form validation utility functions
 */

// Validate email format
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Invalid email format';
};

// Validate phone number format
export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  
  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the cleaned phone number has a valid length
  if (cleaned.length < 10) {
    return 'Phone number must have at least 10 digits';
  }
  
  return null; // Valid
};

// Validate required field
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  
  return null; // Valid
};

// Validate minimum length
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (!value) return `${fieldName} is required`;
  
  if (String(value).length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  
  return null; // Valid
};

// Validate maximum length
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (!value) return null; // If not required, empty is valid
  
  if (String(value).length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  
  return null; // Valid
};

// Validate numeric value
export const validateNumeric = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || value === '') {
    return null; // If not required, empty is valid
  }
  
  if (isNaN(Number(value))) {
    return `${fieldName} must be a number`;
  }
  
  return null; // Valid
};

// Validate minimum numeric value
export const validateMin = (value, min, fieldName = 'This field') => {
  if (value === undefined || value === null || value === '') {
    return null; // If not required, empty is valid
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return `${fieldName} must be a number`;
  }
  
  if (numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  return null; // Valid
};

// Validate maximum numeric value
export const validateMax = (value, max, fieldName = 'This field') => {
  if (value === undefined || value === null || value === '') {
    return null; // If not required, empty is valid
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return `${fieldName} must be a number`;
  }
  
  if (numValue > max) {
    return `${fieldName} cannot exceed ${max}`;
  }
  
  return null; // Valid
};

// Validate positive number
export const validatePositive = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || value === '') {
    return null; // If not required, empty is valid
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return `${fieldName} must be a number`;
  }
  
  if (numValue <= 0) {
    return `${fieldName} must be positive`;
  }
  
  return null; // Valid
};

// Validate URL format
export const validateUrl = (url) => {
  if (!url) return null; // If not required, empty is valid
  
  try {
    new URL(url);
    return null; // Valid
  } catch (e) {
    return 'Invalid URL format';
  }
};

// Validate postal/zip code (basic validation)
export const validatePostalCode = (code, country = 'US') => {
  if (!code) return null; // If not required, empty is valid
  
  // Simple US zip code validation
  if (country === 'US') {
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    return usZipRegex.test(code) ? null : 'Invalid US ZIP code';
  }
  
  // Basic validation for other countries
  if (code.length < 3) {
    return 'Postal code seems too short';
  }
  
  return null; // Valid
};

// Validate date format and if it's a valid date
export const validateDate = (dateString) => {
  if (!dateString) return null; // If not required, empty is valid
  
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return null; // Valid
};

// Validate future date
export const validateFutureDate = (dateString) => {
  if (!dateString) return null; // If not required, empty is valid
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Check if the date is in the future
  if (date < today) {
    return 'Date must be in the future';
  }
  
  return null; // Valid
};

// Run multiple validations and return the first error
export const runValidations = (value, validations) => {
  for (const validation of validations) {
    const error = validation(value);
    if (error) return error;
  }
  
  return null; // All validations passed
};

// Validate form object with validation schema
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationSchema).forEach(field => {
    const value = formData[field];
    const fieldValidations = validationSchema[field];
    
    const error = runValidations(value, fieldValidations);
    
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};