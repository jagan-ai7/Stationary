export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false, // show all errors
  });

  if (error) {
    const errors = error.details.map((err) => err.message);

    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};
