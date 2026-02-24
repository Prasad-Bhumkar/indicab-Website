import * as yup from 'yup';

// Common field schemas
const emailSchema = yup
  .string('Email must be a string')
  .email('Please enter a valid email address')
  .required('Email is required');

const phoneSchema = yup
  .string('Phone must be a string')
  .matches(/^[0-9\-\+\s\(\)]{10,}$/, 'Please enter a valid phone number')
  .required('Phone number is required');

const nameSchema = yup
  .string('Name must be a string')
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .required('Name is required');

const passwordSchema = yup
  .string('Password must be a string')
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password cannot exceed 100 characters')
  .required('Password is required');

// Admin login validation schema
export const adminLoginValidationSchema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
});

// User validation schema
export const userValidationSchema = yup.object().shape({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  status: yup
    .string('Status must be a string')
    .oneOf(['active', 'inactive', 'suspended'], 'Invalid status')
    .required('Status is required'),
});

// Driver validation schema
export const driverValidationSchema = yup.object().shape({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  licenseNumber: yup
    .string('License number must be a string')
    .min(5, 'License number must be at least 5 characters')
    .max(20, 'License number cannot exceed 20 characters')
    .required('License number is required'),
  vehicleInfo: yup.string('Vehicle info must be a string'),
  status: yup
    .string('Status must be a string')
    .oneOf(['pending', 'approved', 'rejected', 'suspended'], 'Invalid status'),
});

// Blog validation schema
export const blogValidationSchema = yup.object().shape({
  title: yup
    .string('Title must be a string')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .required('Title is required'),
  content: yup
    .string('Content must be a string')
    .min(50, 'Content must be at least 50 characters')
    .required('Content is required'),
  preview: yup
    .string('Preview must be a string')
    .min(20, 'Preview must be at least 20 characters')
    .max(500, 'Preview cannot exceed 500 characters'),
  category: yup
    .string('Category must be a string')
    .required('Category is required'),
  image: yup.string('Image URL must be a string'),
  status: yup
    .string('Status must be a string')
    .oneOf(['published', 'draft'], 'Invalid status')
    .required('Status is required'),
});

// Package validation schema
export const packageValidationSchema = yup.object().shape({
  name: yup
    .string('Package name must be a string')
    .min(3, 'Package name must be at least 3 characters')
    .max(100, 'Package name cannot exceed 100 characters')
    .required('Package name is required'),
  type: yup
    .string('Type must be a string')
    .oneOf(['hourly', 'regional', 'national', 'corporate'], 'Invalid package type')
    .required('Package type is required'),
  baseFare: yup
    .number('Base fare must be a number')
    .positive('Base fare must be greater than 0')
    .required('Base fare is required'),
  duration: yup
    .string('Duration must be a string')
    .required('Duration is required'),
  validity: yup
    .string('Validity must be a string')
    .required('Validity is required'),
  description: yup
    .string('Description must be a string')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  discountPercentage: yup
    .number('Discount percentage must be a number')
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%'),
  features: yup
    .string('Features must be a string')
    .transform((value) => {
      // Convert comma-separated string to array if needed
      if (typeof value === 'string') {
        return value.split(',').map((f) => f.trim());
      }
      return value;
    }),
});

// Vehicle validation schema
export const vehicleValidationSchema = yup.object().shape({
  type: yup
    .string('Vehicle type must be a string')
    .min(2, 'Vehicle type must be at least 2 characters')
    .max(50, 'Vehicle type cannot exceed 50 characters')
    .required('Vehicle type is required'),
  baseFare: yup
    .number('Base fare must be a number')
    .positive('Base fare must be greater than 0')
    .required('Base fare is required'),
  ratePerKm: yup
    .number('Rate per km must be a number')
    .positive('Rate per km must be greater than 0')
    .required('Rate per km is required'),
  perDayCharge: yup
    .number('Per day charge must be a number')
    .positive('Per day charge must be greater than 0'),
  capacity: yup
    .number('Capacity must be a number')
    .positive('Capacity must be greater than 0')
    .integer('Capacity must be a whole number')
    .required('Capacity is required'),
  description: yup
    .string('Description must be a string')
    .max(500, 'Description cannot exceed 500 characters'),
  image: yup.string('Image URL must be a string'),
});

// Booking validation schema
export const bookingValidationSchema = yup.object().shape({
  userId: yup
    .number('User ID must be a number')
    .required('User ID is required'),
  from: yup
    .string('Pickup location must be a string')
    .required('Pickup location is required'),
  to: yup
    .string('Dropoff location must be a string')
    .required('Dropoff location is required'),
  date: yup
    .date('Date must be a valid date')
    .min(new Date(), 'Booking date must be in the future')
    .required('Booking date is required'),
  vehicleType: yup
    .string('Vehicle type must be a string')
    .required('Vehicle type is required'),
  status: yup
    .string('Status must be a string')
    .oneOf(['pending', 'completed', 'cancelled', 'ongoing'], 'Invalid status'),
  paymentStatus: yup
    .string('Payment status must be a string')
    .oneOf(['pending', 'completed', 'failed'], 'Invalid payment status'),
});

// Helper function to validate form data
export const validateFormData = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error.inner) {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { form: error.message } };
  }
};

// Helper function to get field error
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || '';
};

// Helper function to check if field has error
export const hasFieldError = (errors, fieldName) => {
  return Boolean(errors[fieldName]);
};
