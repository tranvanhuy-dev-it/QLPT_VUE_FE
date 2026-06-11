/**
 * Utility functions to format date and time in the GMT+7 (Asia/Ho_Chi_Minh) timezone.
 */

/**
 * Formats a date string or Date object to DD/MM/YYYY in GMT+7.
 * @param {string|Date} dateOrStr 
 * @returns {string}
 */
export const formatDate = (dateOrStr) => {
  if (!dateOrStr) return '';
  try {
    const d = new Date(dateOrStr);
    if (isNaN(d.getTime())) return dateOrStr;
    
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const parts = formatter.formatToParts(d);
    const p = {};
    parts.forEach(part => {
      p[part.type] = part.value;
    });
    return `${p.day}/${p.month}/${p.year}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateOrStr;
  }
};

/**
 * Formats a date string or Date object to DD/MM/YYYY HH:mm in GMT+7.
 * @param {string|Date} dateOrStr 
 * @returns {string}
 */
export const formatDateTime = (dateOrStr) => {
  if (!dateOrStr) return '';
  try {
    const d = new Date(dateOrStr);
    if (isNaN(d.getTime())) return dateOrStr;
    
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(d);
    const p = {};
    parts.forEach(part => {
      p[part.type] = part.value;
    });
    return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
  } catch (e) {
    console.error('Error formatting datetime:', e);
    return dateOrStr;
  }
};
