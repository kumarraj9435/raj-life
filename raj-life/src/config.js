// Google Apps Script Web App URL
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykrAsVmCLmVlQygHsXqPCcskOxQVFJtBcQsjKLN504VFDw0Huz37hNw0avARDUYLJs/exec';

// Get current month string
export const getCurrentMonth = () => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
};
