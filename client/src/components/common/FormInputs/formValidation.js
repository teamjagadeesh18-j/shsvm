/**
 * Form validation and digit sanitization helpers.
 * Shared across PhoneInput, NumericInput, and form consumers.
 */

/**
 * Strips non-digits, strips leading +91 / 91 / 0 if present, and clamps to 10 digits.
 */
export function sanitizePhoneDigits(raw) {
  if (typeof raw !== 'string') return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

/**
 * Validates a 10-digit Indian mobile number.
 * Returns error string or null if valid.
 */
export function validatePhoneNumber(digits, isRequired = true) {
  if (!digits || digits.length === 0) {
    return isRequired ? 'Enter a 10-digit mobile number' : null;
  }
  if (!['6', '7', '8', '9'].includes(digits.charAt(0))) {
    return 'Mobile number must start with 6, 7, 8 or 9';
  }
  if (digits.length < 10) {
    return 'Enter a 10-digit mobile number';
  }
  return null;
}

/**
 * Strips all non-digit characters and optionally prevents leading zero.
 */
export function sanitizeNumericDigits(raw, { maxLength, disallowLeadingZero = false } = {}) {
  if (typeof raw !== 'string') return '';
  let digits = raw.replace(/\D/g, '');
  if (disallowLeadingZero && digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }
  if (typeof maxLength === 'number') {
    digits = digits.slice(0, maxLength);
  }
  return digits;
}

/**
 * Validates a standard Indian 6-digit postal pincode.
 */
export function validatePincode(digits, isRequired = true) {
  if (!digits || digits.length === 0) {
    return isRequired ? 'Enter a 6-digit postal pincode' : null;
  }
  if (digits.startsWith('0')) {
    return 'Pincode cannot start with 0';
  }
  if (digits.length !== 6) {
    return 'Pincode must be exactly 6 digits';
  }
  return null;
}

