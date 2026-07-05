/**
 * Validate an email address.
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate a phone number.
 * @param {string} phone
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return { valid: false, message: 'Phone number is required' };
  }
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+234')) {
    if (cleaned.length !== 14) {
      return { valid: false, message: 'Nigerian phone number must be 14 digits with +234 prefix' };
    }
  } else if (cleaned.startsWith('0')) {
    if (cleaned.length !== 11) {
      return { valid: false, message: 'Phone number must be 11 digits starting with 0' };
    }
  } else {
    if (cleaned.length < 7 || cleaned.length > 15) {
      return { valid: false, message: 'Please enter a valid phone number' };
    }
  }
  return { valid: true, message: '' };
}

/**
 * Validate that a value is not empty.
 * @param {*} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, message: string }}
 */
export function validateRequired(value, fieldName = 'This field') {
  if (value === null || value === undefined) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (typeof value === 'string' && !value.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate that a value is a valid positive number.
 * @param {*} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, message: string }}
 */
export function validateNumber(value, fieldName = 'This field') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }
  if (num < 0) {
    return { valid: false, message: `${fieldName} must be a positive number` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate an entire form by running an array of field validations.
 * @param {Array<{ value: *, validator: Function, args?: Array }>} fields
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateForm(fields) {
  const errors = [];
  let valid = true;

  for (const field of fields) {
    const args = field.args || [];
    const result = field.validator(field.value, ...args);
    if (!result.valid) {
      valid = false;
      errors.push(result.message);
    }
  }

  return { valid, errors };
}
