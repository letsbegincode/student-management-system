const { z } = require('zod');

const studentSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be at most 255 characters'),

  mobile: z
    .string({ required_error: 'Mobile number is required' })
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),

  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Gender must be Male, Female, or Other',
  }),

  dob: z
    .string({ required_error: 'Date of birth is required' })
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine((val) => {
      const age = (Date.now() - new Date(val).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 15;
    }, 'Student must be at least 15 years old')
    .refine((val) => {
      const age = (Date.now() - new Date(val).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age <= 60;
    }, 'Invalid date of birth'),

  course: z
    .string({ required_error: 'Course is required' })
    .trim()
    .min(2, 'Course must be at least 2 characters')
    .max(100, 'Course must be at most 100 characters'),

  year: z
    .number({ required_error: 'Year is required', invalid_type_error: 'Year must be a number' })
    .int('Year must be an integer')
    .min(1, 'Year must be between 1 and 6')
    .max(6, 'Year must be between 1 and 6'),

  address: z
    .string({ required_error: 'Address is required' })
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be at most 500 characters'),
});

// For updates, all fields are optional
const studentUpdateSchema = studentSchema.partial();

module.exports = { studentSchema, studentUpdateSchema };
