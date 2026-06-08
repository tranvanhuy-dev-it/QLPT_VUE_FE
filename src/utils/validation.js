/**
 * Validation utility functions for forms
 */

/**
 * Validates email format
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates phone number format (supports 9-12 digits, optional leading +)
 * @param {string} phone 
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  // Matches optional leading +, followed by 9 to 12 digits
  const phoneRegex = /^\+?[0-9]{9,12}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validates if the given date is before or equal to today (past date check)
 * @param {string|Date} dateString 
 * @returns {boolean}
 */
export const validatePastDate = (dateString) => {
  if (!dateString) return false;
  const inputDate = new Date(dateString);
  const today = new Date();
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return inputDate <= today;
};

/**
 * Validates if the start date is before the end date
 * @param {string|Date} startDateString 
 * @param {string|Date} endDateString 
 * @returns {boolean}
 */
export const validateDateRange = (startDateString, endDateString) => {
  if (!startDateString) return false;
  if (!endDateString) return true; // If no end date, it is open-ended
  const start = new Date(startDateString);
  const end = new Date(endDateString);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return start < end;
};
