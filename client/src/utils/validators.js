export const validateEmail    = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (pw)    => pw.length >= 6;
export const validateName     = (name)  => name.trim().length >= 2;
export const validatePhone    = (phone) => /^[0-9]{9,10}$/.test(phone.replace(/[-\s]/g, ''));