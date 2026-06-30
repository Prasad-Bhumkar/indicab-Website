import { describe, it, expect } from 'vitest';
import {
  emailRegex,
  phoneRegex,
  licenseRegex,
  validationMessages,
  bookingFormSchema,
  registrationSchema,
  loginSchema,
  contactFormSchema,
  validateField,
  validateForm,
  isValidDateRange,
  isFutureDate,
  isNotPastDate,
  isValidIndianPhone,
  isValidLicenseNumber,
  isValidPassengerCount,
  sanitizeFormData,
  formatPhoneNumber,
  getFieldStatus,
} from '../../utils/formValidation';

// ---------------------------------------------------------------------------
// emailRegex
// ---------------------------------------------------------------------------
describe('emailRegex', () => {
  it('should match standard valid emails', () => {
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('first.last@domain.co.in')).toBe(true);
    expect(emailRegex.test('user+tag@domain.org')).toBe(true);
  });

  it('should reject invalid email strings', () => {
    expect(emailRegex.test('')).toBe(false);
    expect(emailRegex.test('notanemail')).toBe(false);
    expect(emailRegex.test('@domain.com')).toBe(false);
    expect(emailRegex.test('user@')).toBe(false);
    expect(emailRegex.test('user @domain.com')).toBe(false);
    expect(emailRegex.test('user@domain')).toBe(false);
    expect(emailRegex.test('user@.com')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// phoneRegex
// ---------------------------------------------------------------------------
describe('phoneRegex', () => {
  it('should match valid Indian mobile numbers (starting 6-9, 10 digits)', () => {
    expect(phoneRegex.test('9876543210')).toBe(true);
    expect(phoneRegex.test('6123456789')).toBe(true);
    expect(phoneRegex.test('9123456789')).toBe(true);
    expect(phoneRegex.test('8123456789')).toBe(true);
  });

  it('should reject numbers not starting with 6-9', () => {
    expect(phoneRegex.test('5123456789')).toBe(false);
    expect(phoneRegex.test('1123456789')).toBe(false);
  });

  it('should reject wrong length', () => {
    expect(phoneRegex.test('987654321')).toBe(false);
    expect(phoneRegex.test('98765432101')).toBe(false);
  });

  it('should reject non-numeric input', () => {
    expect(phoneRegex.test('abcdefghij')).toBe(false);
    expect(phoneRegex.test('98765abcde')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(phoneRegex.test('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// licenseRegex
// ---------------------------------------------------------------------------
describe('licenseRegex', () => {
  it('should match valid Indian license number formats', () => {
    expect(licenseRegex.test('KA01234567890')).toBe(true);
    expect(licenseRegex.test('MH121234567')).toBe(true);
    expect(licenseRegex.test('DL-01-1234-56789')).toBe(true);
    expect(licenseRegex.test('GJ/05/1234/5678')).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(licenseRegex.test('')).toBe(false);
    expect(licenseRegex.test('INVALID')).toBe(false);
    expect(licenseRegex.test('12-AB-34')).toBe(false);
    expect(licenseRegex.test('ABCDEFGHIJ')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validationMessages
// ---------------------------------------------------------------------------
describe('validationMessages', () => {
  it('should have static message strings', () => {
    expect(validationMessages.required).toBe('This field is required');
    expect(validationMessages.email).toBe('Please enter a valid email address');
    expect(validationMessages.phone).toBe('Please enter a valid 10-digit phone number');
    expect(validationMessages.password).toBe('Password must contain uppercase, lowercase, number and symbol');
    expect(validationMessages.passwordMatch).toBe('Passwords do not match');
    expect(validationMessages.dateRange).toBe('End date must be after start date');
    expect(validationMessages.license).toBe('Please enter a valid license number');
  });

  it('should produce parameterized messages', () => {
    expect(validationMessages.minLength(5)).toBe('Must be at least 5 characters');
    expect(validationMessages.maxLength(200)).toBe('Must not exceed 200 characters');
    expect(validationMessages.minValue(10)).toBe('Must be at least 10');
    expect(validationMessages.maxValue(99)).toBe('Must not exceed 99');
  });
});

// ---------------------------------------------------------------------------
// bookingFormSchema
// ---------------------------------------------------------------------------
describe('bookingFormSchema', () => {
  const validBooking = {
    tripType: 'oneway',
    fromCity: 'Mumbai',
    toCity: 'Delhi',
    departDate: '2026-07-15',
    passengerName: 'Ravi Sharma',
    passengerEmail: 'ravi@example.com',
    passengerPhone: '9876543210',
    pickupAddress: '123 Main Street, Andheri, Mumbai',
    dropoffAddress: '456 Park Avenue, Connaught Place, Delhi',
    passengerCount: 2,
    hasLicense: 'no',
    termsAccepted: true,
  };

  it('should validate a fully valid booking', async () => {
    await expect(bookingFormSchema.validate(validBooking)).resolves.toBeTruthy();
  });

  it('should reject an empty object', async () => {
    await expect(bookingFormSchema.validate({})).rejects.toThrow();
  });

  it('should reject missing required fromCity', async () => {
    await expect(
      bookingFormSchema.validate({ ...validBooking, fromCity: '' }),
    ).rejects.toThrow('fromCity must be at least 2 characters');
  });

  it('should reject invalid email', async () => {
    await expect(
      bookingFormSchema.validate({ ...validBooking, passengerEmail: 'bad' }),
    ).rejects.toThrow('Please enter a valid email address');
  });

  it('should reject invalid phone', async () => {
    await expect(
      bookingFormSchema.validate({ ...validBooking, passengerPhone: '1234' }),
    ).rejects.toThrow('Please enter a valid 10-digit phone number');
  });

  it('should accept roundtrip even without returnDate', async () => {
    await expect(
      bookingFormSchema.validate({ ...validBooking, tripType: 'roundtrip' }),
    ).resolves.toBeTruthy();
  });

  it('should accept missing returnDate for oneway trips', async () => {
    await expect(
      bookingFormSchema.validate(validBooking),
    ).resolves.toBeTruthy();
  });

  it('should accept hasLicense=yes even without licenseNumber', async () => {
    await expect(
      bookingFormSchema.validate({ ...validBooking, hasLicense: 'yes' }),
    ).resolves.toBeTruthy();
  });

  it('should skip license validation when hasLicense is no', async () => {
    await expect(
      bookingFormSchema.validate(validBooking),
    ).resolves.toBeTruthy();
  });

  it('should reject unaccepted terms', async () => {
    await expect(
      bookingFormSchema.validate({ ...validBooking, termsAccepted: false }),
    ).rejects.toThrow('You must accept the terms and conditions');
  });

  it('should reject invalid tripType', async () => {
    await expect(
      bookingFormSchema.validate({ ...validBooking, tripType: 'invalid' }),
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// registrationSchema
// ---------------------------------------------------------------------------
describe('registrationSchema', () => {
  const valid = {
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '9876543210',
    password: 'Strong@123',
    confirmPassword: 'Strong@123',
    termsAccepted: true,
  };

  it('should validate a valid registration', async () => {
    await expect(registrationSchema.validate(valid)).resolves.toBeTruthy();
  });

  it('should reject too-short password', async () => {
    const pwd = 'Ab1@';
    await expect(
      registrationSchema.validate({ ...valid, password: pwd, confirmPassword: pwd }),
    ).rejects.toThrow('Must be at least 8 characters');
  });

  it('should reject password missing uppercase', async () => {
    const pwd = 'lowercase1@';
    await expect(
      registrationSchema.validate({ ...valid, password: pwd, confirmPassword: pwd }),
    ).rejects.toThrow('Password must contain an uppercase letter');
  });

  it('should reject password missing lowercase', async () => {
    const pwd = 'UPPERCASE1@';
    await expect(
      registrationSchema.validate({ ...valid, password: pwd, confirmPassword: pwd }),
    ).rejects.toThrow('Password must contain a lowercase letter');
  });

  it('should reject password missing number', async () => {
    const pwd = 'NoNumber@a';
    await expect(
      registrationSchema.validate({ ...valid, password: pwd, confirmPassword: pwd }),
    ).rejects.toThrow('Password must contain a number');
  });

  it('should reject password missing special character', async () => {
    const pwd = 'NoSymbol1a';
    await expect(
      registrationSchema.validate({ ...valid, password: pwd, confirmPassword: pwd }),
    ).rejects.toThrow('Password must contain a special character');
  });

  it('should reject mismatched confirmPassword', async () => {
    await expect(
      registrationSchema.validate({ ...valid, confirmPassword: 'Different@1' }),
    ).rejects.toThrow('Passwords do not match');
  });

  it('should reject unaccepted terms', async () => {
    await expect(
      registrationSchema.validate({ ...valid, termsAccepted: false }),
    ).rejects.toThrow('You must accept the terms and conditions');
  });
});

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe('loginSchema', () => {
  it('should validate a valid login', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: 'validPass123' }),
    ).resolves.toBeTruthy();
  });

  it('should reject empty email', async () => {
    await expect(
      loginSchema.validate({ email: '', password: 'password' }),
    ).rejects.toThrow();
  });

  it('should reject invalid email format', async () => {
    await expect(
      loginSchema.validate({ email: 'bad', password: 'password' }),
    ).rejects.toThrow();
  });

  it('should reject short password (under 6 chars)', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: 'abc' }),
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// contactFormSchema
// ---------------------------------------------------------------------------
describe('contactFormSchema', () => {
  it('should validate a full valid submission', async () => {
    await expect(
      contactFormSchema.validate({
        name: 'Sneha Kapoor',
        email: 'sneha@example.com',
        phone: '9876543210',
        subject: 'Booking assistance needed',
        message: 'I am having trouble with my recent booking confirmation.',
      }),
    ).resolves.toBeTruthy();
  });

  it('should accept submission without phone', async () => {
    await expect(
      contactFormSchema.validate({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'General inquiry',
        message: 'Thanks for the service. Keep it up!',
      }),
    ).resolves.toBeTruthy();
  });

  it('should reject short subject', async () => {
    await expect(
      contactFormSchema.validate({
        name: 'Test',
        email: 'test@example.com',
        subject: 'Hi',
        message: 'A longer message here for validation.',
      }),
    ).rejects.toThrow('Must be at least 5 characters');
  });

  it('should reject short message', async () => {
    await expect(
      contactFormSchema.validate({
        name: 'Test',
        email: 'test@example.com',
        subject: 'Valid subject here',
        message: 'Short',
      }),
    ).rejects.toThrow('Must be at least 10 characters');
  });
});

// ---------------------------------------------------------------------------
// validateField
// ---------------------------------------------------------------------------
describe('validateField', () => {
  it('should return null for a valid field', async () => {
    const error = await validateField('email', 'test@example.com', registrationSchema);
    expect(error).toBeNull();
  });

  it('should return error message for an invalid field', async () => {
    const error = await validateField('email', 'invalid', registrationSchema);
    expect(error).toBe('Please enter a valid email address');
  });

  it('should return null for a valid password field', async () => {
    const error = await validateField('password', 'Strong@123', registrationSchema);
    expect(error).toBeNull();
  });

  it('should return error for too-short field', async () => {
    const error = await validateField('name', '', registrationSchema);
    expect(error).toBe('Must be at least 2 characters');
  });
});

// ---------------------------------------------------------------------------
// validateForm
// ---------------------------------------------------------------------------
describe('validateForm', () => {
  it('should return empty object for valid form', async () => {
    const errors = await validateForm(
      { email: 'test@example.com', password: 'password123' },
      loginSchema,
    );
    expect(errors).toEqual({});
  });

  it('should return errors object for invalid form', async () => {
    const errors = await validateForm({ email: '', password: '' }, loginSchema);
    expect(Object.keys(errors).length).toBeGreaterThan(0);
    expect(errors).toHaveProperty('email');
    expect(errors).toHaveProperty('password');
  });

  it('should capture multiple field errors', async () => {
    const errors = await validateForm({}, registrationSchema);
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// isValidDateRange
// ---------------------------------------------------------------------------
describe('isValidDateRange', () => {
  it('should return true when start is before end', () => {
    expect(isValidDateRange('2026-01-01', '2026-06-01')).toBe(true);
  });

  it('should return false when start is after end', () => {
    expect(isValidDateRange('2026-06-01', '2026-01-01')).toBe(false);
  });

  it('should return false when dates are equal', () => {
    expect(isValidDateRange('2026-01-01', '2026-01-01')).toBe(false);
  });

  it('should return false when either date is null', () => {
    expect(isValidDateRange(null, '2026-06-01')).toBe(false);
    expect(isValidDateRange('2026-01-01', null)).toBe(false);
    expect(isValidDateRange(null, null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isFutureDate
// ---------------------------------------------------------------------------
describe('isFutureDate', () => {
  it('should return true for a date in the future', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isFutureDate(future)).toBe(true);
  });

  it('should return false for a date in the past', () => {
    expect(isFutureDate('2020-01-01')).toBe(false);
  });

  it('should return false for null input', () => {
    expect(isFutureDate(null)).toBe(false);
    expect(isFutureDate(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isNotPastDate
// ---------------------------------------------------------------------------
describe('isNotPastDate', () => {
  it('should return true for today', () => {
    expect(isNotPastDate(new Date())).toBe(true);
  });

  it('should return true for a future date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isNotPastDate(future)).toBe(true);
  });

  it('should return false for a past date', () => {
    expect(isNotPastDate('2020-01-01')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isNotPastDate(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidIndianPhone
// ---------------------------------------------------------------------------
describe('isValidIndianPhone', () => {
  it('should return true for valid phone', () => {
    expect(isValidIndianPhone('9876543210')).toBe(true);
  });

  it('should return false for invalid phone', () => {
    expect(isValidIndianPhone('1234567890')).toBe(false);
    expect(isValidIndianPhone('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidLicenseNumber
// ---------------------------------------------------------------------------
describe('isValidLicenseNumber', () => {
  it('should return true for valid license', () => {
    expect(isValidLicenseNumber('KA01234567890')).toBe(true);
  });

  it('should return false for invalid license', () => {
    expect(isValidLicenseNumber('')).toBe(false);
    expect(isValidLicenseNumber('INVALID')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidPassengerCount
// ---------------------------------------------------------------------------
describe('isValidPassengerCount', () => {
  it('should validate when count is within capacity', () => {
    expect(isValidPassengerCount(3, 5)).toBe(true);
    expect(isValidPassengerCount(1, 1)).toBe(true);
  });

  it('should reject when count exceeds capacity', () => {
    expect(isValidPassengerCount(6, 5)).toBe(false);
  });

  it('should reject zero or negative passenger count', () => {
    expect(isValidPassengerCount(0, 5)).toBe(false);
    expect(isValidPassengerCount(-1, 5)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// sanitizeFormData
// ---------------------------------------------------------------------------
describe('sanitizeFormData', () => {
  it('should trim whitespace from string values', () => {
    const result = sanitizeFormData({
      name: '  John  ',
      email: '  test@test.com ',
      address: '  Mumbai  ',
    });
    expect(result.name).toBe('John');
    expect(result.email).toBe('test@test.com');
    expect(result.address).toBe('Mumbai');
  });

  it('should preserve number values', () => {
    const result = sanitizeFormData({ age: 25, count: 0, price: 99.99 });
    expect(result.age).toBe(25);
    expect(result.count).toBe(0);
    expect(result.price).toBe(99.99);
  });

  it('should preserve boolean values', () => {
    const result = sanitizeFormData({ active: true, agreed: false });
    expect(result.active).toBe(true);
    expect(result.agreed).toBe(false);
  });

  it('should pass through null and other types unchanged', () => {
    const result = sanitizeFormData({
      name: 'Test',
      extra: null,
      tags: ['a', 'b'],
    });
    expect(result.name).toBe('Test');
    expect(result.extra).toBeNull();
    expect(result.tags).toEqual(['a', 'b']);
  });
});

// ---------------------------------------------------------------------------
// formatPhoneNumber
// ---------------------------------------------------------------------------
describe('formatPhoneNumber', () => {
  it('should format a valid 10-digit number', () => {
    expect(formatPhoneNumber('9876543210')).toBe('+91 98765 43210');
  });

  it('should strip non-digit characters before formatting', () => {
    expect(formatPhoneNumber('98765 43210')).toBe('+91 98765 43210');
    expect(formatPhoneNumber('98765-43210')).toBe('+91 98765 43210');
  });

  it('should return the original string if not 10 digits after cleaning', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getFieldStatus
// ---------------------------------------------------------------------------
describe('getFieldStatus', () => {
  it('should return valid when no error and field not touched', () => {
    const result = getFieldStatus('email', {}, {});
    expect(result).toEqual({
      error: null,
      showError: false,
      status: 'valid',
    });
  });

  it('should return pending when error exists but field not touched', () => {
    const result = getFieldStatus('email', { email: 'Invalid' }, {});
    expect(result).toEqual({
      error: 'Invalid',
      showError: undefined,
      status: 'pending',
    });
  });

  it('should return error when error exists and field is touched', () => {
    const result = getFieldStatus('email', { email: 'Invalid' }, { email: true });
    expect(result).toEqual({
      error: 'Invalid',
      showError: true,
      status: 'error',
    });
  });

  it('should return valid when touched but no error', () => {
    const result = getFieldStatus('email', {}, { email: true });
    expect(result).toEqual({
      error: null,
      showError: false,
      status: 'valid',
    });
  });

  it('should return valid for non-existent fields', () => {
    const result = getFieldStatus('nonexistent', {}, {});
    expect(result.status).toBe('valid');
  });
});
