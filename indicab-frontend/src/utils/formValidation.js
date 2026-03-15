import * as yup from 'yup';

/**
 * Common validation schemas and utilities for forms
 */

// Email validation pattern
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation pattern (Indian format)
export const phoneRegex = /^[6-9]\d{9}$/;

// License number pattern
export const licenseRegex = /^[A-Z]{2}[-/]?\d{1,2}[-/]?\d{1,4}[-/]?\d{1,7}$/;

// Common validation messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid 10-digit phone number',
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must not exceed ${max} characters`,
  minValue: (min) => `Must be at least ${min}`,
  maxValue: (max) => `Must not exceed ${max}`,
  password: 'Password must contain uppercase, lowercase, number and symbol',
  passwordMatch: 'Passwords do not match',
  dateRange: 'End date must be after start date',
  license: 'Please enter a valid license number',
};

/**
 * Booking Form Validation Schema
 */
export const bookingFormSchema = yup.object().shape({
  tripType: yup.string().oneOf(['oneway', 'roundtrip', 'rental']).required(validationMessages.required),
  fromCity: yup.string().min(2).required(validationMessages.required),
  toCity: yup.string().min(2).required(validationMessages.required),
  departDate: yup.date().required(validationMessages.required).typeError('Please select a departure date'),
  returnDate: yup.date().when('tripType', (tripType, schema) => {
    return tripType === 'roundtrip' ? schema.required(validationMessages.required) : schema.nullable();
  }),
  passengerName: yup.string().min(2, validationMessages.minLength(2)).required(validationMessages.required),
  passengerEmail: yup.string().matches(emailRegex, validationMessages.email).required(validationMessages.required),
  passengerPhone: yup.string().matches(phoneRegex, validationMessages.phone).required(validationMessages.required),
  pickupAddress: yup.string().min(5, validationMessages.minLength(5)).required(validationMessages.required),
  dropoffAddress: yup.string().min(5, validationMessages.minLength(5)).required(validationMessages.required),
  passengerCount: yup.number().min(1, 'At least 1 passenger required').required(validationMessages.required),
  specialRequirements: yup.string().max(500, validationMessages.maxLength(500)),
  hasLicense: yup.string().oneOf(['yes', 'no']).required(validationMessages.required),
  licenseNumber: yup.string().when('hasLicense', (hasLicense, schema) => {
    return hasLicense === 'yes' ? schema.matches(licenseRegex, validationMessages.license).required() : schema.nullable();
  }),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

/**
 * User Registration Validation Schema
 */
export const registrationSchema = yup.object().shape({
  name: yup.string().min(2, validationMessages.minLength(2)).required(validationMessages.required),
  email: yup.string().matches(emailRegex, validationMessages.email).required(validationMessages.required),
  phone: yup.string().matches(phoneRegex, validationMessages.phone).required(validationMessages.required),
  password: yup.string()
    .min(8, validationMessages.minLength(8))
    .matches(/[A-Z]/, 'Password must contain an uppercase letter')
    .matches(/[a-z]/, 'Password must contain a lowercase letter')
    .matches(/[0-9]/, 'Password must contain a number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain a special character')
    .required(validationMessages.required),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], validationMessages.passwordMatch)
    .required(validationMessages.required),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

/**
 * Login Validation Schema
 */
export const loginSchema = yup.object().shape({
  email: yup.string().matches(emailRegex, validationMessages.email).required(validationMessages.required),
  password: yup.string().min(6).required(validationMessages.required),
});

/**
 * Contact Form Validation Schema
 */
export const contactFormSchema = yup.object().shape({
  name: yup.string().min(2, validationMessages.minLength(2)).required(validationMessages.required),
  email: yup.string().matches(emailRegex, validationMessages.email).required(validationMessages.required),
  phone: yup.string().matches(phoneRegex, validationMessages.phone),
  subject: yup.string().min(5, validationMessages.minLength(5)).required(validationMessages.required),
  message: yup.string().min(10, validationMessages.minLength(10)).max(1000, validationMessages.maxLength(1000)).required(validationMessages.required),
});

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value to validate
 * @param {object} schema - Yup schema to use for validation
 * @returns {Promise<string|null>} Error message or null if valid
 */
export const validateField = async (fieldName, value, schema) => {
  try {
    const fieldSchema = yup.reach(schema, fieldName);
    await fieldSchema.validate(value);
    return null;
  } catch (error) {
    return error.message;
  }
};

/**
 * Validate entire form
 * @param {object} values - Form values to validate
 * @param {object} schema - Yup schema to use for validation
 * @returns {Promise<object>} Object with field errors
 */
export const validateForm = async (values, schema) => {
  const errors = {};
  try {
    await schema.validate(values, { abortEarly: false });
  } catch (error) {
    if (error.inner) {
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
    }
  }
  return errors;
};

/**
 * Custom validation functions
 */

/**
 * Validate date range (start date before end date)
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

/**
 * Validate if date is in future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  return new Date(date) > new Date();
};

/**
 * Validate if date is not in past
 */
export const isNotPastDate = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) >= today;
};

/**
 * Validate Indian phone number
 */
export const isValidIndianPhone = (phone) => {
  return phoneRegex.test(phone);
};

/**
 * Validate Indian license number
 */
export const isValidLicenseNumber = (license) => {
  return licenseRegex.test(license);
};

/**
 * Validate vehicle capacity vs passenger count
 */
export const isValidPassengerCount = (passengerCount, vehicleCapacity) => {
  return passengerCount > 0 && passengerCount <= vehicleCapacity;
};

/**
 * Sanitize form data (remove extra whitespace, trim)
 */
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (typeof value === 'number') {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Format phone number to display format
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
};

/**
 * Get field validation status
 * @param {string} fieldName - Field name
 * @param {object} errors - Errors object
 * @param {object} touched - Touched object (for dirty form tracking)
 * @returns {object} { error, showError, status }
 */
export const getFieldStatus = (fieldName, errors, touched) => {
  const hasError = !!errors[fieldName];
  const isTouched = touched[fieldName];
  const showError = hasError && isTouched;

  return {
    error: errors[fieldName] || null,
    showError,
    status: showError ? 'error' : hasError ? 'pending' : 'valid',
  };
};

/**
 * Hook for form validation with Formik/React Hook Form integration
 * Usage: useFormValidation(formSchema, onSubmit)
 */
export const useFormValidation = (initialValues, validationSchema, onSubmit) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({ ...prev, [name]: newValue }));

    // Real-time validation
    const fieldError = await validateField(name, newValue, validationSchema);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    } else {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formErrors = await validateForm(values, validationSchema);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(sanitizeFormData(values));
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue: (name, value) => setValues(prev => ({ ...prev, [name]: value })),
    setFieldError: (name, error) => setErrors(prev => ({ ...prev, [name]: error })),
  };
};
