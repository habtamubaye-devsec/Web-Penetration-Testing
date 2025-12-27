const validatePassword = (password) => {
  if (typeof password !== 'string' || password.trim().length === 0) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one capital letter (A-Z)' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one small letter (a-z)' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  // Treat "symbol" as non-alphanumeric, non-whitespace.
  // Spaces should NOT satisfy the symbol requirement.
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one symbol (e.g. !@#$)' };
  }

  return { isValid: true, message: null };
};

module.exports = validatePassword;
module.exports.default = validatePassword;
