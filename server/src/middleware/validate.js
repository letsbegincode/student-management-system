/**
 * Middleware factory that validates request body against a Zod schema.
 * Parses multipart form data fields — coerces `year` from string to number.
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Multipart forms send everything as strings, so coerce `year`
    const data = { ...req.body };
    if (data.year !== undefined) {
      data.year = Number(data.year);
    }

    const parsed = schema.parse(data);
    req.validatedBody = parsed;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const messages = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    next(error);
  }
};

module.exports = { validate };
